import os
import shutil
import hashlib
import aiofiles
from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from typing import List, Optional
from datetime import datetime
from app.models import User, File, StorageNode, UploadTask, FileMetadata
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
)
from app.config import settings
import json


class FileService:
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def get_root_files(self, user_id: int) -> List[FileInfo]:
        """获取用户根目录文件列表"""
        files = (
            self.db.query(File)
            .filter(
                File.user_id == user_id,
                File.parent_id.is_(None),
                File.deleted_at.is_(None),
            )
            .all()
        )
        return [self._file_to_info(file) for file in files]

    def get_files_by_folder_id(self, folder_id: Optional[int]) -> List[FileInfo]:
        """根据文件夹ID获取文件列表"""
        if folder_id is None or folder_id == 0:
            return []

        files = (
            self.db.query(File)
            .filter(File.parent_id == folder_id, File.deleted_at.is_(None))
            .all()
        )
        return [self._file_to_info(file) for file in files]

    def get_file_by_id(self, file_id: int) -> Optional[File]:
        """根据文件ID获取文件"""
        return (
            self.db.query(File)
            .filter(File.id == file_id, File.deleted_at.is_(None))
            .first()
        )

    def get_folder_path(self, folder_id: Optional[int], user_id: int) -> List[FileInfo]:
        """获取文件夹路径"""
        if folder_id is None or folder_id == 0:
            return []

        path = []
        current_id = folder_id

        while current_id:
            current_file = (
                self.db.query(File)
                .filter(
                    File.id == current_id,
                    File.user_id == user_id,
                    File.deleted_at.is_(None),
                )
                .first()
            )

            if not current_file:
                break

            path.insert(0, self._file_to_info(current_file))
            current_id = current_file.parent_id

        return path

    def create_folder(
        self, user_id: int, folder_name: str, parent_folder_id: Optional[int] = None
    ) -> FileInfo:
        """创建文件夹"""
        # 检查同名文件夹
        existing_file = (
            self.db.query(File)
            .filter(
                File.user_id == user_id,
                File.parent_id == parent_folder_id,
                File.name == folder_name,
                File.is_folder == True,
                File.deleted_at.is_(None),
            )
            .first()
        )

        if existing_file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Folder with same name already exists",
            )

        # 创建文件夹
        folder = File(
            user_id=user_id,
            parent_id=parent_folder_id,
            name=folder_name,
            size=0,
            hash_value="",
            file_type="folder",
            storage_path="",
            mime_type="",
            is_folder=True,
        )

        self.db.add(folder)
        self.db.commit()
        self.db.refresh(folder)

        return self._file_to_info(folder)

    def upload_file(
        self, user_id: int, file: UploadFile, parent_folder_id: Optional[int] = None
    ) -> FileInfo:
        """上传文件"""
        # 检查文件大小
        if file.size > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum limit of {settings.max_file_size} bytes",
            )

        # 生成文件哈希
        file_hash = self._calculate_file_hash(file)

        # 检查文件是否已存在（秒传）
        existing_file = (
            self.db.query(File)
            .filter(
                File.user_id == user_id,
                File.parent_id == parent_folder_id,
                File.name == file.filename,
                File.size == file.size,
                File.hash_value == file_hash,
                File.is_folder == False,
                File.deleted_at.is_(None),
            )
            .first()
        )

        if existing_file:
            return self._file_to_info(existing_file)

        # 生成存储路径
        storage_path = self._generate_storage_path(user_id, file.filename)

        # 创建文件记录
        file_record = File(
            user_id=user_id,
            parent_id=parent_folder_id,
            name=file.filename,
            size=file.size,
            hash_value=file_hash,
            file_type=self._get_file_type(file.filename),
            storage_path=storage_path,
            mime_type=file.content_type or "application/octet-stream",
            is_folder=False,
        )

        self.db.add(file_record)
        self.db.commit()
        self.db.refresh(file_record)

        # 保存文件
        self._save_file(file, storage_path)

        # 更新用户存储空间
        self._update_user_space(user_id, file.size)

        return self._file_to_info(file_record)

    def move_file(self, file_id: int, target_folder_id: Optional[int]) -> None:
        """移动文件"""
        file = self.get_file_by_id(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        file.parent_id = target_folder_id
        file.updated_at = datetime.utcnow()

        self.db.commit()

    def rename_file(self, file_id: int, new_name: str) -> None:
        """重命名文件"""
        file = self.get_file_by_id(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # 检查同名文件
        existing_file = (
            self.db.query(File)
            .filter(
                File.user_id == file.user_id,
                File.parent_id == file.parent_id,
                File.name == new_name,
                File.id != file_id,
                File.deleted_at.is_(None),
            )
            .first()
        )

        if existing_file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File with same name already exists",
            )

        file.name = new_name
        file.updated_at = datetime.utcnow()

        self.db.commit()

    def delete_file(self, file_id: int) -> None:
        """删除文件"""
        file = self.get_file_by_id(file_id)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # 标记为删除
        file.deleted_at = datetime.utcnow()
        file.updated_at = datetime.utcnow()

        # 如果是文件夹，递归删除子文件
        if file.is_folder:
            self._delete_folder_recursively(file_id)

        self.db.commit()

    def search_files(self, user_id: int, request: SearchRequest) -> List[SearchResult]:
        """搜索文件"""
        query = self.db.query(File).filter(
            File.user_id == user_id, File.deleted_at.is_(None)
        )

        # 关键词搜索
        if request.keyword:
            query = query.filter(File.name.contains(request.keyword))

        # 文件类型过滤
        if request.file_type:
            query = query.filter(File.file_type == request.file_type)

        # 大小过滤
        if request.min_size:
            query = query.filter(File.size >= request.min_size)
        if request.max_size:
            query = query.filter(File.size <= request.max_size)

        # 文件夹过滤
        if request.folder_id:
            query = query.filter(File.parent_id == request.folder_id)

        # 日期过滤
        if request.start_date:
            query = query.filter(File.created_at >= request.start_date)
        if request.end_date:
            query = query.filter(File.created_at <= request.end_date)

        # 排序
        if request.sort_by:
            sort_column = getattr(File, request.sort_by, File.created_at)
            if request.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())

        # 分页
        offset = request.page * request.page_size
        files = query.offset(offset).limit(request.page_size).all()

        return [self._file_to_search_result(file) for file in files]

    def check_file_exist(self, request: CheckFileRequest) -> CheckFileResponse:
        """检查文件是否存在（秒传）"""
        existing_file = (
            self.db.query(File)
            .filter(
                File.name == request.file_name,
                File.size == request.file_size,
                File.hash_value == request.file_hash,
                File.deleted_at.is_(None),
            )
            .first()
        )

        if existing_file:
            return CheckFileResponse(
                exists=True,
                file_id=existing_file.id,
                file_path=existing_file.storage_path,
            )

        return CheckFileResponse(exists=False)

    def initialize_upload(self, request: UploadInitRequest) -> UploadInitResponse:
        """初始化上传任务"""
        upload_id = str(
            hashlib.md5(
                f"{request.file_name}{request.file_size}{request.file_hash}".encode()
            ).hexdigest()
        )

        # 创建上传任务
        upload_task = UploadTask(
            user_id=1,  # 临时用户ID，实际应该从认证中获取
            upload_id=upload_id,
            file_name=request.file_name,
            file_size=request.file_size,
            file_hash=request.file_hash,
            chunk_count=request.chunk_count,
            uploaded_chunks="[]",
            status="pending",
        )

        self.db.add(upload_task)
        self.db.commit()
        self.db.refresh(upload_task)

        return UploadInitResponse(upload_id=upload_id, chunk_size=settings.chunk_size)

    def complete_upload(self, request: UploadCompleteRequest) -> File:
        """完成上传"""
        # 获取上传任务
        upload_task = (
            self.db.query(UploadTask)
            .filter(UploadTask.upload_id == request.upload_id)
            .first()
        )

        if not upload_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Upload task not found"
            )

        # 创建文件记录
        file_record = File(
            user_id=upload_task.user_id,
            parent_id=request.parent_folder_id,
            name=upload_task.file_name,
            size=upload_task.file_size,
            hash_value=upload_task.file_hash,
            file_type=self._get_file_type(upload_task.file_name),
            storage_path="",  # 实际路径应该在分片合并时生成
            mime_type="",
            is_folder=False,
        )

        self.db.add(file_record)
        self.db.commit()
        self.db.refresh(file_record)

        # 删除上传任务
        self.db.delete(upload_task)
        self.db.commit()

        return file_record

    def _file_to_info(self, file: File) -> FileInfo:
        """将File模型转换为FileInfo"""
        return FileInfo(
            id=file.id,
            user_id=file.user_id,
            parent_folder_id=file.parent_id,
            file_name=file.name,
            original_name=file.name,
            file_size=file.size,
            file_type=file.file_type,
            mime_type=file.mime_type,
            storage_path=file.storage_path,
            is_folder=file.is_folder,
            created_at=file.created_at,
            updated_at=file.updated_at,
            deleted_at=file.deleted_at,
        )

    def _file_to_search_result(self, file: File) -> SearchResult:
        """将File模型转换为SearchResult"""
        return SearchResult(
            id=file.id,
            file_name=file.name,
            original_name=file.name,
            file_size=file.size,
            file_type=file.file_type,
            mime_type=file.mime_type,
            created_at=file.created_at,
            updated_at=file.updated_at,
            is_folder=file.is_folder,
        )

    def _calculate_file_hash(self, file: UploadFile) -> str:
        """计算文件哈希"""
        hash_sha256 = hashlib.sha256()
        for chunk in iter(lambda: file.file.read(4096), b""):
            hash_sha256.update(chunk)
        file.file.seek(0)  # 重置文件指针
        return hash_sha256.hexdigest()

    def _generate_storage_path(self, user_id: int, filename: str) -> str:
        """生成文件存储路径"""
        user_dir = self.upload_dir / str(user_id)
        user_dir.mkdir(exist_ok=True)

        # 使用时间戳和随机数生成唯一文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_str = str(hashlib.md5(f"{filename}{timestamp}".encode()).hexdigest())[:8]
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{timestamp}_{random_str}{ext}"

        return str(user_dir / unique_filename)

    def _save_file(self, file: UploadFile, storage_path: str) -> None:
        """保存文件到磁盘"""
        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    def _get_file_type(self, filename: str) -> str:
        """获取文件类型"""
        ext = filename.lower().split(".")[-1] if "." in filename else ""
        return ext

    def _update_user_space(self, user_id: int, size: int) -> None:
        """更新用户存储空间"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.used_space += size
            user.updated_at = datetime.utcnow()
            self.db.commit()

    def _delete_folder_recursively(self, folder_id: int) -> None:
        """递归删除文件夹"""
        # 获取所有子文件
        child_files = (
            self.db.query(File)
            .filter(File.parent_id == folder_id, File.deleted_at.is_(None))
            .all()
        )

        # 递归删除子文件
        for child_file in child_files:
            if child_file.is_folder:
                self._delete_folder_recursively(child_file.id)
            else:
                child_file.deleted_at = datetime.utcnow()
                child_file.updated_at = datetime.utcnow()

        # 标记当前文件夹为删除
        parent_file = self.db.query(File).filter(File.id == folder_id).first()
        if parent_file:
            parent_file.deleted_at = datetime.utcnow()
            parent_file.updated_at = datetime.utcnow()
