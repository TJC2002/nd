from celery import Celery
from app.celery_app import celery_app
from app.database import SessionLocal
from app.services.download_service import DownloadService
from app.models import DownloadTask
from sqlalchemy.orm import Session
import logging
import asyncio
import aiofiles
import os
from datetime import datetime

logger = logging.getLogger(__name__)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@celery_app.task(bind=True, name="app.tasks.download_tasks.execute_download_task")
def execute_download_task(self, task_id: int):
    """Execute download task in Celery"""
    try:
        db = next(get_db())
        download_service = DownloadService(db)

        # Get task from database
        task = db.query(DownloadTask).filter(DownloadTask.id == task_id).first()
        if not task:
            logger.error(f"Download task {task_id} not found")
            return

        # Update task status
        task.status = "downloading"
        task.started_at = datetime.now()
        task.message = "Download started"
        task.progress = 0
        db.commit()

        # Execute download
        asyncio.run(_download_file_async(db, task))

    except Exception as e:
        logger.error(f"Error in download task {task_id}: {str(e)}")

        # Update task status
        db = next(get_db())
        task = db.query(DownloadTask).filter(DownloadTask.id == task_id).first()
        if task:
            task.status = "failed"
            task.message = f"Download failed: {str(e)}"
            task.error_details = str(e)
            task.completed_at = datetime.now()
            db.commit()

        raise e


async def _download_file_async(db: Session, task: DownloadTask):
    """Async file download implementation"""
    from app.models import File
    from app.config import settings

    try:
        # Get file information
        file = db.query(File).filter(File.id == task.file_id).first()
        if not file:
            raise Exception("File not found")

        # Check if file exists
        if not os.path.exists(file.storage_path):
            raise Exception(f"File not found at {file.storage_path}")

        # Create download directory
        download_dir = os.path.join(
            settings.upload_dir, "downloads", f"download_{task.id}"
        )
        os.makedirs(download_dir, exist_ok=True)

        # Download file
        await _download_file_with_progress(file, download_dir, task, db)

        # Update task status
        task.status = "completed"
        task.progress = 100
        task.message = "Download completed successfully"
        task.completed_at = datetime.now()
        task.result_data = {
            "download_path": os.path.join(download_dir, file.name),
            "file_size": file.size,
            "file_name": file.name,
            "download_time": (task.completed_at - task.started_at).total_seconds()
            if task.started_at
            else None,
        }

        logger.info(f"Download task {task_id} completed successfully")

    except Exception as e:
        logger.error(f"Error in _download_file_async: {str(e)}")
        raise e


async def _download_file_with_progress(
    file, download_dir: str, task: DownloadTask, db: Session
):
    """Download file with progress tracking"""
    chunk_size = 8192  # 8KB
    total_size = file.size
    downloaded_size = 0

    download_file_path = os.path.join(download_dir, file.name)

    async with aiofiles.open(download_file_path, "wb") as download_file:
        with open(file.storage_path, "rb") as source_file:
            while downloaded_size < total_size:
                # Check if task was cancelled
                updated_task = (
                    db.query(DownloadTask).filter(DownloadTask.id == task.id).first()
                )
                if updated_task and updated_task.status == "cancelled":
                    raise Exception("Download cancelled")

                # Read chunk
                chunk = source_file.read(chunk_size)
                if not chunk:
                    break

                # Write chunk
                await download_file.write(chunk)
                downloaded_size += len(chunk)

                # Update progress
                progress = int((downloaded_size / total_size) * 100)
                task.progress = progress
                task.message = f"Downloading... {progress}%"

                # Update database periodically
                if downloaded_size % (chunk_size * 100) == 0:  # Every 100 chunks
                    db.commit()

    # Verify downloaded file
    if os.path.exists(download_file_path):
        actual_size = os.path.getsize(download_file_path)
        if actual_size != total_size:
            raise Exception(
                f"File size mismatch: expected {total_size}, got {actual_size}"
            )


@celery_app.task(bind=True, name="app.tasks.download_tasks.cleanup_download_tasks")
def cleanup_download_tasks(self, days: int = 7):
    """Clean up old download tasks"""
    try:
        db = next(get_db())
        download_service = DownloadService(db)

        download_service.cleanup_old_tasks(days)

        logger.info(f"Cleaned up old download tasks older than {days} days")

    except Exception as e:
        logger.error(f"Error in cleanup_download_tasks: {str(e)}")
        raise e


@celery_app.task(bind=True, name="app.tasks.download_tasks.pause_download_task")
def pause_download_task(self, task_id: int):
    """Pause download task"""
    try:
        db = next(get_db())
        download_service = DownloadService(db)

        task = download_service.get_download_task(
            None, task_id
        )  # No user check for Celery task
        if not task:
            logger.error(f"Download task {task_id} not found")
            return

        task.status = "paused"
        task.message = "Download paused"
        db.commit()

        logger.info(f"Download task {task_id} paused")

    except Exception as e:
        logger.error(f"Error in pause_download_task: {str(e)}")
        raise e


@celery_app.task(bind=True, name="app.tasks.download_tasks.resume_download_task")
def resume_download_task(self, task_id: int):
    """Resume download task"""
    try:
        db = next(get_db())
        download_service = DownloadService(db)

        task = download_service.get_download_task(
            None, task_id
        )  # No user check for Celery task
        if not task:
            logger.error(f"Download task {task_id} not found")
            return

        if task.status != "paused":
            logger.warning(f"Task {task_id} is not in paused state")
            return

        task.status = "downloading"
        task.message = "Download resumed"
        db.commit()

        # Resume download by calling execute_download_task again
        execute_download_task.delay(task_id)

        logger.info(f"Download task {task_id} resumed")

    except Exception as e:
        logger.error(f"Error in resume_download_task: {str(e)}")
        raise e
