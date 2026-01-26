from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 基础配置
    app_name: str = "ND Drive"
    app_version: str = "1.0.0"
    debug: bool = True

    # 数据库配置
    database_url: str = "mysql+pymysql://nd_user:123456@localhost:3306/nd_drive"

    # Redis配置
    redis_host: str = "localhost"
    redis_port: int = 6380
    redis_password: str = "123456"
    redis_db: int = 0

    # JWT配置
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # 文件存储配置
    upload_dir: str = "./storage/uploads"
    max_file_size: int = 10 * 1024 * 1024 * 1024  # 10GB
    chunk_size: int = 10 * 1024 * 1024  # 10MB

    # 分享配置
    share_code_length: int = 8
    share_expire_days: int = 30

    # 任务队列配置
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # WebDAV配置
    webdav_base_path: str = "/webdav"

    class Config:
        env_file = ".env"


settings = Settings()
