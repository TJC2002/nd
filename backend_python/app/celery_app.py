from celery import Celery
from app.config import settings
import os

celery_app = Celery(
    "nd_drive",
    broker=f"redis://:{settings.redis_password}@{settings.redis_host}:{settings.redis_port}/0",
    backend=f"redis://:{settings.redis_password}@{settings.redis_host}:{settings.redis_port}/1",
    include=[
        "app.tasks.download_tasks",
        "app.tasks.file_tasks",
        "app.tasks.cleanup_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_routes={
        "app.tasks.download_tasks.*": {"queue": "download_queue"},
        "app.tasks.file_tasks.*": {"queue": "file_queue"},
        "app.tasks.cleanup_tasks.*": {"queue": "cleanup_queue"},
    },
    task_default_queue="default",
    task_default_exchange="default",
    task_default_routing_key="default",
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=False,
    task_compression="gzip",
    result_expires=3600,
    worker_hijack_root_logger=False,
    worker_log_color=False,
    worker_redirect_stdouts=False,
    worker_redirect_stdouts_level="INFO",
)

os.makedirs("task_results", exist_ok=True)
os.makedirs("task_logs", exist_ok=True)


@celery_app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
    return "OK"


def get_celery_app():
    return celery_app
