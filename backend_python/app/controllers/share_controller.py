from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    CreateShareRequest,
    ShareResponse,
    VerifyShareRequest,
    ApiResponse,
)
from app.services.share_service import ShareService
from app.dependencies import get_current_active_user
from app.models import User
from typing import Optional

router = APIRouter(prefix="/api/shares", tags=["分享管理"])


@router.post("", response_model=dict)
def create_share(
    request: CreateShareRequest,
    current_user: User = Depends(get_current_active_user),
    http_request: Request = None,
):
    """创建分享链接"""
    try:
        share_service = ShareService(current_user.__dict__.get("_db"))
        result = share_service.create_share(current_user.id, request)

        return {"code": 200, "message": "success", "data": result.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create share: {str(e)}",
        )


@router.post("/verify", response_model=dict)
def verify_share(request: VerifyShareRequest, http_request: Request = None):
    """验证分享链接"""
    try:
        share_service = ShareService(
            None
        )  # 不需要数据库连接，因为分享验证可能来自未登录用户

        # 获取客户端IP和User-Agent
        ip_address = _get_client_ip(http_request)
        user_agent = http_request.headers.get("User-Agent", "Unknown")

        result = share_service.verify_share(request, ip_address, user_agent)

        return {"code": 200, "message": "success", "data": result.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify share: {str(e)}",
        )


@router.get("", response_model=dict)
def get_user_shares(current_user: User = Depends(get_current_active_user)):
    """获取用户分享列表"""
    try:
        share_service = ShareService(current_user.__dict__.get("_db"))
        shares = share_service.get_user_shares(current_user.id)

        return {
            "code": 200,
            "message": "success",
            "data": [share.dict() for share in shares],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user shares: {str(e)}",
        )


@router.get("/{share_code}", response_model=dict)
def get_share_by_code(share_code: str, http_request: Request = None):
    """通过分享码获取分享信息"""
    try:
        share_service = ShareService(None)  # 不需要数据库连接

        # 获取客户端IP和User-Agent
        ip_address = _get_client_ip(http_request)
        user_agent = http_request.headers.get("User-Agent", "Unknown")

        result = share_service.get_share_by_code(share_code, ip_address, user_agent)

        return {"code": 200, "message": "success", "data": result.dict()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get share by code: {str(e)}",
        )


@router.post("/{share_id}/revoke", response_model=dict)
def revoke_share(share_id: int, current_user: User = Depends(get_current_active_user)):
    """撤销分享链接"""
    try:
        share_service = ShareService(current_user.__dict__.get("_db"))
        share_service.revoke_share(current_user.id, share_id)

        return {"code": 200, "message": "success", "data": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke share: {str(e)}",
        )


@router.delete("/{share_id}", response_model=dict)
def delete_share(share_id: int, current_user: User = Depends(get_current_active_user)):
    """删除分享记录"""
    try:
        share_service = ShareService(current_user.__dict__.get("_db"))
        share_service.delete_share(current_user.id, share_id)

        return {"code": 200, "message": "success", "data": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete share: {str(e)}",
        )


@router.get("/{share_code}/download")
def download_shared_file(
    share_code: str, password: Optional[str] = None, http_request: Request = None
):
    """下载分享文件"""
    try:
        share_service = ShareService(None)  # 不需要数据库连接

        # 获取客户端IP和User-Agent
        ip_address = _get_client_ip(http_request)
        user_agent = http_request.headers.get("User-Agent", "Unknown")

        result = share_service.download_shared_file(
            share_code, password, None, ip_address, user_agent
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download shared file: {str(e)}",
        )


def _get_client_ip(request: Request) -> str:
    """获取客户端IP地址"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    proxy = request.headers.get("Proxy-Client-IP")
    if proxy:
        return proxy

    wl_proxy = request.headers.get("WL-Proxy-Client-IP")
    if wl_proxy:
        return wl_proxy

    http_client = request.headers.get("HTTP_CLIENT_IP")
    if http_client:
        return http_client

    http_x_forwarded = request.headers.get("HTTP_X_FORWARDED_FOR")
    if http_x_forwarded:
        return http_x_forwarded

    return request.client.host
