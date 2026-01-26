from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_active_user
from app.models import User
from app.services.download_service import DownloadService
from app.schemas import (
    CreateDownloadTaskRequest,
    DownloadTaskResponse,
    DownloadTaskActionRequest,
    TaskResponse,
    ApiResponse,
)
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/downloads", tags=["下载管理"])


@router.post("", response_model=dict)
async def create_download_task(
    request: CreateDownloadTaskRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.create_download_task(current_user.id, request)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to create download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create download task: {str(e)}",
        )


@router.get("", response_model=dict)
async def get_download_tasks(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        tasks = download_service.get_download_tasks(current_user.id, status)

        return ApiResponse.success([task.dict() for task in tasks])
    except Exception as e:
        logger.error(f"Failed to get download tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get download tasks: {str(e)}",
        )


@router.get("/{task_id}", response_model=dict)
async def get_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.get_download_task(current_user.id, task_id)

        if not task:
            return ApiResponse.error("Download task not found", 404)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to get download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get download task: {str(e)}",
        )


@router.post("/{task_id}/start", response_model=dict)
async def start_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.start_download_task(current_user.id, task_id)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to start download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start download task: {str(e)}",
        )


@router.post("/{task_id}/pause", response_model=dict)
async def pause_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.pause_download_task(current_user.id, task_id)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to pause download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to pause download task: {str(e)}",
        )


@router.post("/{task_id}/resume", response_model=dict)
async def resume_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.resume_download_task(current_user.id, task_id)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to resume download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resume download task: {str(e)}",
        )


@router.post("/{task_id}/cancel", response_model=dict)
async def cancel_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task = download_service.cancel_download_task(current_user.id, task_id)

        return ApiResponse.success(task.dict())
    except Exception as e:
        logger.error(f"Failed to cancel download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel download task: {str(e)}",
        )


@router.delete("/{task_id}", response_model=dict)
async def delete_download_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        success = download_service.delete_download_task(current_user.id, task_id)

        if not success:
            return ApiResponse.error("Download task not found", 404)

        return ApiResponse.success({"message": "Download task deleted successfully"})
    except Exception as e:
        logger.error(f"Failed to delete download task: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete download task: {str(e)}",
        )


@router.get("/{task_id}/status", response_model=dict)
async def get_download_task_status(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        task_status = download_service.get_download_task_status(
            current_user.id, task_id
        )

        return ApiResponse.success(task_status.dict())
    except Exception as e:
        logger.error(f"Failed to get download task status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get download task status: {str(e)}",
        )


@router.get("/statistics", response_model=dict)
async def get_download_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        statistics = download_service.get_task_statistics(current_user.id)

        return ApiResponse.success(statistics)
    except Exception as e:
        logger.error(f"Failed to get download statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get download statistics: {str(e)}",
        )


@router.post("/cleanup", response_model=dict)
async def cleanup_old_download_tasks(
    days: int = 7,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    try:
        download_service = DownloadService(db)
        download_service.cleanup_old_tasks(days)

        return ApiResponse.success(
            {"message": f"Cleaned up old download tasks older than {days} days"}
        )
    except Exception as e:
        logger.error(f"Failed to cleanup old download tasks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup old download tasks: {str(e)}",
        )
