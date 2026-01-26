import os
import asyncio
import aiofiles
import hashlib
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from datetime import datetime, timedelta
from app.models import User, File, DownloadTask, AsyncTask
from app.schemas import (
    CreateDownloadTaskRequest,
    DownloadTaskResponse,
    DownloadTaskActionRequest,
    TaskResponse,
)
from app.config import settings
from app.exceptions import (
    FileOperationError,
    ResourceNotFoundError,
    ValidationError,
    NDDriveException,
)
import logging

logger = logging.getLogger(__name__)


class DownloadService:
    def __init__(self, db: Session):
        self.db = db
        self.download_dir = os.path.join(settings.upload_dir, "downloads")
        os.makedirs(self.download_dir, exist_ok=True)

    def create_download_task(
        self, user_id: int, request: CreateDownloadTaskRequest
    ) -> DownloadTaskResponse:
        file = (
            self.db.query(File)
            .filter(
                File.id == request.file_id,
                File.user_id == user_id,
                File.deleted_at.is_(None),
            )
            .first()
        )

        if not file:
            raise ResourceNotFoundError("File not found")

        if file.user_id != user_id:
            raise ValidationError("No permission to download this file")

        download_task = DownloadTask(
            user_id=user_id,
            file_id=request.file_id,
            task_type=request.task_type or "download",
            status="pending",
            progress=0,
            message="Download task created",
            task_params=json.dumps(request.task_params)
            if request.task_params
            else None,
        )

        self.db.add(download_task)
        self.db.commit()
        self.db.refresh(download_task)

        return self._task_to_response(download_task)

    def get_download_tasks(
        self, user_id: int, status: Optional[str] = None
    ) -> List[DownloadTaskResponse]:
        query = self.db.query(DownloadTask).filter(DownloadTask.user_id == user_id)

        if status:
            query = query.filter(DownloadTask.status == status)

        tasks = query.order_by(DownloadTask.created_at.desc()).all()
        return [self._task_to_response(task) for task in tasks]

    def get_download_task(
        self, user_id: int, task_id: int
    ) -> Optional[DownloadTaskResponse]:
        task = (
            self.db.query(DownloadTask)
            .filter(DownloadTask.id == task_id, DownloadTask.user_id == user_id)
            .first()
        )

        if not task:
            return None

        return self._task_to_response(task)

    def start_download_task(self, user_id: int, task_id: int) -> DownloadTaskResponse:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if task.status != "pending":
            raise ValidationError("Task is not in pending state")

        task.status = "downloading"
        task.started_at = datetime.now()
        task.message = "Download started"
        task.progress = 0

        self.db.commit()
        self.db.refresh(task)

        asyncio.create_task(self._execute_download_task(task))

        return self._task_to_response(task)

    def pause_download_task(self, user_id: int, task_id: int) -> DownloadTaskResponse:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if task.status not in ["downloading", "pending"]:
            raise ValidationError("Task cannot be paused")

        task.status = "paused"
        task.message = "Download paused"

        self.db.commit()
        self.db.refresh(task)

        return self._task_to_response(task)

    def resume_download_task(self, user_id: int, task_id: int) -> DownloadTaskResponse:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if task.status != "paused":
            raise ValidationError("Task is not in paused state")

        task.status = "downloading"
        task.message = "Download resumed"

        self.db.commit()
        self.db.refresh(task)

        asyncio.create_task(self._execute_download_task(task))

        return self._task_to_response(task)

    def cancel_download_task(self, user_id: int, task_id: int) -> DownloadTaskResponse:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if task.status in ["completed", "failed", "cancelled"]:
            raise ValidationError("Task cannot be cancelled")

        task.status = "cancelled"
        task.message = "Download cancelled"
        task.completed_at = datetime.now()

        self.db.commit()
        self.db.refresh(task)

        self._cleanup_download_files(task)

        return self._task_to_response(task)

    def delete_download_task(self, user_id: int, task_id: int) -> bool:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if not task:
            return False

        self._cleanup_download_files(task)

        self.db.delete(task)
        self.db.commit()

        return True

    def get_download_task_status(self, user_id: int, task_id: int) -> TaskResponse:
        task = self._get_task_by_id_and_user(task_id, user_id)

        if not task:
            raise ResourceNotFoundError("Task not found")

        return TaskResponse(
            task_id=task.id,
            task_type=task.task_type,
            status=task.status,
            progress=task.progress,
            message=task.message,
            result_data=json.loads(task.result_data) if task.result_data else None,
            error_details=task.error_details,
            created_at=task.created_at.isoformat() if task.created_at else None,
            updated_at=task.updated_at.isoformat() if task.updated_at else None,
            started_at=task.started_at.isoformat() if task.started_at else None,
            completed_at=task.completed_at.isoformat() if task.completed_at else None,
        )

    async def _execute_download_task(self, task: DownloadTask):
        try:
            file = self.db.query(File).filter(File.id == task.file_id).first()
            if not file:
                task.status = "failed"
                task.message = "File not found"
                task.error_details = "File not found in database"
                self.db.commit()
                return

            if not os.path.exists(file.storage_path):
                task.status = "failed"
                task.message = "File not found on disk"
                task.error_details = f"File not found at {file.storage_path}"
                self.db.commit()
                return

            download_path = os.path.join(self.download_dir, f"download_{task.id}")
            os.makedirs(download_path, exist_ok=True)

            await self._download_file(file, download_path, task)

            task.status = "completed"
            task.progress = 100
            task.message = "Download completed successfully"
            task.completed_at = datetime.now()
            task.result_data = json.dumps(
                {
                    "download_path": download_path,
                    "file_size": file.size,
                    "file_name": file.name,
                    "download_time": (
                        task.completed_at - task.started_at
                    ).total_seconds()
                    if task.started_at
                    else None,
                }
            )

        except Exception as e:
            task.status = "failed"
            task.message = "Download failed"
            task.error_details = str(e)
            task.completed_at = datetime.now()
            logger.error(f"Download task {task.id} failed: {str(e)}")

        finally:
            self.db.commit()

    async def _download_file(self, file: File, download_path: str, task: DownloadTask):
        chunk_size = 8192
        total_size = file.size
        downloaded_size = 0

        download_file_path = os.path.join(download_path, file.name)

        async with aiofiles.open(download_file_path, "wb") as download_file:
            with open(file.storage_path, "rb") as source_file:
                while downloaded_size < total_size:
                    if task.status == "cancelled":
                        raise Exception("Download cancelled")

                    if task.status == "paused":
                        await asyncio.sleep(1)
                        continue

                    chunk = source_file.read(chunk_size)
                    if not chunk:
                        break

                    await download_file.write(chunk)
                    downloaded_size += len(chunk)

                    progress = int((downloaded_size / total_size) * 100)
                    task.progress = progress
                    task.message = f"Downloading... {progress}%"

                    if downloaded_size % (chunk_size * 100) == 0:
                        self.db.commit()

        if os.path.exists(download_file_path):
            actual_size = os.path.getsize(download_file_path)
            if actual_size != total_size:
                raise Exception(
                    f"File size mismatch: expected {total_size}, got {actual_size}"
                )

    def _cleanup_download_files(self, task: DownloadTask):
        download_path = os.path.join(self.download_dir, f"download_{task.id}")
        if os.path.exists(download_path):
            try:
                import shutil

                shutil.rmtree(download_path)
            except Exception as e:
                logger.error(f"Failed to cleanup download files: {str(e)}")

    def _get_task_by_id_and_user(self, task_id: int, user_id: int) -> DownloadTask:
        task = (
            self.db.query(DownloadTask)
            .filter(DownloadTask.id == task_id, DownloadTask.user_id == user_id)
            .first()
        )

        if not task:
            raise ResourceNotFoundError("Download task not found")

        return task

    def _task_to_response(self, task: DownloadTask) -> DownloadTaskResponse:
        return DownloadTaskResponse(
            id=task.id,
            file_id=task.file_id,
            file_name=task.file.name if task.file else "",
            task_type=task.task_type,
            status=task.status,
            progress=task.progress,
            message=task.message,
            created_at=task.created_at,
            updated_at=task.updated_at,
            started_at=task.started_at,
            completed_at=task.completed_at,
        )

    def get_task_statistics(self, user_id: int) -> Dict[str, Any]:
        from sqlalchemy import func

        stats = (
            self.db.query(
                DownloadTask.status,
                func.count(DownloadTask.id).label("count"),
                func.sum(DownloadTask.progress).label("total_progress"),
            )
            .filter(DownloadTask.user_id == user_id)
            .group_by(DownloadTask.status)
            .all()
        )

        result = {}
        for stat in stats:
            result[stat.status] = {
                "count": stat.count,
                "average_progress": stat.total_progress // stat.count
                if stat.count > 0
                else 0,
            }

        return result

    def cleanup_old_tasks(self, days: int = 7):
        cutoff_date = datetime.now() - timedelta(days=days)

        old_tasks = (
            self.db.query(DownloadTask)
            .filter(
                DownloadTask.created_at < cutoff_date,
                DownloadTask.status.in_(["completed", "failed", "cancelled"]),
            )
            .all()
        )

        for task in old_tasks:
            self._cleanup_download_files(task)
            self.db.delete(task)

        self.db.commit()
        logger.info(f"Cleaned up {len(old_tasks)} old download tasks")
