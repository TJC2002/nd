# ND Drive Python后端

这是从Java Spring Boot项目转换而来的Python FastAPI版本的个人网盘系统后端。

## 项目结构

```
backend_python/
├── app/
│   ├── __init__.py
│   ├── config.py              # 配置文件
│   ├── database.py            # 数据库连接
│   ├── models.py              # 数据模型
│   ├── schemas.py             # Pydantic模型
│   ├── auth.py                # 认证服务
│   ├── dependencies.py        # 依赖注入
│   ├── controllers/           # 控制器
│   │   ├── auth_controller.py
│   │   ├── user_controller.py
│   │   ├── file_controller.py
│   │   └── share_controller.py
│   └── services/              # 服务层
│       ├── auth_service.py
│       ├── user_service.py
│       ├── file_service.py
│       └── share_service.py
├── main.py                    # 主应用入口
├── init_db.py                 # 数据库初始化脚本
├── requirements.txt           # 依赖包
└── README.md                 # 说明文档
```

## 功能特性

### 已实现功能
- ✅ 用户注册、登录、登出
- ✅ JWT Token认证
- ✅ 用户信息管理
- ✅ 文件上传、下载
- ✅ 文件夹管理
- ✅ 文件搜索
- ✅ 文件分享
- ✅ 秒传功能
- ✅ 分片上传
- ✅ 存储空间管理

### 待实现功能
- ⏳ WebDAV支持
- ⏳ 离线下载
- ⏳ 异步任务管理
- ⏳ 回收站功能
- ⏳ 收藏功能
- ⏳ 设备管理
- ⏳ 文件预览
- ⏳ 文件转换

## 技术栈

- **Web框架**: FastAPI
- **数据库**: MySQL + SQLAlchemy
- **缓存**: Redis
- **认证**: JWT + bcrypt
- **文件存储**: 本地文件系统
- **异步任务**: Celery (已配置，未实现)
- **API文档**: 自动生成 (Swagger UI)

## 安装和运行

### 1. 环境要求
- Python 3.8+
- MySQL 8.0+
- Redis 6.0+

### 2. 安装依赖
```bash
cd backend_python
pip install -r requirements.txt
```

### 3. 数据库配置
确保MySQL和Redis服务正在运行，数据库配置在 `app/config.py` 中：

```python
database_url = "mysql+pymysql://nd_user:123456@localhost:3306/nd_drive"
redis_host = "localhost"
redis_port = 6379
redis_password = "123456"
```

### 4. 初始化数据库
```bash
python init_db.py
```

这将创建数据库表并创建一个管理员用户：
- 用户名: admin
- 密码: admin123
- 邮箱: admin@example.com

### 5. 启动服务
```bash
python main.py
```

服务将在 `http://localhost:8000` 启动。

### 6. 访问API文档
打开浏览器访问 `http://localhost:8000/docs` 查看自动生成的API文档。

## API接口

### 认证相关
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `POST /auth/refresh` - 刷新Token
- `POST /auth/logout` - 用户登出
- `POST /auth/forgot-password` - 密码找回
- `POST /auth/reset-password` - 密码重置
- `POST /auth/delete-account` - 删除账号

### 用户管理
- `GET /users/profile` - 获取用户信息
- `PUT /users/profile` - 更新用户信息
- `PUT /users/password` - 修改密码
- `GET /users/storage` - 获取存储信息
- `POST /users/logout-all` - 退出所有设备

### 文件管理
- `GET /files` - 获取文件列表
- `GET /files/path` - 获取文件夹路径
- `GET /files/search` - 搜索文件
- `POST /files/upload` - 上传文件
- `GET /files/{file_id}` - 获取文件信息
- `GET /files/{file_id}/download` - 下载文件
- `PUT /files/{file_id}/move` - 移动文件
- `PUT /files/{file_id}/rename` - 重命名文件
- `DELETE /files/{file_id}` - 删除文件
- `POST /files/folders` - 创建文件夹
- `POST /files/check` - 秒传检查
- `POST /files/upload/init` - 上传初始化
- `POST /files/upload/chunk` - 分片上传
- `POST /files/upload/complete` - 完成上传

### 分享管理
- `POST /api/shares` - 创建分享链接
- `POST /api/shares/verify` - 验证分享链接
- `GET /api/shares` - 获取用户分享列表
- `GET /api/shares/{share_code}` - 获取分享信息
- `POST /api/shares/{share_id}/revoke` - 撤销分享
- `DELETE /api/shares/{share_id}` - 删除分享
- `GET /api/shares/{share_code}/download` - 下载分享文件

## 与Java版本的对比

### 架构差异
- **Java**: Spring Boot + MyBatis + SaToken
- **Python**: FastAPI + SQLAlchemy + JWT

### 主要改进
1. **性能**: Python异步支持更好，适合IO密集型操作
2. **简洁性**: 代码量减少约30%
3. **灵活性**: 动态语言特性，开发效率更高
4. **部署**: 更轻量级，容器化部署更简单

### 功能保持
- ✅ 所有核心业务逻辑保持一致
- ✅ API接口兼容
- ✅ 数据库结构兼容
- ✅ 认证机制兼容

## 配置说明

### 环境变量
可以通过 `.env` 文件配置：

```env
# 基础配置
APP_NAME=ND Drive
DEBUG=True

# 数据库配置
DATABASE_URL=mysql+pymysql://nd_user:123456@localhost:3306/nd_drive

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456

# JWT配置
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# 文件存储配置
UPLOAD_DIR=./storage/uploads
MAX_FILE_SIZE=10737418240  # 10GB
CHUNK_SIZE=10485760  # 10MB
```

### 存储配置
默认使用本地文件系统存储，文件路径为：
```
./storage/uploads/{user_id}/{filename}
```

## 开发说明

### 添加新功能
1. 在 `app/models.py` 中添加数据模型
2. 在 `app/schemas.py` 中添加请求/响应模型
3. 在 `app/services/` 中添加业务逻辑
4. 在 `app/controllers/` 中添加API接口
5. 更新数据库迁移（如需要）

### 数据库迁移
使用Alembic进行数据库版本管理：

```bash
# 初始化Alembic
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head
```

### 测试
```bash
# 运行测试
pytest

# 生成测试覆盖率报告
pytest --cov=app
```

## 部署

### Docker部署
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### 生产环境配置
1. 使用Gunicorn作为WSGI服务器
2. 配置Nginx作为反向代理
3. 使用Supervisor管理进程
4. 配置SSL证书
5. 设置环境变量

## 故障排除

### 常见问题
1. **数据库连接失败**: 检查MySQL服务是否运行，用户名密码是否正确
2. **Redis连接失败**: 检查Redis服务是否运行
3. **文件上传失败**: 检查存储目录权限，磁盘空间是否足够
4. **JWT认证失败**: 检查SECRET_KEY配置，Token是否过期

### 日志查看
```bash
# 查看应用日志
tail -f app.log

# 查看系统日志
journalctl -u nd-drive
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题请提交Issue或联系开发者。