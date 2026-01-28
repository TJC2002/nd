import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import AccountInfo from './AccountInfo'
import DeviceManagement from './DeviceManagement'
import SecuritySettings from './SecuritySettings'
import StorageNodeConfig from './StorageNodeConfig'
import StoragePolicyConfig from './StoragePolicyConfig'
import './SettingsPage.css'

const accountMenuItems = [
  { id: 'account', label: '账号信息', icon: '👤' },
  { id: 'devices', label: '设备管理', icon: '💻' },
  { id: 'security', label: '安全信息', icon: '🔒' },
]

const storageMenuItems = [
  { id: 'nodes', label: '存储节点配置', icon: '🖥️' },
  { id: 'policies', label: '存储策略配置', icon: '📋' },
]

const tabLabels = {
  account: '账号信息',
  devices: '设备管理',
  security: '安全信息',
  nodes: '存储节点配置',
  policies: '存储策略配置',
}

const SettingsPage = () => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState('devices')
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    { label: '首页', path: '/home/files' },
    { label: '账户设置', path: '/settings' },
    { label: '设备管理', path: '/settings' },
  ])

  useEffect(() => {
    const isAccountTab = ['account', 'devices', 'security'].includes(activeTab)
    const middleLabel = isAccountTab ? '账户设置' : '存储配置'
    setBreadcrumbPath([
      { label: '首页', path: '/home/files' },
      { label: middleLabel, path: '/settings' },
      { label: tabLabels[activeTab], path: '/settings' },
    ])
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountInfo />
      case 'devices':
        return <DeviceManagement />
      case 'security':
        return <SecuritySettings />
      case 'nodes':
        return <StorageNodeConfig />
      case 'policies':
        return <StoragePolicyConfig />
      default:
        return <DeviceManagement />
    }
  }

  return (
    <Box className="settings-page">
      <Box className="breadcrumb" sx={{ mb: 3 }}>
        {breadcrumbPath.map((item, index) => (
          <React.Fragment key={index}>
            <Typography
              component="span"
              sx={{
                color: index === breadcrumbPath.length - 1
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
                cursor: index === breadcrumbPath.length - 1 ? 'default' : 'pointer',
                '&:hover': index === breadcrumbPath.length - 1
                  ? {}
                  : { color: theme.palette.primary.main },
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if (index < breadcrumbPath.length - 1) {
                  window.location.href = item.path
                }
              }}
            >
              {item.label}
            </Typography>
            {index < breadcrumbPath.length - 1 && (
              <Typography component="span" sx={{ mx: 1, color: theme.palette.text.secondary }}>
                {'>'}
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>

      <Box className="settings-layout">
        <Box className="sidebar-menu">
          <Paper
            className="sidebar-section"
            elevation={0}
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                px: 1,
                fontWeight: 600,
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              👤 账户设置
            </Typography>
            <List sx={{ py: 0 }}>
              {accountMenuItems.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItemButton
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      px: 2,
                      py: 1.5,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&.Mui-selected': {
                        background: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          background: `${theme.palette.primary.main}25`,
                        },
                      },
                    }}
                  >
                    <span style={{ marginRight: 12, fontSize: '1.2rem' }}>{item.icon}</span>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                  </ListItemButton>
                  <Divider sx={{ my: 0.5, opacity: 0.1 }} />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Paper
            className="sidebar-section"
            elevation={0}
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                px: 1,
                fontWeight: 600,
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              💾 存储配置
            </Typography>
            <List sx={{ py: 0 }}>
              {storageMenuItems.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItemButton
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      px: 2,
                      py: 1.5,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&.Mui-selected': {
                        background: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          background: `${theme.palette.primary.main}25`,
                        },
                      },
                    }}
                  >
                    <span style={{ marginRight: 12, fontSize: '1.2rem' }}>{item.icon}</span>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: activeTab === item.id ? 600 : 500,
                        fontSize: '0.95rem',
                      }}
                    />
                  </ListItemButton>
                  <Divider sx={{ my: 0.5, opacity: 0.1 }} />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        <Box className="settings-content">
          {renderContent()}
        </Box>
      </Box>
    </Box>
  )
}

export default SettingsPage
