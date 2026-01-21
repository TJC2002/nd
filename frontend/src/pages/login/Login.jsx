import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material'
import {
  LockOutlined,
  EmailOutlined,
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeSwitcher from '../../components/ThemeSwitcher'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { mode, effectiveMode, colorTheme } = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        login(data.data)
        setSnackbar({
          open: true,
          message: '登录成功',
          severity: 'success',
        })
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        setError(data.message || '登录失败')
        setFormData(prev => ({
          ...prev,
          password: '',
        }))
        setLoading(false)
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          email: formData.email,
          phone: '13800138000',
        }),
      })

      const data = await response.json()

      if (data.code === 200) {
        setSnackbar({
          open: true,
          message: '注册成功，请登录',
          severity: 'success',
        })
        setActiveTab(0)
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          rememberMe: false,
        })
      } else {
        setError(data.message || '注册失败')
        setLoading(false)
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      setLoading(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box
      className={`login-container ${effectiveMode}`}
    >
      <Container maxWidth="lg" className="login-content">
          <Box className="login-wrapper">
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <ThemeSwitcher />
            </Box>
            <Box className="logo-section" sx={{ mb: 4 }}>
              <Typography 
                variant="h2" 
                component="div"
                sx={{ 
                  fontFamily: '"Orbitron", "Roboto", sans-serif',
                  fontWeight: 900,
                  letterSpacing: '4px',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: (theme) => '0 0 30px ' + theme.palette.primary.dark,
                  mb: 1
                }}
              >
                ND DRIVE
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}
              >
                Personal Cloud Storage
              </Typography>
            </Box>

            <Paper 
              elevation={24}
              sx={{
                width: '100%',
                maxWidth: 450,
                p: 4,
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(30, 30, 30, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: (theme) => `0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px ${theme.palette.primary.main}20`
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                setActiveTab(newValue)
                setError('')
                setFormData({
                  username: '',
                  password: '',
                  confirmPassword: '',
                  email: '',
                  rememberMe: false,
                })
              }}
              className="auth-tabs"
              centered
            >
              <Tab label="登录" />
              <Tab label="注册" />
            </Tabs>

              {activeTab === 0 ? (
                <Box component="form" onSubmit={handleLogin} className="login-form">
                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="账号"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      error={!!error}
                      helperText={error}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                              <EmailOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="密码"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                              <LockOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box className="form-options">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                      />
                    }
                    label="记住密码"
                  />
                  <Button
                    className="forgot-password-btn"
                    onClick={() => navigate('/forgot-password')}
                  >
                    忘记密码
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '登录'}
                </Button>
              </Box>
              ) : (
                <Box component="form" onSubmit={handleRegister} className="login-form">
                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="账号"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      error={!!error}
                      helperText={error}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonAddOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="邮箱"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="密码"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box className="form-group">
                    <TextField
                      fullWidth
                      label="确认密码"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                             backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                             backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : '注册'}
                  </Button>
              </Box>
            )}
          </Paper>

          <Typography variant="body2" className="copyright">
            © 2024 ND. All rights reserved.
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Login