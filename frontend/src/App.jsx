import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext'
import { NotificationProvider, useNotification } from './context/NotificationContext'
import { UploadProvider } from './context/UploadContext'

function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <NotificationProvider>
          {(notificationContext) => (
            <CustomThemeProvider>
              {(themeContext) => (
                <MuiThemeProvider theme={themeContext.theme}>
                  <CssBaseline />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute>
                            <UploadProvider>
                              <Home />
                            </UploadProvider>
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                  <GlobalNotification notificationContext={notificationContext} />
                </MuiThemeProvider>
              )}
            </CustomThemeProvider>
          )}
        </NotificationProvider>
      </CustomThemeProvider>
    </AuthProvider>
  )
}

function GlobalNotification({ notificationContext }) {
  const { notification, closeNotification } = notificationContext

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={closeNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeNotification} 
        severity={notification.severity} 
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default App
