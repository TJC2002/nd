import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models import User, File, ShareLink
from app.schemas import CreateShareRequest, ShareResponse, VerifyShareRequest
from app.auth import auth_service


class ShareService:
    def __init__(self, db: Session):
        self.db = db

    def create_share(self, user_id: int, request: CreateShareRequest) -> ShareResponse:
        """创建分享链接"""
        # 验证文件是否存在且属于用户
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
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # 生成分享码
        share_code = auth_service.generate_share_code()

        # 计算过期时间
        expire_at = None
        if request.expire_days:
            expire_at = datetime.utcnow() + timedelta(days=request.expire_days)

        # 创建分享链接
        share_link = ShareLink(
            user_id=user_id,
            file_id=request.file_id,
            share_code=share_code,
            password=auth_service.get_password_hash(request.password)
            if request.password
            else None,
            expire_days=request.expire_days or 30,
            access_count=0,
            max_access_count=request.max_access_count,
            expire_at=expire_at,
        )

        self.db.add(share_link)
        self.db.commit()
        self.db.refresh(share_link)

        return ShareResponse(
            id=share_link.id,
            share_code=share_link.share_code,
            file_id=share_link.file_id,
            file_name=file.name,
            expire_days=share_link.expire_days,
            access_count=share_link.access_count,
            max_access_count=share_link.max_access_count,
            created_at=share_link.created_at,
            expire_at=share_link.expire_at,
        )

    def verify_share(
        self,
        request: VerifyShareRequest,
        ip_address: str = None,
        user_agent: str = None,
    ) -> ShareResponse:
        """验证分享链接"""
        share_link = (
            self.db.query(ShareLink)
            .filter(
                ShareLink.share_code == request.share_code,
                ShareLink.is_deleted == False,
            )
            .first()
        )

        if not share_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found"
            )

        # 检查是否过期
        if share_link.expire_at and share_link.expire_at < datetime.utcnow():
            # 标记为已删除
            share_link.is_deleted = True
            share_link.updated_at = datetime.utcnow()
            self.db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Share link has expired"
            )

        # 验证密码
        if share_link.password:
            if not request.password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Password required"
                )

            if not auth_service.verify_password(request.password, share_link.password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password"
                )

        # 检查访问次数限制
        if share_link.max_access_count:
            if share_link.access_count >= share_link.max_access_count:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum access count reached",
                )

        # 更新访问次数
        share_link.access_count += 1
        share_link.updated_at = datetime.utcnow()
        self.db.commit()

        # 获取文件信息
        file = (
            self.db.query(File)
            .filter(File.id == share_link.file_id, File.deleted_at.is_(None))
            .first()
        )

        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        return ShareResponse(
            id=share_link.id,
            share_code=share_link.share_code,
            file_id=share_link.file_id,
            file_name=file.name,
            expire_days=share_link.expire_days,
            access_count=share_link.access_count,
            max_access_count=share_link.max_access_count,
            created_at=share_link.created_at,
            expire_at=share_link.expire_at,
        )

    def get_user_shares(self, user_id: int) -> List[ShareResponse]:
        """获取用户分享列表"""
        shares = (
            self.db.query(ShareLink)
            .filter(ShareLink.user_id == user_id, ShareLink.is_deleted == False)
            .all()
        )

        responses = []
        for share in shares:
            file = (
                self.db.query(File)
                .filter(File.id == share.file_id, File.deleted_at.is_(None))
                .first()
            )

            if file:
                responses.append(
                    ShareResponse(
                        id=share.id,
                        share_code=share.share_code,
                        file_id=share.file_id,
                        file_name=file.name,
                        expire_days=share.expire_days,
                        access_count=share.access_count,
                        max_access_count=share.max_access_count,
                        created_at=share.created_at,
                        expire_at=share.expire_at,
                    )
                )

        return responses

    def get_share_by_code(
        self, share_code: str, ip_address: str = None, user_agent: str = None
    ) -> ShareResponse:
        """通过分享码获取分享信息"""
        share = (
            self.db.query(ShareLink)
            .filter(ShareLink.share_code == share_code, ShareLink.is_deleted == False)
            .first()
        )

        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found"
            )

        # 检查是否过期
        if share.expire_at and share.expire_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Share link has expired"
            )

        # 获取文件信息
        file = (
            self.db.query(File)
            .filter(File.id == share.file_id, File.deleted_at.is_(None))
            .first()
        )

        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        return ShareResponse(
            id=share.id,
            share_code=share.share_code,
            file_id=share.file_id,
            file_name=file.name,
            expire_days=share.expire_days,
            access_count=share.access_count,
            max_access_count=share.max_access_count,
            created_at=share.created_at,
            expire_at=share.expire_at,
        )

    def revoke_share(self, user_id: int, share_id: int) -> None:
        """撤销分享链接"""
        share = (
            self.db.query(ShareLink)
            .filter(
                ShareLink.id == share_id,
                ShareLink.user_id == user_id,
                ShareLink.is_deleted == False,
            )
            .first()
        )

        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found"
            )

        # 标记为已删除
        share.is_deleted = True
        share.updated_at = datetime.utcnow()
        self.db.commit()

    def delete_share(self, user_id: int, share_id: int) -> None:
        """删除分享记录"""
        share = (
            self.db.query(ShareLink)
            .filter(ShareLink.id == share_id, ShareLink.user_id == user_id)
            .first()
        )

        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Share link not found"
            )

        # 物理删除
        self.db.delete(share)
        self.db.commit()

    def download_shared_file(
        self,
        share_code: str,
        password: str = None,
        response=None,
        ip_address: str = None,
        user_agent: str = None,
    ):
        """下载分享文件"""
        # 验证分享链接
        verify_request = VerifyShareRequest(share_code=share_code, password=password)
        share_response = self.verify_share(verify_request, ip_address, user_agent)

        # 获取文件信息
        file = (
            self.db.query(File)
            .filter(File.id == share_response.file_id, File.deleted_at.is_(None))
            .first()
        )

        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )

        # 如果是文件夹，不能下载
        if file.is_folder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot download folder"
            )

        # 返回文件内容（实际应用中应该返回文件流）
        return {
            "file_path": file.storage_path,
            "file_name": file.name,
            "file_size": file.size,
            "mime_type": file.mime_type,
        }
