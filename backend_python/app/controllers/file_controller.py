from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Request,
)
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    FileInfo,
    FileMoveRequest,
    FileRenameRequest,
    FolderCreateRequest,
    CheckFileRequest,
    CheckFileResponse,
    UploadInitRequest,
    UploadInitResponse,
    UploadCompleteRequest,
    SearchResult,
    SearchRequest,
    ApiResponse,
)
from app.services.file_service import FileService
from app.services.share_service import ShareService
from app.dependencies import get_current_active_user
from app.models import User
from typing import Optional, List
import os

router = APIRouter(prefix="/files", tags=["文件管理"])


@router.get("", response_model=dict)
def get_files_by_folder_id(
    folder_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """获取文件列表"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))

        if folder_id is None or folder_id == 0:
            files = file_service.get_root_files(current_user.id)
        else:
            files = file_service.get_files_by_folder_id(folder_id)

        return {
            "code": 200,
            "message": "success",
            "data": [file.dict() for file in files],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get files: {str(e)}",
        )


@router.get("/path", response_model=dict)
def get_folder_path(
    folder_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
):
    """获取文件夹路径"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        path = file_service.get_folder_path(folder_id, current_user.id)

        return {
            "code": 200,
            "message": "success",
            "data": [file.dict() for file in path],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get folder path: {str(e)}",
        )


@router.get("/search", response_model=dict)
def search_files(
    keyword: Optional[str] = None,
    file_type: Optional[str] = None,
    min_size: Optional[int] = None,
    max_size: Optional[int] = None,
    folder_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    page: int = 0,
    page_size: int = 20,
    current_user: User = Depends(get_current_active_user),
):
    """搜索文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))

        # 处理日期字符串
        from datetime import datetime

        start_datetime = None
        end_datetime = None

        if start_date:
            start_datetime = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        if end_date:
            end_datetime = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

        search_request = SearchRequest(
            keyword=keyword,
            file_type=file_type,
            min_size=min_size,
            max_size=max_size,
            folder_id=folder_id,
            start_date=start_datetime,
            end_date=end_datetime,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
        )

        results = file_service.search_files(current_user.id, search_request)

        return {
            "code": 200,
            "message": "success",
            "data": [result.dict() for result in results],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search files: {str(e)}",
        )


@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    parent_folder_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
):
    """上传文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        uploaded_file = await file_service.upload_file(
            current_user.id, file, parent_folder_id
        )

        return {"code": 200, "message": "success", "data": uploaded_file.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


@router.get("/{file_id}", response_model=dict)
def get_file_by_id(file_id: int, current_user: User = Depends(get_current_active_user)):
    """获取文件信息"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file_info = file_service.get_file_by_id(file_id)

        if not file_info:
            return {"code": 404, "message": "File not found", "data": None}

        return {"code": 200, "message": "success", "data": file_info.dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get file: {str(e)}",
        )


@router.get("/{file_id}/download")
async def download_file(
    file_id: int, current_user: User = Depends(get_current_active_user)
):
    """下载文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file_info = file_service.get_file_by_id(file_id)

        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        if file_info.is_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot download folder"
            )

        # 返回文件路径，实际应用中应该返回文件流
        return {
            "file_path": file_info.storage_path,
            "file_name": file_info.file_name,
            "file_size": file_info.file_size,
            "mime_type": file_info.mime_type,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}",
        )


@router.put("/{file_id}/move", response_model=dict)
def move_file(
    file_id: int,
    request: FileMoveRequest,
    current_user: User = Depends(get_current_active_user),
):
    """移动文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file_service.move_file(file_id, request.target_folder_id)

        return {"code": 200, "message": "success", "data": "File moved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to move file: {str(e)}",
        )


@router.put("/{file_id}/rename", response_model=dict)
def rename_file(
    file_id: int,
    request: FileRenameRequest,
    current_user: User = Depends(get_current_active_user),
):
    """重命名文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file_service.rename_file(file_id, request.new_name)

        return {"code": 200, "message": "success", "data": "File renamed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rename file: {str(e)}",
        )


@router.delete("/{file_id}", response_model=dict)
def delete_file(file_id: int, current_user: User = Depends(get_current_active_user)):
    """删除文件"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file_service.delete_file(file_id)

        return {"code": 200, "message": "success", "data": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}",
        )


@router.post("/folders", response_model=dict)
def create_folder(
    request: FolderCreateRequest, current_user: User = Depends(get_current_active_user)
):
    """创建文件夹"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        folder = file_service.create_folder(
            current_user.id, request.folder_name, request.parent_folder_id
        )

        return {"code": 200, "message": "success", "data": folder.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create folder: {str(e)}",
        )


@router.post("/check", response_model=dict)
def check_file_exist(
    request: CheckFileRequest, current_user: User = Depends(get_current_active_user)
):
    """秒传检查"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        result = file_service.check_file_exist(request)

        return {"code": 200, "message": "success", "data": result.dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check file: {str(e)}",
        )


@router.post("/upload/init", response_model=dict)
def initialize_upload(
    request: UploadInitRequest, current_user: User = Depends(get_current_active_user)
):
    """上传初始化"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        result = file_service.initialize_upload(request)

        return {"code": 200, "message": "success", "data": result.dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize upload: {str(e)}",
        )


@router.post("/upload/chunk", response_model=dict)
async def upload_chunk(
    upload_id: str,
    chunk_index: int,
    chunk_data: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """分片上传"""
    try:
        # 这里应该实现分片上传逻辑
        return {
            "code": 200,
            "message": "success",
            "data": "Chunk uploaded successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload chunk: {str(e)}",
        )


@router.post("/upload/complete", response_model=dict)
def complete_upload(
    request: UploadCompleteRequest,
    current_user: User = Depends(get_current_active_user),
):
    """完成上传"""
    try:
        file_service = FileService(current_user.__dict__.get("_db"))
        file = file_service.complete_upload(request)

        return {"code": 200, "message": "success", "data": file.dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete upload: {str(e)}",
        )


@router.get("/upload/status/{upload_id}", response_model=dict)
def get_upload_status(
    upload_id: str, current_user: User = Depends(get_current_active_user)
):
    """获取上传状态"""
    try:
        # 这里应该查询上传任务状态
        return {
            "code": 200,
            "message": "success",
            "data": {"upload_id": upload_id, "status": "completed"},
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upload status: {str(e)}",
        )


@router.post("/upload/cancel/{upload_id}", response_model=dict)
def cancel_upload(
    upload_id: str, current_user: User = Depends(get_current_active_user)
):
    """取消上传"""
    try:
        # 这里应该取消上传任务
        return {
            "code": 200,
            "message": "success",
            "data": "Upload cancelled successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel upload: {str(e)}",
        )
