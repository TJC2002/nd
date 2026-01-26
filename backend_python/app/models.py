from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    BigInteger,
    ForeignKey,
    Index,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    total_space = Column(BigInteger, default=2147483648)  # 2GB
    used_space = Column(BigInteger, default=0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    files = relationship("File", back_populates="user")
    shares = relationship("ShareLink", back_populates="user")
    devices = relationship("Device", back_populates="user")
    device_logs = relationship("DeviceLog", back_populates="user")


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    name = Column(String(255), nullable=False)
    size = Column(BigInteger, nullable=False)
    hash_value = Column(String(64), nullable=False)  # SHA-256
    file_type = Column(String(50), nullable=True)
    storage_node_id = Column(Integer, nullable=True)
    storage_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=True)
    is_folder = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime, nullable=True)

    # 关系
    user = relationship("User", back_populates="files")
    parent = relationship("File", remote_side=[id])
    children = relationship("File")
    shares = relationship("ShareLink", back_populates="file")
    upload_tasks = relationship("UploadTask", back_populates="file")
    download_tasks = relationship("DownloadTask", back_populates="file")


class StorageNode(Base):
    __tablename__ = "storage_nodes"

    id = Column(Integer, primary_key=True, index=True)
    node_name = Column(String(100), nullable=False)
    storage_type = Column(String(50), nullable=False)  # local, s3, etc.
    storage_path = Column(String(500), nullable=False)
    capacity = Column(BigInteger, nullable=False)
    used_space = Column(BigInteger, default=0)
    status = Column(String(20), default="active")  # active, inactive
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    share_code = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)
    expire_days = Column(Integer, default=30)
    access_count = Column(Integer, default=0)
    max_access_count = Column(Integer, nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    expire_at = Column(DateTime, nullable=True)

    # 关系
    user = relationship("User", back_populates="shares")
    file = relationship("File", back_populates="shares")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_name = Column(String(100), nullable=False)
    device_type = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="devices")
    device_logs = relationship("DeviceLog", back_populates="device")


class DeviceLog(Base):
    __tablename__ = "device_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    action = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    # 关系
    user = relationship("User", back_populates="device_logs")
    device = relationship("Device", back_populates="device_logs")


class UploadTask(Base):
    __tablename__ = "upload_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    upload_id = Column(String(100), unique=True, nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_hash = Column(String(64), nullable=False)
    chunk_count = Column(Integer, nullable=False)
    uploaded_chunks = Column(
        Text, nullable=True
    )  # JSON array of uploaded chunk indices
    status = Column(
        String(20), default="pending"
    )  # pending, uploading, completed, failed, cancelled
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 关系
    user = relationship("User")
    file = relationship("File", back_populates="upload_tasks")


class DownloadTask(Base):
    __tablename__ = "download_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    task_type = Column(String(50), nullable=False)  # download, batch_download
    status = Column(
        String(20), default="pending"
    )  # pending, downloading, completed, failed, cancelled
    progress = Column(Integer, default=0)
    message = Column(Text, nullable=True)
    result_data = Column(Text, nullable=True)  # JSON result data
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # 关系
    user = relationship("User")
    file = relationship("File", back_populates="download_tasks")


class AsyncTask(Base):
    __tablename__ = "async_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    task_type = Column(String(50), nullable=False)  # convert, compress, etc.
    status = Column(
        String(20), default="pending"
    )  # pending, running, completed, failed, cancelled, paused
    progress = Column(Integer, default=0)
    message = Column(Text, nullable=True)
    task_params = Column(Text, nullable=True)  # JSON task parameters
    result_data = Column(Text, nullable=True)  # JSON result data
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)


class FileMetadata(Base):
    __tablename__ = "file_metadata"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class CollectionItem(Base):
    __tablename__ = "collection_items"

    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    added_at = Column(DateTime, default=func.now())


class RecycleBin(Base):
    __tablename__ = "recycle_bin"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(BigInteger, nullable=False)
    deleted_at = Column(DateTime, default=func.now())
    will_delete_at = Column(DateTime, nullable=True)
