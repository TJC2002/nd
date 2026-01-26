import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  SwapHoriz, // Changed icon
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
import TransferList from '../transfer/TransferList'
import ShareList from '../share/ShareList'
import Placeholder from './Placeholder'
import MediaCenter from '../media/MediaCenter'
import './Home.css'

const Home = () => {
  const { user, logout } = useAuth()
  const { mode, colorTheme, effectiveMode } = useAppTheme()
  const { dialogOpen, popoverOpen, setPopoverOpen, getActiveTasks } = useUpload()
  const { toggleDrawer } = useMusic()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('files')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [anchorEl, setAnchorEl] = useState(null)
  const [uploadAnchorEl, setUploadAnchorEl] = useState(null)

  useEffect(() => {
    const path = location.pathname
    if (path === '/' || path === '/home/files') {
      setActiveTab('files')
    } else if (path === '/search') {
      setActiveTab('search')
    } else if (path === '/home/transfers') {
      setActiveTab('transfer')
    } else if (path === '/home/media') {
      setActiveTab('media')
    } else if (path === '/home/shares') {
      setActiveTab('share')
    } else if (path === '/home/settings') {
      setActiveTab('settings')
    }
  }, [location.pathname])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    switch (tab) {
      case 'files':
        navigate('/home/files')
        break
      case 'search':
        navigate('/search')
        break
      case 'transfer':
        navigate('/home/transfers')
        break
      case 'media':
        navigate('/home/media')
        break
      case 'share':
        navigate('/home/shares')
        break
      case 'settings':
        navigate('/home/settings')
        break
      default:
        break
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
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
      case 'transfer':
        return <TransferList />
      case 'media':
        return <MediaCenter />
      case 'share':
        return <ShareList />
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
                    color: theme.palette.text.primary,
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
              onKeyPress={handleSearchKeyPress}
              sx={{
                width: 360,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 20,
                  transition: 'all 0.3s ease',
                  border: '1px solid transparent',
                  pl: 2,
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-focused': {
                      width: 420,
                      backgroundColor: theme.palette.action.selected,
                      border: `1px solid ${theme.palette.primary.main}40`,
                  }
                },
                '& input': {
                    color: theme.palette.text.primary,
                    fontWeight: 500,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleSearch}
                      sx={{ mr: -1 }}
                    >
                      <SearchOutlined sx={{ fontSize: '1rem', color: theme.palette.primary.main }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeSwitcher />
            
            <IconButton 
                sx={{ 
                    color: theme.palette.text.secondary, 
                    '&:hover': { color: theme.palette.text.primary, bgcolor: theme.palette.action.hover } 
                }}
                onClick={() => toggleDrawer(true)}
            >
                <PlayCircleFilled />
            </IconButton>

            <IconButton
                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.text.primary, bgcolor: theme.palette.action.hover } }}
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
              {['files', 'search', 'transfer', 'media', 'share', 'settings'].map((tab) => (
                <ListItem key={tab} disablePadding sx={{ display: 'block', mb: 1 }}>
                  <ListItemButton
                    selected={activeTab === tab}
                    onClick={() => handleTabChange(tab)}
                    sx={{
                      minHeight: 52,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                      px: 2,
                      borderRadius: 4,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: theme.palette.text.secondary,
                      '&:hover': {
                         backgroundColor: theme.palette.action.hover,
                         color: theme.palette.text.primary,
                         transform: 'translateX(4px)',
                      },
                      '&.Mui-selected': {
                         backgroundColor: theme.palette.action.selected + ' !important',
                         backdropFilter: 'blur(10px)',
                         color: theme.palette.text.primary,
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
                      {tab === 'search' && <SearchOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'transfer' && <SwapHoriz fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'media' && <PlayCircleFilled fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'share' && <ShareOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                      {tab === 'settings' && <SettingsOutlined fontSize={sidebarOpen ? "medium" : "large"} />}
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary={
                        tab === 'files' ? 'Files' :
                        tab === 'search' ? 'Search' :
                        tab === 'transfer' ? 'Transfers' :
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
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.text.primary, bgcolor: theme.palette.action.hover }
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
