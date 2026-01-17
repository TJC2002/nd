# 后端测试说明

## 测试概述

本项目使用JUnit 5和Mockito进行单元测试和集成测试。

## 测试覆盖范围

### Service层单元测试

#### UserServiceTest
- getUserById_Success - 测试根据ID获取用户
- getUserById_NotFound - 测试用户不存在的情况
- updateUser_Success - 测试更新用户信息
- updateUser_NotFound - 测试更新不存在的用户
- changePassword_Success - 测试修改密码
- changePassword_WrongCurrentPassword - 测试当前密码错误
- changePassword_UserNotFound - 测试用户不存在

#### DeviceServiceTest
- getDevicesByUserId_Success - 测试获取用户设备列表
- getDevicesByUserId_Empty - 测试获取空设备列表
- logoutDevice_Success - 测试远程下线设备
- logoutDevice_DeviceNotFound - 测试下线不存在的设备
- logoutDevice_DeviceNotBelongToUser - 测试下线不属于当前用户的设备

### Controller层集成测试

#### UserControllerTest
- getCurrentUser_Success - 测试获取当前用户信息
- updateUser_Success - 测试更新当前用户信息
- changePassword_Success - 测试修改密码
- getCurrentUser_Unauthorized - 测试未认证访问
- updateUser_Unauthorized - 测试未认证更新

#### DeviceControllerTest
- getDevices_Success - 测试获取设备列表
- getDevices_Empty - 测试获取空设备列表
- logoutDevice_Success - 测试远程下线设备
- logoutDevice_Unauthorized - 测试未认证下线
- logoutDevice_NotFound - 测试下线不存在的设备

## 运行测试

### 运行所有测试
```bash
cd backend && mvn test
```

### 运行单个测试类
```bash
cd backend && mvn test -Dtest=UserServiceTest
cd backend && mvn test -Dtest=DeviceServiceTest
cd backend && mvn test -Dtest=UserControllerTest
cd backend && mvn test -Dtest=DeviceControllerTest
```

## 测试配置

测试配置文件位于 `src/test/resources/application-test.yml`，包含：
- H2内存数据库配置
- Redis配置（测试环境）
- JWT配置

## 注意事项

1. **Service层测试**使用Mockito模拟依赖，不启动Spring容器
2. **Controller层测试**使用@SpringBootTest启动完整的Spring容器，使用MockMvc模拟HTTP请求
3. **测试环境**使用H2内存数据库，不需要外部数据库
4. **认证测试**使用@WithMockUser注解模拟已认证用户

## 已知问题

当前测试中存在JWT认证过滤器的问题，需要在生产环境中验证JWT认证流程。测试环境使用@WithMockUser注解，不需要真实的JWT验证。