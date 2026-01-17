# Docker Compose 开发环境配置

## 概述
本配置文件用于启动MySQL和Redis服务，为ND网盘提供开发环境支持。

## 服务信息

### MySQL
- **版本**：8.0.36
- **端口**：3306
- **用户名**：nd_user
- **密码**：123456
- **数据库**：nd_drive

### Redis
- **版本**：7.2.4
- **端口**：6379
- **密码**：123456

## 目录结构
```
.
├── docker-compose.yml        # Docker Compose配置文件
├── mysql/
│   ├── conf/
│   │   └── my.cnf            # MySQL配置文件
│   └── init/
│       └── init.sql          # MySQL初始化脚本
└── redis/
    └── conf/
        └── redis.conf        # Redis配置文件
```

## 使用方法

### 1. 启动服务
```bash
# 在当前目录执行
docker-compose up -d
```

### 2. 停止服务
```bash
# 在当前目录执行
docker-compose down
```

### 3. 查看服务状态
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs mysql
docker-compose logs redis
```

### 4. 连接数据库
- **MySQL Workbench**：连接到 `localhost:3306`，使用上述用户名密码
- **命令行**：
  ```bash
  docker exec -it nd-mysql mysql -und_user -p123456 nd_drive
  ```

### 5. 连接Redis
- **Redis Desktop Manager**：连接到 `localhost:6379`，使用上述密码
- **命令行**：
  ```bash
  docker exec -it nd-redis redis-cli -a 123456
  ```

## 注意事项

1. **开发环境使用**：本配置仅用于开发环境，生产环境请使用更安全的配置
2. **数据持久化**：数据存储在Docker卷中，重启容器后数据不会丢失
3. **端口冲突**：如果本地已占用3306或6379端口，请修改docker-compose.yml中的端口映射
4. **初始化脚本**：首次启动时会执行init.sql脚本，创建必要的表结构和测试数据

## 技术支持
如有问题，请查看Docker和MySQL/Redis官方文档。