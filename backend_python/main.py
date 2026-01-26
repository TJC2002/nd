from fastapi import FastAPI, Request
from app.config import settings
from app.database import engine, Base
from app.controllers import (
    auth_controller,
    user_controller,
    file_controller,
    share_controller,
    webdav_controller,
    download_controller,
)
from app.models import *  # 导入所有模型
from app.middleware import setup_middleware, setup_exception_handlers
import uvicorn

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name, version=settings.app_version, debug=settings.debug
)

setup_middleware(app)
setup_exception_handlers(app)

# 注册路由
app.include_router(auth_controller.router)
app.include_router(user_controller.router)
app.include_router(file_controller.router)
app.include_router(share_controller.router)
app.include_router(webdav_controller.router)
app.include_router(download_controller.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to ND Drive API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "version": settings.app_version}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
