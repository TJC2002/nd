from celery import Celery
from app.celery_app import celery_app
from app.database import get_db
from app.models import User, File, DownloadTask, ShareLink
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import os
import shutil
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


@celery_app.task
def cleanup_expired_download_tasks():
    """
    清理过期的下载任务
    """
    try:
        logger.info("开始清理过期下载任务")

        db = next(get_db())

        # 查找过期任务（超过24小时未完成）
        expired_tasks = (
            db.query(DownloadTask)
            .filter(
                and_(
                    DownloadTask.status.in_(["pending", "processing"]),
                    DownloadTask.created_at < datetime.utcnow() - timedelta(hours=24),
                )
            )
            .all()
        )

        cleaned_count = 0
        for task in expired_tasks:
            try:
                # 更新任务状态为失败
                task.status = "failed"
                task.error_message = "任务已过期"
                task.updated_at = datetime.utcnow()
                db.commit()

                cleaned_count += 1
                logger.info(f"清理过期下载任务: {task.id}")

            except Exception as e:
                logger.error(f"清理下载任务失败: {task.id}, 错误: {str(e)}")
                db.rollback()
                continue

        logger.info(f"过期下载任务清理完成: 共清理 {cleaned_count} 个任务")

        return {
            "status": "success",
            "message": "过期下载任务清理完成",
            "cleaned_count": cleaned_count,
        }

    except Exception as e:
        logger.error(f"清理过期下载任务失败: {str(e)}")
        raise Exception(f"清理过期下载任务失败: {str(e)}")


@celery_app.task
def cleanup_orphaned_files():
    """
    清理孤立文件（数据库中不存在记录的文件）
    """
    try:
        logger.info("开始清理孤立文件")

        db = next(get_db())

        # 获取所有用户存储目录
        users = db.query(User).all()
        orphaned_files = []

        for user in users:
            if not user.storage_path or not os.path.exists(user.storage_path):
                continue

            # 扫描用户目录
            for root, dirs, filenames in os.walk(user.storage_path):
                for filename in filenames:
                    file_path = os.path.join(root, filename)

                    # 检查文件是否在数据库中存在
                    file_exists = (
                        db.query(File)
                        .filter(
                            and_(
                                File.user_id == user.id, File.storage_path == file_path
                            )
                        )
                        .first()
                    )

                    if not file_exists:
                        orphaned_files.append(
                            {
                                "user_id": user.id,
                                "file_path": file_path,
                                "size": os.path.getsize(file_path)
                                if os.path.exists(file_path)
                                else 0,
                            }
                        )

        # 删除孤立文件
        deleted_count = 0
        total_size = 0

        for orphan_file in orphaned_files:
            try:
                if os.path.exists(orphan_file["file_path"]):
                    os.remove(orphan_file["file_path"])
                    deleted_count += 1
                    total_size += orphan_file["size"]
                    logger.info(f"删除孤立文件: {orphan_file['file_path']}")

            except Exception as e:
                logger.error(
                    f"删除孤立文件失败: {orphan_file['file_path']}, 错误: {str(e)}"
                )
                continue

        logger.info(
            f"孤立文件清理完成: 删除 {deleted_count} 个文件, 释放 {total_size} 字节"
        )

        return {
            "status": "success",
            "message": "孤立文件清理完成",
            "deleted_count": deleted_count,
            "total_size": total_size,
        }

    except Exception as e:
        logger.error(f"清理孤立文件失败: {str(e)}")
        raise Exception(f"清理孤立文件失败: {str(e)}")


@celery_app.task
def cleanup_expired_share_links():
    """
    清理过期的分享链接
    """
    try:
        logger.info("开始清理过期分享链接")

        db = next(get_db())

        # 查找过期链接（过期时间已到）
        expired_links = (
            db.query(ShareLink)
            .filter(
                and_(
                    ShareLink.expire_time < datetime.utcnow(),
                    ShareLink.is_deleted == False,
                )
            )
            .all()
        )

        cleaned_count = 0

        for link in expired_links:
            try:
                # 标记为已删除
                link.is_deleted = True
                link.updated_at = datetime.utcnow()
                db.commit()

                cleaned_count += 1
                logger.info(f"清理过期分享链接: {link.code}")

            except Exception as e:
                logger.error(f"清理分享链接失败: {link.code}, 错误: {str(e)}")
                db.rollback()
                continue

        logger.info(f"过期分享链接清理完成: 共清理 {cleaned_count} 个链接")

        return {
            "status": "success",
            "message": "过期分享链接清理完成",
            "cleaned_count": cleaned_count,
        }

    except Exception as e:
        logger.error(f"清理过期分享链接失败: {str(e)}")
        raise Exception(f"清理过期分享链接失败: {str(e)}")


