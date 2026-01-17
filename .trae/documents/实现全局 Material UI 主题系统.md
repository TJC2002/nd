# 实现全局 Material UI 主题系统

## 当前问题分析
- App.jsx 中已定义了多个 Material UI 主题，但未被使用
- 只有 CustomThemeProvider（CSS 变量）被使用，功能有限
- Login.jsx 有独立的主题定义，没有统一管理
- 缺少系统主题检测和主题切换功能

## 实现计划

### 1. 重构 ThemeContext.jsx
- 添加系统主题检测（使用 `useMediaQuery` 检测 `prefers-color-scheme: dark`）
- 支持 "light"、"dark"、"system" 三种模式
- 添加 "green"、"blue"、"orange" 等彩色主题
- 将主题状态保存到 localStorage

### 2. 修改 App.jsx
- 使用 Material UI 的 `ThemeProvider` 包装应用
- 根据当前主题动态切换 Material UI 主题
- 移除静态的主题定义，改为动态生成
- 确保所有组件都能访问 Material UI 主题

### 3. 创建 ThemeSwitcher 组件
- 创建新组件 `frontend/src/components/ThemeSwitcher.jsx`
- 提供主题切换按钮（Light/Dark/System + 彩色主题）
- 使用 Material UI 的 IconButton 和图标
- 显示当前主题状态

### 4. 在 Header 中添加主题切换
- 在 Home.jsx 的 AppBar 中添加 ThemeSwitcher 组件
- 放在设置按钮旁边
- 确保样式与现有 UI 一致

### 5. 清理 Login.jsx
- 移除 Login.jsx 中重复的主题定义
- 使用统一的全局主题系统
- 确保登录页面也使用 Material UI 主题

## 技术要点
- 使用 `useMediaQuery` 检测系统主题偏好
- 使用 `createTheme` 创建 Material UI 主题
- 使用 `ThemeProvider` 提供主题给整个应用
- 使用 `localStorage` 持久化用户主题选择
- 支持实时主题切换，无需刷新页面