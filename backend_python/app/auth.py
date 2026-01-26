from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
import redis
import uuid
from app.config import settings

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis连接
redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    password=settings.redis_password,
    db=settings.redis_db,
    decode_responses=True,
)


class AuthService:
    def __init__(self):
        self.secret_key = settings.secret_key
        self.algorithm = settings.algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_days = settings.refresh_token_expire_days
        self.refresh_token_prefix = "refresh_token:"
        self.reset_token_prefix = "reset_token:"

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=self.access_token_expire_minutes
            )

        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def create_refresh_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def verify_token(self, token: str, token_type: str = "access"):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type",
                )

            username: str = payload.get("sub")
            if username is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                )
            return username
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

    def store_refresh_token(self, user_id: int, refresh_token: str):
        key = f"{self.refresh_token_prefix}{refresh_token}"
        redis_client.setex(key, self.refresh_token_expire_days * 24 * 3600, user_id)

    def get_user_id_from_refresh_token(self, refresh_token: str) -> Optional[int]:
        key = f"{self.refresh_token_prefix}{refresh_token}"
        user_id = redis_client.get(key)
        return int(user_id) if user_id else None

    def delete_refresh_token(self, refresh_token: str):
        key = f"{self.refresh_token_prefix}{refresh_token}"
        redis_client.delete(key)

    def store_reset_token(self, user_id: int, reset_token: str):
        key = f"{self.reset_token_prefix}{reset_token}"
        redis_client.setex(key, 3600, user_id)  # 1小时过期

    def get_user_id_from_reset_token(self, reset_token: str) -> Optional[int]:
        key = f"{self.reset_token_prefix}{reset_token}"
        user_id = redis_client.get(key)
        return int(user_id) if user_id else None

    def delete_reset_token(self, reset_token: str):
        key = f"{self.reset_token_prefix}{reset_token}"
        redis_client.delete(key)

    def generate_share_code(self) -> str:
        return str(uuid.uuid4()).replace("-", "")[:8]


auth_service = AuthService()