@celery_app.task
def cleanup_user_storage():
    """
    清理用户存储空间统计
    """
    try:
        logger.info("开始清理用户存储空间统计")

        db = next(get_db())

        # 重新计算每个用户的存储空间使用情况
        users = db.query(User).all()
        updated_count = 0

        for user in users:
            try:
                # 计算用户已用空间
                used_space = (
                    db.query(func.sum(File.file_size))
                    .filter(and_(File.user_id == user.id, File.is_deleted == False))
                    .scalar()
                    or 0
                )

                # 更新用户已用空间
                user.used_space = used_space
                user.updated_at = datetime.utcnow()
                db.commit()

                updated_count += 1
                logger.info(
                    f"更新用户存储空间: 用户ID {user.id}, 已用空间 {used_space} 字节"
                )

            except Exception as e:
                logger.error(f"更新用户存储空间失败: 用户ID {user.id}, 错误: {str(e)}")
                db.rollback()
                continue

        logger.info(f"用户存储空间清理完成: 共更新 {updated_count} 个用户")

        return {
            "status": "success",
            "message": "用户存储空间清理完成",
            "updated_count": updated_count,
        }

    except Exception as e:
        logger.error(f"清理用户存储空间失败: {str(e)}")
        raise Exception(f"清理用户存储空间失败: {str(e)}")


@celery_app.task
def cleanup_temp_files():
    """
    清理临时文件
    """
    try:
        logger.info("开始清理临时文件")

        # 临时文件目录（根据实际情况调整）
        temp_dirs = [
            "/tmp/nd_drive",
            "/var/tmp/nd_drive",
            os.path.join(os.getcwd(), "temp"),
        ]

        deleted_count = 0
        total_size = 0

        for temp_dir in temp_dirs:
            if not os.path.exists(temp_dir):
                continue

            # 删除超过7天的临时文件
            cutoff_time = datetime.utcnow() - timedelta(days=7)

            for root, dirs, filenames in os.walk(temp_dir):
                for filename in filenames:
                    file_path = os.path.join(root, filename)

                    try:
                        file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))

                        if file_mtime < cutoff_time:
                            file_size = os.path.getsize(file_path)
                            os.remove(file_path)

                            deleted_count += 1
                            total_size += file_size
                            logger.info(f"删除临时文件: {file_path}")

                    except Exception as e:
                        logger.error(f"删除临时文件失败: {file_path}, 错误: {str(e)}")
                        continue

        logger.info(
            f"临时文件清理完成: 删除 {deleted_count} 个文件, 释放 {total_size} 字节"
        )

        return {
            "status": "success",
            "message": "临时文件清理完成",
            "deleted_count": deleted_count,
            "total_size": total_size,
        }

    except Exception as e:
        logger.error(f"清理临时文件失败: {str(e)}")
        raise Exception(f"清理临时文件失败: {str(e)}")


@celery_app.task
def cleanup_database_logs():
    """
    清理数据库日志记录
    """
    try:
        logger.info("开始清理数据库日志记录")

        db = next(get_db())

        # 删除超过30天的操作日志（如果有相关表）
        # 这里假设有一个操作日志表，实际需要根据数据库结构调整
        # logs_deleted = db.query(OperationLog).filter(
        #     OperationLog.created_at < datetime.utcnow() - timedelta(days=30)
        # ).delete()

        # 暂时返回0，因为还没有操作日志表
        logs_deleted = 0

        logger.info(f"数据库日志清理完成: 删除 {logs_deleted} 条日志")

        return {
            "status": "success",
            "message": "数据库日志清理完成",
            "logs_deleted": logs_deleted,
        }

    except Exception as e:
        logger.error(f"清理数据库日志失败: {str(e)}")
        raise Exception(f"清理数据库日志失败: {str(e)}")


