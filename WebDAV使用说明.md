# WebDAV 协议使用说明

## 概述

ND网盘现已支持 WebDAV 协议，允许用户通过标准的 WebDAV 客户端访问和管理网盘文件。类似于夸克网盘，用户可以使用网易爆米花、Alist 等工具挂载网盘资源。

## WebDAV 协议信息

- **协议地址**: `http://your-server:8080/webdav`
- **认证方式**: HTTP Basic Authentication
- **用户名**: 您的 ND 网盘用户名
- **密码**: 您的 ND 网盘密码

## 支持的 WebDAV 操作

### 1. PROPFIND - 获取文件/文件夹属性
- 查看文件列表
- 获取文件元数据（大小、修改时间等）

### 2. GET - 下载文件
- 下载文件内容
- 支持断点续传

### 3. PUT - 上传文件
- 上传新文件
- 覆盖已有文件

### 4. DELETE - 删除文件/文件夹
- 删除文件
- 删除文件夹

### 5. MKCOL - 创建文件夹
- 创建新文件夹

### 6. COPY - 复制文件/文件夹
- 复制文件
- 复制文件夹

### 7. MOVE - 移动/重命名文件/文件夹
- 移动文件
- 重命名文件
- 移动文件夹

## 使用方法

### 方法一：使用 Windows 资源管理器

1. 打开"此电脑"或"文件资源管理器"
2. 在地址栏输入 WebDAV 地址：`http://your-server:8080/webdav`
3. 按回车，输入用户名和密码
4. 即可像操作本地文件一样操作网盘文件

### 方法二：使用 macOS Finder

1. 打开 Finder
2. 在菜单栏选择"前往" -> "连接服务器..."
3. 输入 WebDAV 地址：`http://your-server:8080/webdav`
4. 点击"连接"
5. 输入用户名和密码
6. 选择访客或注册用户，点击"连接"

### 方法三：使用 Linux (Nautilus/Dolphin)

#### Nautilus (GNOME)
1. 打开文件管理器
2. 在地址栏输入：`davs://your-server:8080/webdav`
3. 按回车，输入凭据

#### Dolphin (KDE)
1. 打开文件管理器
2. 在地址栏输入：`webdav://your-server:8080/webdav`
3. 按回车，输入凭据

### 方法四：使用 Alist

Alist 是一个支持多种存储的文件列表程序，支持 WebDAV 挂载。

1. 安装并启动 Alist
2. 访问 Alist 管理界面
3. 添加存储，选择 "WebDAV"
4. 填写配置信息：
   - 挂载路径: `/nd`
   - WebDAV 链接: `http://your-server:8080/webdav`
   - WebDAV 用户名: 您的 ND 网盘用户名
   - WebDAV 密码: 您的 ND 网盘密码
   - 根文件夹路径: `/`
5. 保存配置

### 方法五：使用网易爆米花

网易爆米花是一款支持 WebDAV 的网盘客户端。

1. 下载并安装网易爆米花
2. 添加资源
3. 选择 WebDAV 协议
4. 填写配置信息：
   - 服务器地址: `your-server`
   - 端口: `8080`
   - 路径: `/webdav`
   - 用户名: 您的 ND 网盘用户名
   - 密码: 您的 ND 网盘密码
5. 保存并连接

## 注意事项

1. **安全性**: WebDAV 使用 HTTP Basic Authentication，建议在生产环境中使用 HTTPS
2. **文件大小限制**: 默认最大文件大小为 100MB，可在配置文件中调整
3. **性能**: 大文件上传/下载可能需要较长时间，请耐心等待
4. **并发**: WebDAV 支持并发操作，但请注意服务器负载
5. **路径**: WebDAV 路径映射到用户的根目录，无法访问其他用户的文件

## 配置说明

在 `application.yml` 中可以配置 WebDAV 相关参数：

```yaml
webdav:
  enabled: true              # 是否启用 WebDAV
  path: /webdav             # WebDAV 路径
  max-file-size: 100MB       # 最大文件大小
  max-request-size: 100MB    # 最大请求大小
```

## 故障排除

### 问题 1: 连接失败
- 检查服务器地址和端口是否正确
- 确认服务器防火墙是否开放相应端口
- 检查用户名和密码是否正确

### 问题 2: 认证失败
- 确认用户名和密码正确
- 检查用户账号状态是否正常
- 尝试重新登录

### 问题 3: 文件上传失败
- 检查文件大小是否超过限制
- 确认服务器存储空间是否充足
- 检查网络连接是否稳定

### 问题 4: 文件列表为空
- 确认用户根目录下有文件
- 检查 WebDAV 路径配置是否正确
- 尝试刷新文件列表

## 技术支持

如有问题，请查看：
- 服务器日志：`logs/nd.log`
- API 文档：`http://your-server:8080/swagger-ui.html`
- GitHub Issues：提交问题并附上错误日志
