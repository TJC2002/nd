from celery import Celery
from app.celery_app import celery_app
from app.database import get_db
from app.models import User, File, DownloadTask
from sqlalchemy.orm import Session
from sqlalchemy import and_
import os
import hashlib
import shutil
import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_file_upload(self, file_path: str, user_id: int, file_info: dict):
    """
    处理文件上传任务
    """
    try:
        logger.info(f"开始处理文件上传: {file_path}, 用户ID: {user_id}")

        # 计算文件MD5
        md5_hash = calculate_file_md5(file_path)

        # 获取数据库会话
        db = next(get_db())

        # 检查文件是否已存在
        existing_file = (
            db.query(File)
            .filter(and_(File.user_id == user_id, File.md5 == md5_hash))
            .first()
        )

        if existing_file:
            logger.info(f"文件已存在，跳过处理: {file_path}")
            return {
                "status": "skipped",
                "message": "文件已存在",
                "file_id": existing_file.id,
            }

        # 创建文件记录
        file_record = File(
            user_id=user_id,
            filename=file_info.get("filename", os.path.basename(file_path)),
            original_filename=file_info.get(
                "original_filename", os.path.basename(file_path)
            ),
            file_size=os.path.getsize(file_path),
            md5=md5_hash,
            mime_type=file_info.get("mime_type", "application/octet-stream"),
            storage_path=file_path,
            is_processed=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(file_record)
        db.commit()
        db.refresh(file_record)

        logger.info(f"文件上传处理完成: {file_path}, 文件ID: {file_record.id}")

        return {
            "status": "success",
            "message": "文件上传处理完成",
            "file_id": file_record.id,
            "file_size": file_record.file_size,
            "md5": file_record.md5,
        }

    except Exception as e:
        logger.error(f"文件上传处理失败: {file_path}, 错误: {str(e)}")

        # 重试逻辑
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (self.request.retries + 1)  # 指数退避
            logger.info(f"重试文件上传处理，{retry_delay}秒后重试")
            raise self.retry(countdown=retry_delay, exc=e)
        else:
            # 更新任务状态为失败
            try:
                db = next(get_db())
                # 这里可以添加任务状态更新逻辑
                logger.error(f"文件上传处理最终失败: {file_path}")
            except:
                pass

            raise Exception(f"文件上传处理最终失败: {str(e)}")


@celery_app.task(bind=True, max_retries=3)
def process_file_conversion(self, file_id: int, conversion_type: str):
    """
    处理文件转换任务（如图片压缩、视频转码等）
    """
    try:
        logger.info(f"开始处理文件转换: 文件ID {file_id}, 转换类型: {conversion_type}")

        # 获取数据库会话
        db = next(get_db())

        # 获取文件信息
        file_record = db.query(File).filter(File.id == file_id).first()
        if not file_record:
            raise Exception(f"文件不存在: {file_id}")

        # 检查文件是否已转换
        if file_record.conversion_status == "completed":
            logger.info(f"文件已转换，跳过处理: {file_id}")
            return {"status": "skipped", "message": "文件已转换"}

        # 模拟文件转换过程
        # 实际应用中这里会调用具体的转换服务
        conversion_progress = 0

        while conversion_progress < 100:
            # 模拟转换进度
            conversion_progress += 10
            logger.info(f"文件转换进度: {conversion_progress}%")

            # 更新转换进度
            file_record.conversion_progress = conversion_progress
            file_record.updated_at = datetime.utcnow()
            db.commit()

            # 模拟处理时间
            import time

            time.sleep(0.5)

        # 转换完成
        file_record.conversion_status = "completed"
        file_record.conversion_progress = 100
        file_record.updated_at = datetime.utcnow()
        db.commit()

        logger.info(f"文件转换处理完成: 文件ID {file_id}")

        return {
            "status": "success",
            "message": "文件转换完成",
            "file_id": file_id,
            "conversion_type": conversion_type,
        }

    except Exception as e:
        logger.error(f"文件转换处理失败: {file_id}, 错误: {str(e)}")

        # 更新转换状态为失败
        try:
            db = next(get_db())
            file_record = db.query(File).filter(File.id == file_id).first()
            if file_record:
                file_record.conversion_status = "failed"
                file_record.updated_at = datetime.utcnow()
                db.commit()
        except:
            pass

        # 重试逻辑
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (self.request.retries + 1)
            logger.info(f"重试文件转换处理，{retry_delay}秒后重试")
            raise self.retry(countdown=retry_delay, exc=e)
        else:
            raise Exception(f"文件转换处理最终失败: {str(e)}")


@celery_app.task(bind=True, max_retries=3)
def process_file_thumbnail(self, file_id: int):
    """
    处理文件缩略图生成任务
    """
    try:
        logger.info(f"开始处理文件缩略图生成: 文件ID {file_id}")

        # 获取数据库会话
        db = next(get_db())

        # 获取文件信息
        file_record = db.query(File).filter(File.id == file_id).first()
        if not file_record:
            raise Exception(f"文件不存在: {file_id}")

        # 检查是否为图片文件
        if not file_record.mime_type.startswith("image/"):
            logger.info(f"非图片文件，跳过缩略图生成: {file_id}")
            return {"status": "skipped", "message": "非图片文件"}

        # 检查缩略图是否已存在
        if file_record.thumbnail_path:
            logger.info(f"缩略图已存在，跳过生成: {file_id}")
            return {"status": "skipped", "message": "缩略图已存在"}

        # 模拟缩略图生成过程
        thumbnail_progress = 0

        while thumbnail_progress < 100:
            # 模拟缩略图生成进度
            thumbnail_progress += 15
            logger.info(f"缩略图生成进度: {thumbnail_progress}%")

            # 更新进度
            file_record.thumbnail_progress = thumbnail_progress
            file_record.updated_at = datetime.utcnow()
            db.commit()

            # 模拟处理时间
            import time

            time.sleep(0.3)

        # 生成缩略图完成
        thumbnail_path = f"{file_record.storage_path}.thumbnail.jpg"
        file_record.thumbnail_path = thumbnail_path
        file_record.thumbnail_progress = 100
        file_record.has_thumbnail = True
        file_record.updated_at = datetime.utcnow()
        db.commit()

        logger.info(f"缩略图生成完成: 文件ID {file_id}")

        return {
            "status": "success",
            "message": "缩略图生成完成",
            "file_id": file_id,
            "thumbnail_path": thumbnail_path,
        }

    except Exception as e:
        logger.error(f"缩略图生成失败: {file_id}, 错误: {str(e)}")

        # 更新缩略图状态为失败
        try:
            db = next(get_db())
            file_record = db.query(File).filter(File.id == file_id).first()
            if file_record:
                file_record.thumbnail_progress = 0
                file_record.updated_at = datetime.utcnow()
                db.commit()
        except:
            pass

        # 重试逻辑
        if self.request.retries < self.max_retries:
            retry_delay = 60 * (self.request.retries + 1)
            logger.info(f"重试缩略图生成，{retry_delay}秒后重试")
            raise self.retry(countdown=retry_delay, exc=e)
        else:
            raise Exception(f"缩略图生成最终失败: {str(e)}")


@celery_app.task
def calculate_file_md5(file_path: str) -> str:
    """
    计算文件的MD5值
    """
    if not os.path.exists(file_path):
        raise Exception(f"文件不存在: {file_path}")

    md5_hash = hashlib.md5()

    with open(file_path, "rb") as f:
        # 分块读取文件以避免内存问题
        for chunk in iter(lambda: f.read(4096), b""):
            md5_hash.update(chunk)

    return md5_hash.hexdigest()


@celery_app.task
def scan_and_index_files(user_id: int, directory: str = None):
    """
    扫描并索引用户文件
    """
    try:
        logger.info(f"开始扫描用户文件: 用户ID {user_id}, 目录: {directory}")

        db = next(get_db())
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise Exception(f"用户不存在: {user_id}")

        # 扫描目录
        scan_directory = directory or user.storage_path
        if not os.path.exists(scan_directory):
            logger.warning(f"扫描目录不存在: {scan_directory}")
            return {"status": "warning", "message": "扫描目录不存在"}

        # 获取所有文件
        files_found = []
        for root, dirs, filenames in os.walk(scan_directory):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                files_found.append(file_path)

        # 处理每个文件
        processed_count = 0
        skipped_count = 0

        for file_path in files_found:
            try:
                # 计算MD5
                md5_hash = calculate_file_md5(file_path)

                # 检查文件是否已存在
                existing_file = (
                    db.query(File)
                    .filter(and_(File.user_id == user_id, File.md5 == md5_hash))
                    .first()
                )

                if existing_file:
                    skipped_count += 1
                    continue

                # 创建文件记录
                file_record = File(
                    user_id=user_id,
                    filename=os.path.basename(file_path),
                    original_filename=os.path.basename(file_path),
                    file_size=os.path.getsize(file_path),
                    md5=md5_hash,
                    mime_type=get_mime_type(file_path),
                    storage_path=file_path,
                    is_processed=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                db.add(file_record)
                processed_count += 1

            except Exception as e:
                logger.error(f"处理文件失败: {file_path}, 错误: {str(e)}")
                continue

        db.commit()

        logger.info(
            f"文件扫描完成: 用户ID {user_id}, 处理: {processed_count}, 跳过: {skipped_count}"
        )

        return {
            "status": "success",
            "message": "文件扫描完成",
            "user_id": user_id,
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "total_files": len(files_found),
        }

    except Exception as e:
        logger.error(f"文件扫描失败: 用户ID {user_id}, 错误: {str(e)}")
        raise Exception(f"文件扫描失败: {str(e)}")


def get_mime_type(file_path: str) -> str:
    """
    获取文件的MIME类型
    """
    import mimetypes

    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type or "application/octet-stream"
