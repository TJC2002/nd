-- 分享表
CREATE TABLE IF NOT EXISTS `shares` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分享ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `file_id` BIGINT NOT NULL COMMENT '文件ID',
  `share_code` VARCHAR(32) NOT NULL COMMENT '分享码（唯一标识）',
  `share_url` VARCHAR(255) NOT NULL COMMENT '分享链接',
  `password` VARCHAR(64) DEFAULT NULL COMMENT '访问密码（可选）',
  `expire_time` DATETIME DEFAULT NULL COMMENT '过期时间（NULL表示永久有效）',
  `max_downloads` INT DEFAULT NULL COMMENT '最大下载次数（NULL表示无限制）',
  `download_count` INT DEFAULT 0 COMMENT '已下载次数',
  `view_count` INT DEFAULT 0 COMMENT '访问次数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态：active-有效，revoked-已撤销，expired-已过期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_share_code` (`share_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享表';

-- 分享访问记录表
CREATE TABLE IF NOT EXISTS `share_access_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '访问记录ID',
  `share_id` BIGINT NOT NULL COMMENT '分享ID',
  `access_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `ip_address` VARCHAR(64) DEFAULT NULL COMMENT '访问IP地址',
  `user_agent` VARCHAR(512) DEFAULT NULL COMMENT '用户代理信息',
  `action` VARCHAR(20) NOT NULL COMMENT '操作类型：view-查看，download-下载',
  PRIMARY KEY (`id`),
  KEY `idx_share_id` (`share_id`),
  KEY `idx_access_time` (`access_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享访问记录表';
