import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListSubheader,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Folder,
  CloudUploadOutlined,
  Description,
  PlayCircleFilled,
  ShareOutlined,
  SearchOutlined,
  HelpOutline,
  SettingsOutlined,
  NotificationsOutlined,
  GridViewOutlined,
  Visibility,
  VisibilityOff,
  MoreVertOutlined,
  DeleteOutline,
  StarOutline,
  StarBorderOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useTheme as useAppTheme } from '../../context/ThemeContext'
import { useUpload } from '../../context/UploadContext'
import { useMusic } from '../../context/MusicContext'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import UploadDialog from '../../components/upload/UploadDialog'
import UploadPopover from '../../components/upload/UploadPopover'
import FileManagement from './FileManagement'
import Placeholder from './Placeholder'
import './Home.css'

const Home = () => {
  const { user, logout } = useAuth()
  const { mode, colorTheme, effectiveMode } = useAppTheme()
  const { dialogOpen, popoverOpen, setPopoverOpen, getActiveTasks } = useUpload()
  const { toggleDrawer } = useMusic()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('files')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [anchorEl, setAnchorEl] = useState(null)
  const [uploadAnchorEl, setUploadAnchorEl] = useState(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleUploadClick = (event) => {
    setUploadAnchorEl(event.currentTarget)
    setPopoverOpen(true)
  }

  const handleUploadPopoverClose = () => {
    setUploadAnchorEl(null)
    setPopoverOpen(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'files':
        return <FileManagement />
      case 'sync':
        return (
          <Placeholder
            title="同步备份"
            icon={<CloudUploadOutlined />}
            description="正在同步您的文件到云端备份服务..."
          />
        )
      case 'download':
        return (
          <Placeholder
            title="离线下载"
            icon={<Description />}
            description="支持多种格式的离线下载任务，让您的文件随时可用。"
          />
        )
      case 'media':
        return (
          <Placeholder
            title="影音中心"
            icon={<PlayCircleFilled />}
            description="在线播放您的视频和音频文件，支持多种格式。"
          />
        )
      case 'share':
        return (
          <Placeholder
            title="分享协同"
            icon={<ShareOutlined />}
            description="与团队成员协作编辑文件，实时同步更改。"
          />
        )
      case 'settings':
        return (
          <Placeholder
            title="系统设置"
            icon={<SettingsOutlined />}
            description="管理您的账户、存储空间和应用设置。"
          />
        )
      default:
        return <FileManagement />
    }
  }

  return (
    <Box className="home-container">
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0,0,0,0.3)', // 更通透的背景
          boxShadow: 'none', // 去掉默认阴影，使用边框分隔
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Toolbar sx={{ height: 64 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                    mr: 4, 
                    display: { xs: 'none', sm: 'block' },
                    fontFamily: '"Orbitron", "Roboto", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px ' + theme.palette.primary.dark,
                    userSelect: 'none'
                }}
            >
              ND DRIVE
            </Typography>
            <TextField
              size="small"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                  },
                  '&.Mui-focused': {
                      width: 400,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      boxShadow: '0 0 15px ' + theme.palette.primary.main
                  }
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeSwitcher />
            <Tooltip title="音乐播放器">
              <IconButton color="inherit" onClick={() => toggleDrawer(true)}>
                <PlayCircleFilled />
              </IconButton>
            </Tooltip>
            <Tooltip title="上传任务">
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  color="inherit"
                  onClick={handleUploadClick}
                  onMouseEnter={handleUploadClick}
                >
                  <CloudUploadOutlined />
                </IconButton>
                {getActiveTasks().length > 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}>
                    {getActiveTasks().length}
                  </Box>
                )}
              </Box>
            </Tooltip>
            <Tooltip title="通知">
              <IconButton color="inherit">
                <Box sx={{ position: 'relative' }}>
                  <NotificationsOutlined />
                  {notifications > 0 && (
                    <Box sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}>
                      {notifications}
                    </Box>
                  )}
                </Box>
              </IconButton>
            </Tooltip>
            <Tooltip title="帮助">
              <IconButton color="inherit">
                <HelpOutline />
              </IconButton>
            </Tooltip>
            <Tooltip title="设置">
              <IconButton color="inherit" onClick={() => handleTabChange('settings')}>
                <SettingsOutlined />
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{ width: 32, height: 32, cursor: 'pointer' }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      {/* <Divider /> 移除这个可能导致布局问题的 Divider */}
      <Box sx={{ display: 'flex', pt: '64px', height: '100vh', overflow: 'hidden' }}>
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 240 : 64, // 收起时稍微宽一点点，更美观
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? 240 : 64,
              boxSizing: 'border-box',
              top: '64px', // 关键：让 Drawer 从 Header 下方开始
              height: 'calc(100vh - 64px)', // 关键：高度减去 Header 高度
              backgroundColor: 'rgba(0, 0, 0, 0.2)', // 半透明背景
              backdropFilter: 'blur(10px)', // 磨砂效果
              borderRight: '1px solid rgba(255, 255, 255, 0.08)', // 细腻的边框
              transition: theme.transitions.create(['width', 'background-color'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
          {/* 移除了原来的空 Toolbar 占位符，因为现在通过 top: 64px 精确定位了 */}
          <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
            <List className="sidebar-menu" sx={{ flex: 1, padding: 0 }}>
              {['files', 'sync', 'download', 'media', 'share', 'settings'].map((tab) => (
                <ListItem key={tab} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    selected={activeTab === tab}
                    onClick={() => handleTabChange(tab)}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2.5,
                      mx: 1, // 左右留白，做成悬浮胶囊效果
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                         backgroundColor: 'rgba(255,255,255,0.08)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main + '20', // 半透明的主色
                        color: theme.palette.primary.main,
                        border: `1px solid ${theme.palette.primary.main}40`,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main + '30',
                        },
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2 : 'auto', // 稍微减小间距
                        justifyContent: 'center',
                        color: activeTab === tab ? 'inherit' : 'text.secondary',
                      }}
                    >
                      {tab === 'files' && <Folder />}
                      {tab === 'sync' && <CloudUploadOutlined />}
                      {tab === 'download' && <Description />}
                      {tab === 'media' && <PlayCircleFilled />}
                      {tab === 'share' && <ShareOutlined />}
                      {tab === 'settings' && <SettingsOutlined />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        tab === 'files' ? '文件管理' :
                        tab === 'sync' ? '同步备份' :
                        tab === 'download' ? '离线下载' :
                        tab === 'media' ? '影音中心' :
                        tab === 'share' ? '分享协同' :
                        '系统设置'
                      } 
                      sx={{ opacity: sidebarOpen ? 1 : 0 }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
               <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                     <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                    </ListItemIcon>
                    <ListItemText primary="收起" sx={{ opacity: sidebarOpen ? 1 : 0 }} />
                  </ListItemButton>
               </ListItem>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box className="main-content" sx={{ flex: 1, overflow: 'auto' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1,
          },
        }}
      >
        <ListSubheader>快捷访问</ListSubheader>
        <MenuItem onClick={() => { handleTabChange('recent'); handleMenuClose(); }}>
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>
          <ListItemText>最近访问</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleTabChange('favorites'); handleMenuClose(); }}>
          <ListItemIcon>
            <StarOutline />
          </ListItemIcon>
          <ListItemText>收藏文件</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleTabChange('trash'); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteOutline />
          </ListItemIcon>
          <ListItemText>回收站</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteOutline />
          </ListItemIcon>
          <ListItemText>退出登录</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleTabChange('settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsOutlined />
          </ListItemIcon>
          <ListItemText>账户设置</ListItemText>
        </MenuItem>
      </Menu>
      <UploadDialog />
      <UploadPopover anchorEl={uploadAnchorEl} onClose={handleUploadPopoverClose} />
    </Box>
  )
}

export default Home
