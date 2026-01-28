import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Chip,
  Fade,
} from '@mui/material'
import {
  Computer,
  Smartphone,
  TabletMac,
  PowerSettingsNew,
  CheckCircle,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import DeviceItem from './DeviceItem'
import './DeviceManagement.css'

const mockDevices = [
  {
    id: 1,
    name: 'MacBook Pro',
    type: 'computer',
    os: 'macOS Sonoma',
    loginTime: '2026-01-27 14:30:00',
    ip: '192.168.1.100',
    isTrusted: true,
    isCurrent: true,
  },
  {
    id: 2,
    name: 'iPhone 15 Pro',
    type: 'phone',
    os: 'iOS 17.2',
    loginTime: '2026-01-26 10:15:00',
    ip: '192.168.1.101',
    isTrusted: false,
    isCurrent: false,
  },
  {
    id: 3,
    name: 'iPad Air',
    type: 'tablet',
    os: 'iPadOS 17.1',
    loginTime: '2026-01-25 18:45:00',
    ip: '192.168.1.102',
    isTrusted: true,
    isCurrent: false,
  },
  {
    id: 4,
    name: 'Windows PC',
    type: 'computer',
    os: 'Windows 11',
    loginTime: '2026-01-24 09:20:00',
    ip: '192.168.1.103',
    isTrusted: false,
    isCurrent: false,
  },
  {
    id: 5,
    name: 'Samsung Galaxy S24',
    type: 'phone',
    os: 'Android 14',
    loginTime: '2026-01-23 16:30:00',
    ip: '192.168.1.104',
    isTrusted: true,
    isCurrent: false,
  },
]

const getDeviceIcon = (type) => {
  switch (type) {
    case 'computer':
      return <Computer />
    case 'phone':
      return <Smartphone />
    case 'tablet':
      return <TabletMac />
    default:
      return <Computer />
  }
}

const DeviceManagement = () => {
  const theme = useTheme()
  const [devices, setDevices] = useState(mockDevices)
  const [filteredDevices, setFilteredDevices] = useState(mockDevices)
  const [timeFilter, setTimeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [confirmDialog, setConfirmDialog] = useState({ open: false, deviceId: null })
  const [removingDeviceId, setRemovingDeviceId] = useState(null)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    let filtered = [...devices]

    if (timeFilter !== 'all') {
      const now = new Date()
      const timeRanges = {
        '1day': 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
      }

      filtered = filtered.filter((device) => {
        const deviceTime = new Date(device.loginTime).getTime()
        const timeDiff = now.getTime() - deviceTime
        return timeDiff <= timeRanges[timeFilter]
      })
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((device) => device.type === typeFilter)
    }

    setFilteredDevices(filtered)
  }, [devices, timeFilter, typeFilter])

  const handleToggleTrust = (deviceId) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, isTrusted: !device.isTrusted } : device
      )
    )
  }

  const handleLogoutClick = (deviceId) => {
    setConfirmDialog({ open: true, deviceId })
  }

  const handleConfirmLogout = () => {
    setRemovingDeviceId(confirmDialog.deviceId)
    setTimeout(() => {
      setDevices((prev) => prev.filter((device) => device.id !== confirmDialog.deviceId))
      setRemovingDeviceId(null)
      setConfirmDialog({ open: false, deviceId: null })
    }, 400)
  }

  const handleCancelLogout = () => {
    setConfirmDialog({ open: false, deviceId: null })
  }

  return (
    <Box className="device-management">
      <Fade in timeout={400}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            设备管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            管理您已登录的设备，保护账号安全
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: 2,
            }}
            className="filter-bar"
          >
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                筛选条件:
              </Typography>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>登录时间</InputLabel>
                <Select
                  value={timeFilter}
                  label="登录时间"
                  onChange={(e) => setTimeFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <MenuItem value="all">全部时间</MenuItem>
                  <MenuItem value="1day">24小时内</MenuItem>
                  <MenuItem value="7days">7天内</MenuItem>
                  <MenuItem value="30days">30天内</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>设备类型</InputLabel>
                <Select
                  value={typeFilter}
                  label="设备类型"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <MenuItem value="all">全部设备</MenuItem>
                  <MenuItem value="computer">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Computer fontSize="small" /> 电脑
                    </Box>
                  </MenuItem>
                  <MenuItem value="phone">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Smartphone fontSize="small" /> 手机
                    </Box>
                  </MenuItem>
                  <MenuItem value="tablet">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TabletMac fontSize="small" /> 平板
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Chip
                label={`共 ${filteredDevices.length} 台设备`}
                size="small"
                sx={{
                  ml: 'auto',
                  backgroundColor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              />
            </Box>
          </Paper>

          <Box ref={scrollContainerRef} className="device-list-container">
            {filteredDevices.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 12,
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  没有找到符合条件的设备
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {filteredDevices.map((device, index) => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    icon={getDeviceIcon(device.type)}
                    onToggleTrust={handleToggleTrust}
                    onLogoutClick={handleLogoutClick}
                    isRemoving={removingDeviceId === device.id}
                    index={index}
                  />
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Fade>

      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelLogout}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            background: theme.palette.mode === 'dark'
              ? 'rgba(0, 0, 0, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
        className="confirm-dialog"
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          下线设备
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            确定要下线此设备吗？下线后该设备将无法访问您的账号，需要重新登录。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelLogout}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirmLogout}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#ff4444',
              '&:hover': {
                backgroundColor: '#ff3333',
              },
            }}
            startIcon={<PowerSettingsNew />}
          >
            确认下线
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DeviceManagement
