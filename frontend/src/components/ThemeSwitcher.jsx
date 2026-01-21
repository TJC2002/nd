import React, { useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
} from '@mui/material'
import {
  ColorLens,
} from '@mui/icons-material'
import { useTheme } from '../context/ThemeContext'

const ThemeSwitcher = () => {
  const { colorTheme, changeColorTheme, colorThemes } = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleColorThemeChange = (key) => {
    changeColorTheme(key)
    handleMenuClose()
  }

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        color="inherit"
        title="切换主题"
      >
        <ColorLens />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        className="theme-menu"
        PaperProps={{
            sx: {
                bgcolor: 'rgba(30,30,30,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        }}
      >
        <MenuItem disabled sx={{ opacity: '1!important', color: 'white' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>强调色</Typography>
        </MenuItem>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, p: 1 }}>
            {Object.entries(colorThemes).map(([key, colors]) => (
            <MenuItem
                key={key}
                selected={colorTheme === key}
                onClick={() => handleColorThemeChange(key)}
                sx={{
                justifyContent: 'flex-start',
                borderRadius: 1,
                gap: 1,
                '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }
                }}
            >
                <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: colors.main,
                    boxShadow: '0 0 5px ' + colors.main
                }}
                />
                <Typography variant="body2" sx={{ color: 'white' }}>
                    {key === 'ocean' ? '深海蓝' :
                     key === 'sunset' ? '落日橙' :
                     key === 'purple' ? '霓虹紫' :
                     '极光绿'}
                </Typography>
            </MenuItem>
            ))}
        </Box>
      </Menu>
    </>
  )
}

export default ThemeSwitcher
