"""
数据库初始化脚本
创建数据库表和初始数据
"""

from app.database import engine, SessionLocal
from app.models import *
from app.services.auth_service import AuthService
from app.auth import auth_service
from datetime import datetime


def create_tables():
    """创建数据库表"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


def create_admin_user():
    """创建管理员用户"""
    db = SessionLocal()
    try:
        # 检查是否已存在管理员用户
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print("Admin user already exists!")
            return

        # 创建管理员用户
        admin_user = User(
            username="admin",
            password_hash=auth_service.get_password_hash("admin123"),
            email="admin@example.com",
            phone="13800138000",
            total_space=10737418240,  # 10GB
            used_space=0,
            status="active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"Admin user created successfully!")
        print(f"Username: admin")
        print(f"Password: admin123")
        print(f"Email: admin@example.com")

    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """主函数"""
    print("Starting database initialization...")

    # 创建表
    create_tables()

    # 创建管理员用户
    create_admin_user()

    print("Database initialization completed!")


if __name__ == "__main__":
    main()
