from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models import User
from app.schemas import UserProfileResponse, UserUpdateRequest, ChangePasswordRequest
from app.auth import auth_service


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> User:
        """根据用户ID获取用户"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user

    def get_user_profile(self, user_id: int) -> UserProfileResponse:
        """获取用户信息"""
        user = self.get_user_by_id(user_id)

        return UserProfileResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            phone=user.phone,
            total_space=user.total_space,
            used_space=user.used_space,
            status=user.status,
            created_at=user.created_at,
        )

    def update_user(self, user_id: int, request: UserUpdateRequest) -> None:
        """更新用户信息"""
        user = self.get_user_by_id(user_id)

        # 更新邮箱
        if request.email and request.email != user.email:
            # 检查邮箱是否已被使用
            existing_email = (
                self.db.query(User)
                .filter(User.email == request.email, User.id != user_id)
                .first()
            )
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists",
                )
            user.email = request.email

        # 更新手机号
        if request.phone is not None:
            user.phone = request.phone

        user.updated_at = datetime.utcnow()
        self.db.commit()

    def change_password(self, user_id: int, request: ChangePasswordRequest) -> None:
        """修改密码"""
        user = self.get_user_by_id(user_id)

        # 验证旧密码
        if not auth_service.verify_password(request.old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password"
            )

        # 验证新密码确认
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match",
            )

        # 更新密码
        user.password_hash = auth_service.get_password_hash(request.new_password)
        user.updated_at = datetime.utcnow()
        self.db.commit()

    def get_storage_info(self, user_id: int) -> dict:
        """获取存储信息"""
        user = self.get_user_by_id(user_id)

        return {
            "totalSpace": user.total_space,
            "usedSpace": user.used_space,
            "remainingSpace": user.total_space - user.used_space,
            "usedPercentage": (user.used_space / user.total_space * 100)
            if user.total_space > 0
            else 0,
        }

    def logout_all_devices(self, user_id: int) -> None:
        """退出所有设备"""
        # 在实际应用中，这里应该清除用户的所有refresh token
        # 这里只是示例
        pass
