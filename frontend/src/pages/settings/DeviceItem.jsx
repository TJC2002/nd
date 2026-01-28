import React, { useRef, useState, useEffect } from 'react'
import {
  ListItem,
  Box,
  Typography,
  Button,
  Switch,
  Chip,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import './DeviceItem.css'

const DeviceItem = ({ device, icon: Icon, onToggleTrust, onLogoutClick, isRemoving, index }) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    if (isRemoving) {
      return
    }

    const handleScroll = () => {
      const scrollContainer = document.querySelector('.device-list-container')
      if (scrollContainer) {
        const rect = scrollContainer.getBoundingClientRect()
        const itemRect = document.getElementById(`device-item-${device.id}`)?.getBoundingClientRect()

        if (itemRect) {
          const scrollCenter = rect.top + rect.height / 2
          const itemCenter = itemRect.top + itemRect.height / 2
          const offset = (itemCenter - scrollCenter) * 0.03
          setTranslateY(Math.max(-5, Math.min(5, offset)))
        }
      }
    }

    const scrollContainer = document.querySelector('.device-list-container')
    scrollContainer?.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll)
    }
  }, [device.id, isRemoving])

  return (
    <ListItem
      id={`device-item-${device.id}`}
      className={`device-item ${isRemoving ? 'removing' : ''}`}
      sx={{
        mb: 1.5,
        px: 3,
        py: 2.5,
        borderRadius: 2,
        background: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.02)'
          : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.06)'
          : 'rgba(0, 0, 0, 0.06)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
        transform: `translateY(${translateY}px)`,
        '&:hover': {
          background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : 'rgba(255, 255, 255, 0.7)',
          borderColor: theme.palette.primary.main + '40',
          boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
          transform: `translateY(${translateY}px) translateX(4px)`,
        },
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        className="device-icon"
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${theme.palette.primary.main}15`,
          color: theme.palette.primary.main,
          mr: 3,
          flexShrink: 0,
          transition: 'all 0.3s ease',
        }}
      >
        {React.cloneElement(Icon, { fontSize: 'large' })}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {device.name}
          </Typography>
          {device.isCurrent && (
            <Chip
              label="当前设备"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: `${theme.palette.primary.main}20`,
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {device.os}
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            登录时间: {device.loginTime}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            IP: {device.ip}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!device.isCurrent && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              信任设备
            </Typography>
            <Switch
              checked={device.isTrusted}
              onChange={() => onToggleTrust(device.id)}
              size="small"
              sx={{
                '& .MuiSwitch-thumb': {
                  transition: 'all 0.3s ease',
                },
              }}
              className="trust-switch"
            />
            {device.isTrusted && (
              <CheckCircle
                sx={{
                  fontSize: '1.2rem',
                  color: '#4caf50',
                  animation: 'checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />
            )}
          </Box>
        )}

        {!device.isCurrent && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => onLogoutClick(device.id)}
            className={`logout-button ${isHovered ? 'hovered' : ''}`}
            startIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="logout-icon"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            }
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#ff4444',
              color: '#ff4444',
              transition: 'all 0.3s ease',
              minWidth: 100,
            }}
          >
            下线设备
          </Button>
        )}
      </Box>
    </ListItem>
  )
}

export default DeviceItem
