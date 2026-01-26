from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# 认证相关
class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: EmailStr
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: int
    username: str
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    expires_in: int


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


# 用户相关
class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str] = None
    total_space: int
    used_space: int
    status: str
    created_at: datetime


class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


# 文件相关
class FileInfo(BaseModel):
    id: int
    user_id: int
    parent_folder_id: Optional[int] = None
    file_name: str
    original_name: str
    file_size: int
    file_type: Optional[str] = None
    mime_type: Optional[str] = None
    storage_path: str
    is_folder: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class FileMoveRequest(BaseModel):
    target_folder_id: int


class FileRenameRequest(BaseModel):
    new_name: str


class FolderCreateRequest(BaseModel):
    folder_name: str
    parent_folder_id: Optional[int] = None


class CheckFileRequest(BaseModel):
    file_name: str
    file_size: int
    file_hash: str


class CheckFileResponse(BaseModel):
    exists: bool
    file_id: Optional[int] = None
    file_path: Optional[str] = None


class UploadInitRequest(BaseModel):
    file_name: str
    file_size: int
    file_hash: str
    chunk_count: int
    parent_folder_id: Optional[int] = None


class UploadInitResponse(BaseModel):
    upload_id: str
    chunk_size: int
    upload_url: Optional[str] = None


class UploadCompleteRequest(BaseModel):
    upload_id: str
    file_name: str
    parent_folder_id: Optional[int] = None


class SearchResult(BaseModel):
    id: int
    file_name: str
    original_name: str
    file_size: int
    file_type: Optional[str] = None
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_folder: bool


class SearchRequest(BaseModel):
    keyword: Optional[str] = None
    file_type: Optional[str] = None
    min_size: Optional[int] = None
    max_size: Optional[int] = None
    folder_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    page: int = 0
    page_size: int = 20


# 分享相关
class CreateShareRequest(BaseModel):
    file_id: int
    expire_days: Optional[int] = 30
    password: Optional[str] = None
    max_access_count: Optional[int] = None


class ShareResponse(BaseModel):
    id: int
    share_code: str
    file_id: int
    file_name: str
    expire_days: int
    access_count: int
    max_access_count: Optional[int] = None
    created_at: datetime
    expire_at: Optional[datetime] = None


class VerifyShareRequest(BaseModel):
    share_code: str
    password: Optional[str] = None


# 存储相关
class CreateStorageNodeRequest(BaseModel):
    node_name: str
    storage_type: str
    storage_path: str
    capacity: int


class UpdateStorageNodeRequest(BaseModel):
    node_name: str
    storage_type: str
    storage_path: str
    capacity: int


class UpdateNodeStatusRequest(BaseModel):
    status: str


class StorageStatusResponse(BaseModel):
    total_capacity: int
    total_used_space: int
    available_space: int
    node_count: int


# 下载相关
class CreateDownloadTaskRequest(BaseModel):
    file_id: int
    task_type: str = "download"
    task_params: Optional[dict] = None


class DownloadTaskResponse(BaseModel):
    id: int
    file_id: int
    file_name: str
    task_type: str
    status: str
    progress: int
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class DownloadTaskActionRequest(BaseModel):
    action: str  # pause, resume, cancel


# 任务相关
class TaskSubmitRequest(BaseModel):
    file_id: int
    task_type: str
    task_params: Optional[dict] = None


class TaskResponse(BaseModel):
    task_id: int
    task_type: str
    status: str
    progress: int
    message: Optional[str] = None
    result_data: Optional[dict] = None
    error_details: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


# 收藏相关
class CollectionItemRequest(BaseModel):
    collection_id: int
    file_id: int


class CollectionItemResponse(BaseModel):
    id: int
    collection_id: int
    file_id: int
    file_name: str
    added_at: datetime


class CollectionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_public: bool
    created_at: datetime
    items: List[CollectionItemResponse] = []


# 通用响应
class ApiResponse(BaseModel):
    code: int = 200
    message: str = "success"
    data: Optional[dict] = None

    @classmethod
    def success(cls, data=None):
        return cls(code=200, message="success", data=data)

    @classmethod
    def error(cls, message="error", code=400):
        return cls(code=code, message=message, data=None)
