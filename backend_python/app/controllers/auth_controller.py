from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    DeleteAccountRequest,
    ApiResponse,
    UserProfileResponse,
    UserUpdateRequest,
    ChangePasswordRequest,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.dependencies import get_current_user, get_current_active_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["认证管理"])


@router.post("/register", response_model=dict)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """用户注册"""
    auth_service = AuthService(db)
    try:
        result = auth_service.register(request)
        return {"code": 200, "message": "success", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=dict)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    auth_service = AuthService(db)
    try:
        result = auth_service.login(request)
        return {"code": 200, "message": "success", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.post("/refresh", response_model=dict)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """令牌刷新"""
    auth_service = AuthService(db)
    try:
        result = auth_service.refresh_token(request)
        return {"code": 200, "message": "success", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}",
        )


@router.post("/logout", response_model=dict)
def logout(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """用户登出"""
    auth_service = AuthService(db)
    try:
        auth_service.logout(request.refresh_token)
        return {"code": 200, "message": "success", "data": "Logout successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}",
        )


@router.post("/forgot-password", response_model=dict)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """密码找回"""
    auth_service = AuthService(db)
    try:
        auth_service.forgot_password(request)
        return {
            "code": 200,
            "message": "success",
            "data": "Reset link sent to your email",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send reset link: {str(e)}",
        )


@router.post("/reset-password", response_model=dict)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """密码重置"""
    auth_service = AuthService(db)
    try:
        auth_service.reset_password(request)
        return {"code": 200, "message": "success", "data": "Password reset successful"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}",
        )


@router.post("/delete-account", response_model=dict)
def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """账号注销"""
    auth_service = AuthService(db)
    try:
        auth_service.delete_account(current_user.id, request)
        return {
            "code": 200,
            "message": "success",
            "data": "Account deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Account deletion failed: {str(e)}",
        )