@celery_app.task
def cleanup_system_statistics():
    """
    清理系统统计数据
    """
    try:
        logger.info("开始清理系统统计数据")

        db = next(get_db())

        # 删除超过90天的系统统计数据（如果有相关表）
        # 这里假设有一个系统统计表，实际需要根据数据库结构调整
        # stats_deleted = db.query(SystemStatistics).filter(
        #     SystemStatistics.created_at < datetime.utcnow() - timedelta(days=90)
        # ).delete()

        # 暂时返回0，因为还没有系统统计表
        stats_deleted = 0

        logger.info(f"系统统计数据清理完成: 删除 {stats_deleted} 条统计")

        return {
            "status": "success",
            "message": "系统统计数据清理完成",
            "stats_deleted": stats_deleted,
        }

    except Exception as e:
        logger.error(f"清理系统统计数据失败: {str(e)}")
        raise Exception(f"清理系统统计数据失败: {str(e)}")


@celery_app.task
def run_full_cleanup():
    """
    执行完整的系统清理任务
    """
    try:
        logger.info("开始执行完整系统清理")

        # 按顺序执行所有清理任务
        cleanup_tasks = [
            cleanup_expired_download_tasks,
            cleanup_orphaned_files,
            cleanup_expired_share_links,
            cleanup_user_storage,
            cleanup_temp_files,
            cleanup_database_logs,
            cleanup_system_statistics,
        ]

        results = []

        for task in cleanup_tasks:
            try:
                result = task()
                results.append(result)
                logger.info(f"清理任务完成: {task.__name__}")

            except Exception as e:
                logger.error(f"清理任务失败: {task.__name__}, 错误: {str(e)}")
                results.append(
                    {"status": "error", "message": str(e), "task_name": task.__name__}
                )

        # 统计结果
        successful_tasks = sum(1 for r in results if r.get("status") == "success")
        failed_tasks = len(results) - successful_tasks

        logger.info(f"完整系统清理完成: 成功 {successful_tasks}, 失败 {failed_tasks}")

        return {
            "status": "success",
            "message": "完整系统清理完成",
            "total_tasks": len(cleanup_tasks),
            "successful_tasks": successful_tasks,
            "failed_tasks": failed_tasks,
            "results": results,
        }

    except Exception as e:
        logger.error(f"完整系统清理失败: {str(e)}")
        raise Exception(f"完整系统清理失败: {str(e)}")


@celery_app.task
def generate_cleanup_report():
    """
    生成清理报告
    """
    try:
        logger.info("开始生成清理报告")

        db = next(get_db())

        # 获取统计数据
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.status == "active").count()
        total_files = db.query(File).filter(File.is_deleted == False).count()
        total_storage = (
            db.query(func.sum(File.file_size)).filter(File.is_deleted == False).scalar()
            or 0
        )
        pending_downloads = (
            db.query(DownloadTask).filter(DownloadTask.status == "pending").count()
        )
        active_shares = (
            db.query(ShareLink).filter(ShareLink.is_deleted == False).count()
        )

        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "statistics": {
                "total_users": total_users,
                "active_users": active_users,
                "total_files": total_files,
                "total_storage_bytes": total_storage,
                "total_storage_mb": round(total_storage / (1024 * 1024), 2),
                "pending_downloads": pending_downloads,
                "active_shares": active_shares,
            },
            "recommendations": [],
        }

        # 生成建议
        if total_storage > 10 * 1024 * 1024 * 1024:  # 超过10GB
            report["recommendations"].append("存储空间使用量较高，建议清理过期文件")

        if pending_downloads > 100:
            report["recommendations"].append("待处理下载任务较多，建议检查下载队列")

        if active_shares > 50:
            report["recommendations"].append("活跃分享链接较多，建议检查分享管理")

        logger.info(f"清理报告生成完成: {datetime.utcnow()}")

        return {"status": "success", "message": "清理报告生成完成", "report": report}

    except Exception as e:
        logger.error(f"生成清理报告失败: {str(e)}")
        raise Exception(f"生成清理报告失败: {str(e)}")
