import logging
import sys
from typing import Any, Dict, Optional
from datetime import datetime
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import traceback
from app.models import User


class NDDriveException(Exception):
    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.timestamp = datetime.now()
        super().__init__(self.message)


class AuthenticationError(NDDriveException):
    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "AUTH_ERROR", details)


class AuthorizationError(NDDriveException):
    def __init__(
        self,
        message: str = "Authorization failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "AUTHZ_ERROR", details)


class FileOperationError(NDDriveException):
    def __init__(
        self,
        message: str = "File operation failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "FILE_ERROR", details)


class ShareError(NDDriveException):
    def __init__(
        self,
        message: str = "Share operation failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "SHARE_ERROR", details)


class ValidationError(NDDriveException):
    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "VALIDATION_ERROR", details)


class ResourceNotFoundError(NDDriveException):
    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "NOT_FOUND", details)


class QuotaExceededError(NDDriveException):
    def __init__(
        self,
        message: str = "Storage quota exceeded",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "QUOTA_EXCEEDED", details)


class RateLimitExceededError(NDDriveException):
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", details)


def setup_logging():
    import os

    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(f"{log_dir}/app.log", encoding="utf-8"),
            logging.FileHandler(f"{log_dir}/errors.log", encoding="utf-8"),
        ],
    )

    # Set level for error log handler
    error_handler = logging.getLogger().handlers[-1]
    error_handler.setLevel(logging.ERROR)

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

    loggers = [
        "app.auth",
        "app.services.file_service",
        "app.services.share_service",
        "app.services.user_service",
        "app.controllers",
        "app.webdav",
        "app.database",
        "app.middleware",
    ]

    for logger_name in loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)

        if logger_name not in ["app.controllers", "app.webdav"]:
            file_handler = logging.FileHandler(
                f"{log_dir}/{logger_name.replace('.', '_')}.log", encoding="utf-8"
            )
            file_handler.setLevel(logging.INFO)
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    return logging.getLogger(__name__)


def log_request(
    request: Request, user: Optional[User] = None, action: str = "API_REQUEST"
):
    logger = logging.getLogger("app.middleware.request")

    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    method = request.method
    url = str(request.url)

    log_data = {
        "action": action,
        "method": method,
        "url": url,
        "client_ip": client_ip,
        "user_agent": user_agent,
        "timestamp": datetime.now().isoformat(),
    }

    if user:
        log_data["user_id"] = user.id
        log_data["username"] = user.username

    logger.info(f"Request: {log_data}")


def log_response(
    request: Request,
    response: JSONResponse,
    execution_time: float,
    user: Optional[User] = None,
):
    logger = logging.getLogger("app.middleware.response")

    client_ip = request.client.host if request.client else "unknown"
    status_code = response.status_code

    log_data = {
        "action": "API_RESPONSE",
        "method": request.method,
        "url": str(request.url),
        "client_ip": client_ip,
        "status_code": status_code,
        "execution_time_ms": round(execution_time * 1000, 2),
        "timestamp": datetime.now().isoformat(),
    }

    if user:
        log_data["user_id"] = user.id
        log_data["username"] = user.username

    if status_code >= 400:
        logger.error(f"Error Response: {log_data}")
    else:
        logger.info(f"Response: {log_data}")


def log_error(error: Exception, context: Optional[Dict[str, Any]] = None):
    logger = logging.getLogger("app.middleware.error")

    error_type = type(error).__name__
    error_message = str(error)
    stack_trace = traceback.format_exc()

    log_data = {
        "action": "ERROR",
        "error_type": error_type,
        "error_message": error_message,
        "stack_trace": stack_trace,
        "timestamp": datetime.now().isoformat(),
        "context": context or {},
    }

    if isinstance(error, NDDriveException):
        log_data.update({"error_code": error.error_code, "details": error.details})

    logger.error(f"Error occurred: {log_data}")


def log_user_action(user: User, action: str, details: Optional[Dict[str, Any]] = None):
    logger = logging.getLogger("app.middleware.audit")

    log_data = {
        "action": "USER_ACTION",
        "user_id": user.id,
        "username": user.username,
        "action_type": action,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
    }

    logger.info(f"User action: {log_data}")


def log_file_operation(
    user: User,
    operation: str,
    file_info: Optional[Dict[str, Any]] = None,
    details: Optional[Dict[str, Any]] = None,
):
    logger = logging.getLogger("app.middleware.file_audit")

    log_data = {
        "action": "FILE_OPERATION",
        "user_id": user.id,
        "username": user.username,
        "operation": operation,
        "timestamp": datetime.now().isoformat(),
        "file_info": file_info or {},
        "details": details or {},
    }

    logger.info(f"File operation: {log_data}")


def log_share_operation(
    user: User,
    operation: str,
    share_info: Optional[Dict[str, Any]] = None,
    details: Optional[Dict[str, Any]] = None,
):
    logger = logging.getLogger("app.middleware.share_audit")

    log_data = {
        "action": "SHARE_OPERATION",
        "user_id": user.id,
        "username": user.username,
        "operation": operation,
        "timestamp": datetime.now().isoformat(),
        "share_info": share_info or {},
        "details": details or {},
    }

    logger.info(f"Share operation: {log_data}")


def log_security_event(event_type: str, details: Optional[Dict[str, Any]] = None):
    logger = logging.getLogger("app.middleware.security")

    log_data = {
        "action": "SECURITY_EVENT",
        "event_type": event_type,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
    }

    logger.warning(f"Security event: {log_data}")


def log_performance_metric(
    operation: str, execution_time: float, details: Optional[Dict[str, Any]] = None
):
    logger = logging.getLogger("app.middleware.performance")

    log_data = {
        "action": "PERFORMANCE_METRIC",
        "operation": operation,
        "execution_time_ms": round(execution_time * 1000, 2),
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
    }

    logger.info(f"Performance metric: {log_data}")


def log_database_operation(
    operation: str, table: str, details: Optional[Dict[str, Any]] = None
):
    logger = logging.getLogger("app.middleware.database")

    log_data = {
        "action": "DATABASE_OPERATION",
        "operation": operation,
        "table": table,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
    }

    logger.debug(f"Database operation: {log_data}")


setup_logging()


class ErrorHandler:
    @staticmethod
    async def handle_nddrive_exception(
        request: Request, exc: NDDriveException
    ) -> JSONResponse:
        log_error(
            exc,
            {
                "request": str(request.url),
                "user_id": getattr(request.state, "user_id", None),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "timestamp": exc.timestamp.isoformat(),
            },
        )

    @staticmethod
    async def handle_http_exception(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        log_error(
            exc,
            {
                "request": str(request.url),
                "user_id": getattr(request.state, "user_id", None),
            },
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": "HTTP_ERROR",
                "message": exc.detail,
                "timestamp": datetime.now().isoformat(),
            },
        )

    @staticmethod
    async def handle_sqlalchemy_error(
        request: Request, exc: SQLAlchemyError
    ) -> JSONResponse:
        log_error(
            exc,
            {
                "request": str(request.url),
                "user_id": getattr(request.state, "user_id", None),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "code": "DATABASE_ERROR",
                "message": "Database operation failed",
                "timestamp": datetime.now().isoformat(),
            },
        )

    @staticmethod
    async def handle_generic_exception(
        request: Request, exc: Exception
    ) -> JSONResponse:
        log_error(
            exc,
            {
                "request": str(request.url),
                "user_id": getattr(request.state, "user_id", None),
            },
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "code": "INTERNAL_ERROR",
                "message": "Internal server error",
                "timestamp": datetime.now().isoformat(),
            },
        )
