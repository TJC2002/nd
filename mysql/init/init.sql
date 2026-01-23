# 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS nd DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 授权用户
GRANT ALL PRIVILEGES ON nd.* TO 'nd_user'@'%' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;

# 使用数据库
USE nd;

# 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    total_space BIGINT NOT NULL DEFAULT 2147483648, -- 2TB
    used_space BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

# 创建设备表
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(20) NOT NULL,
    device_identifier VARCHAR(255) NOT NULL,
    last_login_ip VARCHAR(50),
    last_login_time DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

# 创建设备登录历史表
CREATE TABLE IF NOT EXISTS device_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    login_ip VARCHAR(50) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_time DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

# 创建文件元数据表（存储文件的核心元数据，只存储一次）
CREATE TABLE IF NOT EXISTS file_metadata (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hash_value VARCHAR(255) UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_node_id BIGINT,
    storage_path VARCHAR(500),
    cover_path VARCHAR(500),
    reference_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 创建文件表（存储用户与文件的关联）
CREATE TABLE IF NOT EXISTS files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    parent_id BIGINT NOT NULL DEFAULT 0,
    metadata_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_folder BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (metadata_id) REFERENCES file_metadata(id) ON DELETE CASCADE
);

# 创建存储节点表
CREATE TABLE IF NOT EXISTS storage_nodes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    config TEXT,
    total_space BIGINT NOT NULL,
    used_space BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    priority INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 创建系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    `value` TEXT,
    description VARCHAR(255),
    updated_by VARCHAR(50),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

# 插入默认系统配置
INSERT IGNORE INTO system_configs (`key`, `value`, description) VALUES
('version_history_limit', '10', '文件历史版本保留数量'),
('recycle_bin_days', '30', '回收站文件保留天数'),
('offline_download_limit', '5', '离线下载任务数上限'),
('chunk_size', '4194304', '文件上传分片大小（4MB）'),
('max_file_size', '10737418240', '单个文件最大大小（10GB）');

# 创建用户配置表
CREATE TABLE IF NOT EXISTS user_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, `key`)
);

# 创建异步任务表
CREATE TABLE IF NOT EXISTS async_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INT NOT NULL DEFAULT 0,
    message TEXT,
    result_data TEXT,
    error_details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

# 创建测试用户
INSERT IGNORE INTO users (username, password_hash, email, phone) VALUES
('test', '$2a$10$eWm5nQ5eQ5eQ5eQ5eQ5e.Q5eQ5eQ5eQ5eQ5eQ5eQ5eQ5eQ5eQ5', 'test@example.com', '13800138000');
