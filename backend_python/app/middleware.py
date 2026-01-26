import time
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.exceptions import (
    ErrorHandler,
    NDDriveException,
    AuthenticationError,
    AuthorizationError,
    FileOperationError,
    ShareError,
    ValidationError,
    ResourceNotFoundError,
    QuotaExceededError,
    RateLimitExceededError,
)
from app.dependencies import get_current_active_user
from app.models import User
from app.auth import verify_token
import logging

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except NDDriveException as e:
            return await ErrorHandler.handle_nddrive_exception(request, e)
        except Exception as e:
            return await ErrorHandler.handle_generic_exception(request, e)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        user = None
        try:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
                payload = verify_token(token)
                if payload:
                    user = User(
                        id=payload.get("user_id"), username=payload.get("username")
                    )
        except Exception:
            pass

        from app.exceptions import log_request

        log_request(request, user)

        try:
            response = await call_next(request)

            execution_time = time.time() - start_time

            from app.exceptions import log_response

            log_response(request, response, execution_time, user)

            return response

        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Request failed after {execution_time:.2f}s: {str(e)}")
            raise


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        }

        response = await call_next(request)

        for header, value in security_headers.items():
            response.headers[header] = value

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.user_requests = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        user_id = self._get_user_id(request)

        if not self._check_rate_limit(user_id):
            from app.exceptions import RateLimitExceededError

            raise RateLimitExceededError("Rate limit exceeded")

        response = await call_next(request)
        return response

    def _get_user_id(self, request: Request) -> str:
        try:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
                payload = verify_token(token)
                if payload:
                    return str(payload.get("user_id"))
        except Exception:
            pass

        return request.client.host if request.client else "unknown"

    def _check_rate_limit(self, user_id: str) -> bool:
        import time

        current_time = time.time()

        if user_id not in self.user_requests:
            self.user_requests[user_id] = []

        self.user_requests[user_id] = [
            req_time
            for req_time in self.user_requests[user_id]
            if current_time - req_time < 60
        ]

        if len(self.user_requests[user_id]) >= self.requests_per_minute:
            return False

        self.user_requests[user_id].append(current_time)
        return True


class CORSMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        allow_origins: list = None,
        allow_methods: list = None,
        allow_headers: list = None,
    ):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or ["*"]
        self.allow_headers = allow_headers or ["*"]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        response.headers["Access-Control-Allow-Origin"] = ", ".join(self.allow_origins)
        response.headers["Access-Control-Allow-Methods"] = ", ".join(self.allow_methods)
        response.headers["Access-Control-Allow-Headers"] = ", ".join(self.allow_headers)
        response.headers["Access-Control-Allow-Credentials"] = "true"

        return response


class ContentLengthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            content_length = int(content_length)
            max_content_length = 100 * 1024 * 1024

            if content_length > max_content_length:
                from app.exceptions import FileOperationError

                raise FileOperationError("Request entity too large")

        response = await call_next(request)
        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        import uuid

        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())

        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response


def setup_middleware(app):
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(CORSMiddleware)
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=60)
    app.add_middleware(ContentLengthMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(ErrorHandlerMiddleware)

    logger.info("Middleware setup completed")


def setup_exception_handlers(app):
    @app.exception_handler(NDDriveException)
    async def nddrive_exception_handler(request: Request, exc: NDDriveException):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(AuthenticationError)
    async def authentication_exception_handler(
        request: Request, exc: AuthenticationError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(AuthorizationError)
    async def authorization_exception_handler(
        request: Request, exc: AuthorizationError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(FileOperationError)
    async def file_operation_exception_handler(
        request: Request, exc: FileOperationError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(ShareError)
    async def share_exception_handler(request: Request, exc: ShareError):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(ResourceNotFoundError)
    async def resource_not_found_exception_handler(
        request: Request, exc: ResourceNotFoundError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(QuotaExceededError)
    async def quota_exceeded_exception_handler(
        request: Request, exc: QuotaExceededError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    @app.exception_handler(RateLimitExceededError)
    async def rate_limit_exceeded_exception_handler(
        request: Request, exc: RateLimitExceededError
    ):
        return await ErrorHandler.handle_nddrive_exception(request, exc)

    logger.info("Exception handlers setup completed")
