from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import auth_service

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 验证token
        username = auth_service.verify_token(credentials.credentials)

        # 查询用户
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception

        return user
    except Exception:
        raise credentials_exception


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user
