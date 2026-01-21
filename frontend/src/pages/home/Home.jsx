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
          backgroundColor: 'transparent',
          boxShadow: 'none', 
          pt: 1, // Slight top padding
        }}
      >
        <Toolbar sx={{ height: 80, px: 4 }}> {/* Increased height and padding */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                    mr: 6, 
                    display: { xs: 'none', sm: 'block' },
                    fontFamily: '"SF Pro Display", "Roboto", sans-serif',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#fff',
                    userSelect: 'none',
                    fontSize: '1.5rem',
                }}
            >
              ND<Box component="span" sx={{ color: theme.palette.primary.main }}>.</Box>
            </Typography>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 360,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20, // Fully rounded
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                  pl: 2,
                  '& fieldset': { border: 'none' }, // Remove default border
                  '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                  '&.Mui-focused': {
                      width: 420,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${theme.palette.primary.main}40`,
                  }
                },
                '& input': {
                    color: 'white',
                    fontWeight: 500,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: 'rgba(255,255,255,0.4)' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeSwitcher />
            
            <IconButton 
                sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                }}
                onClick={() => toggleDrawer(true)}
            >
                <PlayCircleFilled />
            </IconButton>

            <IconButton
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                onClick={handleUploadClick}
            >
                <CloudUploadOutlined />
            </IconButton>

            <Avatar
              sx={{ 
                  width: 38, 
                  height: 38, 
                  cursor: 'pointer',
                  ml: 2,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', pt: 0, height: '100vh', overflow: 'hidden' }}>
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? 260 : 80, 
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? 260 : 80,
              boxSizing: 'border-box',
              top: 0, 
              height: '100vh', 
              backgroundColor: 'transparent', 
              backdropFilter: 'none', 
              borderRight: 'none',
              paddingTop: '100px', // Push content down below custom header
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          }}
        >
          <Box sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List className="sidebar-menu" sx={{ flex: 1, padding: 0 }}>
              {['files', 'sync', 'download', 'media', 'share', 'settings'].map((tab) => (
                <ListItem key={tab} disablePadding sx={{ display: 'block', mb: 1 }}>
                  <ListItemButton
                    selected={activeTab === tab}
                    onClick={() => handleTabChange(tab)}
                    sx={{
                      minHeight: 52, // Taller buttons
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2,
                      borderRadius: 4, // More rounded
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: 'rgba(255,255,255,0.6)',
                      '&:hover': {
                         backgroundColor: 'rgba(255,255,255,0.05)',
                         color: 'white',
                         transform: 'translateX(4px)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.1) !important',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2.5 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit',
                      }}
                    >
                      {tab === 'files' && <Folder fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'sync' && <CloudUploadOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'download' && <Description fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'media' && <PlayCircleFilled fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'share' && <ShareOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'settings' && <SettingsOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary={
                        tab === 'files' ? 'Files' :
                        tab === 'sync' ? 'Sync' :
                        tab === 'download' ? 'Downloads' :
                        tab === 'media' ? 'Media' :
                        tab === 'share' ? 'Shared' :
                        'Settings'
                    } primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ pb: 4, display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center' }}>
                  <IconButton
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{
                      color: 'rgba(255,255,255,0.4)',
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                     {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                  </IconButton>
            </Box>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', pt: '100px', pr: 4, pb: 2 }}>
          <Box className="main-content" sx={{ flex: 1, overflow: 'auto', borderRadius: 8 }}> {/* Added container radius */}
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
