from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    UserProfileResponse,
    UserUpdateRequest,
    ChangePasswordRequest,
    ApiResponse,
    MapResponse,
)
from app.services.user_service import UserService
from app.dependencies import get_current_active_user
from app.models import User

router = APIRouter(prefix="/users", tags=["用户管理"])


@router.get("/profile", response_model=dict)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """获取用户信息"""
    try:
        user_service = UserService(current_user.__dict__.get("_db"))
        profile = user_service.get_user_profile(current_user.id)
        return {"code": 200, "message": "success", "data": profile.dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}",
        )


@router.put("/profile", response_model=dict)
def update_user_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """更新用户信息"""
    try:
        user_service = UserService(db)
        user_service.update_user(current_user.id, request)
        return {
            "code": 200,
            "message": "success",
            "data": "Profile updated successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}",
        )


@router.put("/password", response_model=dict)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """修改密码"""
    try:
        user_service = UserService(db)
        user_service.change_password(current_user.id, request)
        return {
            "code": 200,
            "message": "success",
            "data": "Password changed successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}",
        )


@router.get("/storage", response_model=dict)
def get_storage_info(current_user: User = Depends(get_current_active_user)):
    """获取存储信息"""
    try:
        user_service = UserService(current_user.__dict__.get("_db"))
        storage_info = user_service.get_storage_info(current_user.id)
        return {"code": 200, "message": "success", "data": storage_info}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get storage info: {str(e)}",
        )


@router.post("/logout-all", response_model=dict)
def logout_all_devices(current_user: User = Depends(get_current_active_user)):
    """退出所有设备"""
    try:
        user_service = UserService(current_user.__dict__.get("_db"))
        user_service.logout_all_devices(current_user.id)
        return {
            "code": 200,
            "message": "success",
            "data": "Logged out from all devices",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to logout all devices: {str(e)}",
        )


@router.get("/activity", response_model=dict)
def get_activity_log(current_user: User = Depends(get_current_active_user)):
    """获取活动记录"""
    # 在实际应用中，这里应该查询用户的活动日志
    return {"code": 200, "message": "success", "data": None}
