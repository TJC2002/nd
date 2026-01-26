from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models import User, Device, DeviceLog
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    DeleteAccountRequest,
)
from app.auth import auth_service
import secrets
import hashlib


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, request: RegisterRequest):
        # 验证密码确认
        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
            )

        # 检查用户名是否存在
        existing_user = (
            self.db.query(User).filter(User.username == request.username).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
            )

        # 检查邮箱是否存在
        existing_email = self.db.query(User).filter(User.email == request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists"
            )

        # 创建新用户
        user = User(
            username=request.username,
            password_hash=auth_service.get_password_hash(request.password),
            email=request.email,
            phone=request.phone,
            total_space=2147483648,  # 2GB
            used_space=0,
            status="active",
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # 生成token
        access_token = auth_service.create_access_token(data={"sub": user.username})
        refresh_token = auth_service.create_refresh_token(data={"sub": user.username})

        # 存储refresh token
        auth_service.store_refresh_token(user.id, refresh_token)

        # 记录设备信息
        self._log_device(user, "register")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.id,
            "username": user.username,
            "expires_in": 3600000,  # 1小时
        }

    def login(self, request: LoginRequest):
        # 查找用户
        user = self.db.query(User).filter(User.username == request.username).first()
        if not user or not auth_service.verify_password(
            request.password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        # 检查用户状态
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Account is disabled"
            )

        # 生成token
        access_token = auth_service.create_access_token(data={"sub": user.username})
        refresh_token = auth_service.create_refresh_token(data={"sub": user.username})

        # 存储refresh token
        auth_service.store_refresh_token(user.id, refresh_token)

        # 记录设备信息
        self._log_device(user, "login")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.id,
            "username": user.username,
            "expires_in": 3600000,  # 1小时
        }

    def refresh_token(self, request: RefreshTokenRequest):
        # 验证refresh token
        user_id = auth_service.get_user_id_from_refresh_token(request.refresh_token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
            )

        # 查找用户
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
            )

        # 生成新的access token
        access_token = auth_service.create_access_token(data={"sub": user.username})

        return {
            "access_token": access_token,
            "expires_in": 3600000,  # 1小时
        }

    def logout(self, refresh_token: str):
        # 删除refresh token
        auth_service.delete_refresh_token(refresh_token)

    def forgot_password(self, request: ForgotPasswordRequest):
        # 查找用户
        user = self.db.query(User).filter(User.email == request.email).first()
        if not user:
            # 为了安全，不提示用户是否存在
            return {"message": "Reset link sent to your email"}

        # 生成重置token
        reset_token = secrets.token_urlsafe(32)
        auth_service.store_reset_token(user.id, reset_token)

        # 在实际应用中，这里应该发送邮件
        print(f"Password reset token for user {user.username}: {reset_token}")

        return {"message": "Reset link sent to your email"}

    def reset_password(self, request: ResetPasswordRequest):
        # 验证重置token
        user_id = auth_service.get_user_id_from_reset_token(request.token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )

        # 查找用户
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="User not found"
            )

        # 更新密码
        user.password_hash = auth_service.get_password_hash(request.new_password)
        user.updated_at = datetime.utcnow()

        self.db.commit()

        # 删除重置token
        auth_service.delete_reset_token(request.token)

        return {"message": "Password reset successful"}

    def delete_account(self, user_id: int, request: DeleteAccountRequest):
        # 查找用户
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # 验证密码
        if not auth_service.verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password"
            )

        # 删除用户相关数据
        # 删除设备
        self.db.query(Device).filter(Device.user_id == user_id).delete()
        # 删除设备日志
        self.db.query(DeviceLog).filter(DeviceLog.user_id == user_id).delete()
        # 删除用户文件
        self._delete_user_files(user_id)
        # 删除用户
        self.db.delete(user)
        self.db.commit()

        return {"message": "Account deleted successfully"}

    def _log_device(self, user: User, action: str):
        # 记录设备信息
        device = Device(
            user_id=user.id,
            device_name="Unknown",
            device_type="web",
            ip_address="127.0.0.1",
            user_agent="Unknown",
            last_login_at=datetime.utcnow() if action == "login" else None,
        )

        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)

        # 记录设备日志
        device_log = DeviceLog(
            user_id=user.id,
            device_id=device.id,
            action=action,
            ip_address="127.0.0.1",
            user_agent="Unknown",
        )

        self.db.add(device_log)
        self.db.commit()

    def _delete_user_files(self, user_id: int):
        # 删除用户文件（实际应用中可能需要标记为删除而不是物理删除）
        from app.models import File

        files = self.db.query(File).filter(File.user_id == user_id).all()
        for file in files:
            file.deleted_at = datetime.utcnow()

        self.db.commit()
