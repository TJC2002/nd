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
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              ND网盘
            </Typography>
            <TextField
              size="small"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
      <Divider />
      <Box sx={{ display: 'flex', pt: 8, flex: 1, overflow: 'hidden' }}>
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 240 : 56,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? 240 : 56,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            },
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, minHeight: 0, height: 0 }}>
          </Toolbar>
          <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box className="sidebar-menu" sx={{ flex: 1 }}>
              {['files', 'sync', 'download', 'media', 'share', 'settings'].map((tab) => (
                <Box
                  key={tab}
                  className={`sidebar-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    justifyContent: 'flex-start',
                    gap: '12px',
                  }}
                >
                  {tab === 'files' && <Folder />}
                  {tab === 'sync' && <CloudUploadOutlined />}
                  {tab === 'download' && <Description />}
                  {tab === 'media' && <PlayCircleFilled />}
                  {tab === 'share' && <ShareOutlined />}
                  {tab === 'settings' && <SettingsOutlined />}
                  {sidebarOpen && (
                    <Typography className="sidebar-label">
                      {tab === 'files' && '文件管理'}
                      {tab === 'sync' && '同步备份'}
                      {tab === 'download' && '离线下载'}
                      {tab === 'media' && '影音中心'}
                      {tab === 'share' && '分享协同'}
                      {tab === 'settings' && '系统设置'}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
            <Box
              className="sidebar-item"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                justifyContent: 'center',
                gap: '12px',
                marginTop: 'auto',
                flexShrink: 0,
              }}
            >
              {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
            </Box>
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
