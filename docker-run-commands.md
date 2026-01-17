# Docker 直接运行命令

由于 Docker Compose 可能遇到凭证问题，以下是直接使用 docker run 命令启动服务的替代方案：

## 启动 MySQL 服务
```bash
docker run --name nd-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=nd \
  -e MYSQL_USER=nd_user \
  -e MYSQL_PASSWORD=123456 \
  -p 3306:3306 \
  -v /Users/test/Desktop/nd/mysql/data:/var/lib/mysql \
  -v /Users/test/Desktop/nd/mysql/conf:/etc/mysql/conf.d \
  -v /Users/test/Desktop/nd/mysql/init:/docker-entrypoint-initdb.d \
  -d mysql:8.0.36 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

## 启动 Redis 服务
```bash
docker run --name nd-redis \
  -e REDIS_PASSWORD=123456 \
  -p 6380:6379 \
  -v /Users/test/Desktop/nd/redis/data:/data \
  -v /Users/test/Desktop/nd/redis/conf/redis.conf:/etc/redis/redis.conf \
  -d redis:7.2.4 \
  redis-server /etc/redis/redis.conf
```

## 查看容器状态
```bash
docker ps -a
```

## 停止容器
```bash
docker stop nd-mysql nd-redis
```

## 删除容器
```bash
docker rm nd-mysql nd-redis
```