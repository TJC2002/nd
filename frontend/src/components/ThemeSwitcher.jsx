import React, { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  LightMode,
  DarkMode,
  SettingsBrightness,
  Palette,
  Circle,
} from '@mui/icons-material'
import { useTheme } from '../context/ThemeContext'

const ThemeSwitcher = () => {
  const { mode, colorTheme, effectiveMode, systemTheme, changeMode, changeColorTheme, colorThemes } = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setColorMenuAnchor(null)
  }

  const handleColorMenuOpen = (event) => {
    setColorMenuAnchor(event.currentTarget)
  }

  const handleColorMenuClose = () => {
    setColorMenuAnchor(null)
  }

  const getModeIcon = () => {
    if (mode === 'system') {
      return <SettingsBrightness />
    }
    return effectiveMode === 'dark' ? <DarkMode /> : <LightMode />
  }

  const getModeLabel = () => {
    if (mode === 'system') {
      return `跟随系统 (${systemTheme === 'dark' ? '深色' : '浅色'})`
    }
    return effectiveMode === 'dark' ? '深色模式' : '浅色模式'
  }

  const colorOptions = [
    { key: 'blue', label: '蓝色', color: '#2196f3' },
    { key: 'green', label: '绿色', color: '#4caf50' },
    { key: 'orange', label: '橙色', color: '#ff9800' },
    { key: 'purple', label: '紫色', color: '#9c27b0' },
    { key: 'red', label: '红色', color: '#f44336' },
  ]

  return (
    <>
      <Tooltip title="主题设置">
        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          aria-label="主题设置"
        >
          {getModeIcon()}
        </IconButton>
      </Tooltip>

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
            minWidth: 200,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            模式
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            changeMode('light')
            handleMenuClose()
          }}
          selected={mode === 'light'}
        >
          <LightMode sx={{ mr: 2 }} />
          浅色模式
        </MenuItem>

        <MenuItem
          onClick={() => {
            changeMode('dark')
            handleMenuClose()
          }}
          selected={mode === 'dark'}
        >
          <DarkMode sx={{ mr: 2 }} />
          深色模式
        </MenuItem>

        <MenuItem
          onClick={() => {
            changeMode('system')
            handleMenuClose()
          }}
          selected={mode === 'system'}
        >
          <SettingsBrightness sx={{ mr: 2 }} />
          跟随系统
        </MenuItem>

        <Divider />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            主题色
          </Typography>
        </Box>

        {colorOptions.map((option) => (
          <MenuItem
            key={option.key}
            onClick={() => {
              changeColorTheme(option.key)
              handleMenuClose()
            }}
            selected={colorTheme === option.key}
          >
            <Circle
              sx={{
                mr: 2,
                color: option.color,
                fontSize: '1.2rem',
              }}
            />
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default ThemeSwitcher
