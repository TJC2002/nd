# 用户配置表（user_configs）使用说明

## 概述

`user_configs` 表用于存储用户的个性化配置信息，允许每个用户设置自己的偏好和定制化选项。

## 表结构

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | 配置ID |
| `user_id` | `BIGINT` | `NOT NULL, FOREIGN KEY` | 用户ID，关联到 users 表 |
| `key` | `VARCHAR(100)` | `NOT NULL` | 配置键 |
| `value` | `TEXT` | | 配置值 |
| `description` | `VARCHAR(255)` | | 配置描述 |
| `created_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `DATETIME` | `NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 更新时间 |
| **唯一约束** | | `UNIQUE KEY (user_id, key)` | 确保每个用户的配置键唯一 |
| **外键约束** | | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` | 用户删除时自动删除相关配置 |

## 数据模型

### UserConfig
```java
public class UserConfig {
    private Long id;
    private Long userId;
    private String key;
    private String value;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## API 接口

### 1. 获取用户配置列表
- **方法**: `GET`
- **路径**: `/api/user-configs`
- **功能**: 获取当前用户的所有配置
- **认证**: 需要 Bearer Token
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": [
      {
        "id": 1,
        "userId": 1,
        "key": "theme",
        "value": "dark",
        "description": "界面主题",
        "createdAt": "2026-01-21T12:00:00",
        "updatedAt": "2026-01-21T12:00:00"
      }
    ]
  }
  ```

### 2. 获取指定配置
- **方法**: `GET`
- **路径**: `/api/user-configs/{key}`
- **功能**: 根据配置键获取用户配置
- **认证**: 需要 Bearer Token
- **参数**:
  - `key` (路径参数): 配置键
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "userId": 1,
      "key": "theme",
      "value": "dark",
      "description": "界面主题",
      "createdAt": "2026-01-21T12:00:00",
      "updatedAt": "2026-01-21T12:00:00"
    }
  }
  ```

### 3. 设置用户配置
- **方法**: `POST`
- **路径**: `/api/user-configs`
- **功能**: 设置或更新用户配置
- **认证**: 需要 Bearer Token
- **请求体**:
  ```json
  {
    "key": "theme",
    "value": "dark",
    "description": "界面主题"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "userId": 1,
      "key": "theme",
      "value": "dark",
      "description": "界面主题",
      "createdAt": "2026-01-21T12:00:00",
      "updatedAt": "2026-01-21T12:00:00"
    }
  }
  ```

### 4. 删除用户配置
- **方法**: `DELETE`
- **路径**: `/api/user-configs/{key}`
- **功能**: 根据配置键删除用户配置
- **认证**: 需要 Bearer Token
- **参数**:
  - `key` (路径参数): 配置键
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": "User config deleted successfully"
  }
  ```

### 5. 删除所有用户配置
- **方法**: `DELETE`
- **路径**: `/api/user-configs`
- **功能**: 删除当前用户的所有配置
- **认证**: 需要 Bearer Token
- **响应**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": "All user configs deleted successfully"
  }
  ```

## 推荐配置项

以下是一些推荐的用户配置项示例：

### 1. 界面配置
- `theme`: 界面主题（light/dark/system）
- `language`: 语言偏好
- `layout`: 布局偏好（grid/list）
- `sidebar`: 侧边栏状态（expanded/collapsed）

### 2. 上传/下载配置
- `auto_upload`: 自动上传设置
- `download_path`: 默认下载路径
- `chunk_size`: 上传分片大小
- `max_upload_speed`: 上传速度限制

### 3. 通知配置
- `email_notifications`: 邮件通知开关
- `push_notifications`: 推送通知开关
- `notification_sound`: 通知声音
- `notification_frequency`: 通知频率

### 4. 安全配置
- `two_factor_auth`: 双因素认证设置
- `session_timeout`: 会话超时时间
- `auto_lock`: 自动锁定时间
- `device_management`: 设备管理设置

### 5. 存储配置
- `default_storage_node`: 默认存储节点
- `storage_optimization`: 存储优化设置
- `file_versioning`: 文件版本控制设置
- `recycle_bin_days`: 回收站保留天数

## 使用示例

### 示例 1: 设置界面主题
```bash
curl -X POST http://localhost:8080/api/user-configs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "theme",
    "value": "dark",
    "description": "界面主题设置"
  }'
```

### 示例 2: 获取所有配置
```bash
curl -X GET http://localhost:8080/api/user-configs \
  -H "Authorization: Bearer <token>"
```

### 示例 3: 获取指定配置
```bash
curl -X GET http://localhost:8080/api/user-configs/theme \
  -H "Authorization: Bearer <token>"
```

### 示例 4: 删除配置
```bash
curl -X DELETE http://localhost:8080/api/user-configs/theme \
  -H "Authorization: Bearer <token>"
```

## 注意事项

1. **配置键命名规范**:
   - 使用小写字母和下划线
   - 避免使用特殊字符
   - 保持键名简洁明了

2. **配置值类型**:
   - 字符串值直接存储
   - 布尔值使用 "true"/"false"
   - 数字值使用字符串形式
   - 复杂结构使用 JSON 字符串

3. **性能考虑**:
   - 避免存储过大的配置值
   - 合理使用配置缓存
   - 定期清理无用配置

4. **安全性**:
   - 不要存储敏感信息（如密码、API 密钥）
   - 敏感配置应加密存储
   - 定期审计配置变更

5. **兼容性**:
   - 为新配置提供默认值
   - 处理配置键不存在的情况
   - 支持配置版本管理

## 故障排除

### 常见问题

1. **配置不生效**:
   - 检查配置键是否正确
   - 验证用户权限
   - 查看系统日志

2. **配置保存失败**:
   - 检查数据库连接
   - 验证唯一约束
   - 确认用户存在

3. **配置获取为空**:
   - 确认配置键存在
   - 检查用户 ID
   - 验证认证状态

4. **性能问题**:
   - 检查配置数量
   - 优化查询
   - 考虑使用缓存

## 技术支持

如有问题，请联系系统管理员或查看：
- API 文档：`http://your-server:8080/swagger-ui.html`
- 服务器日志：`logs/nd.log`
- 数据库状态：检查 user_configs 表结构
