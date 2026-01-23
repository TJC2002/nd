import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, CssBaseline, Snackbar, Alert } from '@mui/material'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import MusicPage from './pages/music/MusicPage'
import VideoTestPage from './pages/VideoTestPage'
import VideoLibrary from './pages/media/VideoLibrary'
import MusicLibrary from './pages/media/MusicLibrary'
import ComingSoon from './pages/media/ComingSoon'
import ComicLibrary from './pages/media/ComicLibrary'
import SearchPage from './pages/search/SearchPage'
import ProtectedRoute from './components/ProtectedRoute'
import MusicDrawer from './components/music/MusicDrawer'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext'
import { NotificationProvider, useNotification } from './context/NotificationContext'
import { UploadProvider } from './context/UploadContext'
import { MusicProvider } from './context/MusicContext'

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
                  <MusicProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route 
                          path="/" 
                          element={
                            <ProtectedRoute>
                              <UploadProvider>
                                <Home />
                                <MusicDrawer />
                              </UploadProvider>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/search" 
                          element={
                            <ProtectedRoute>
                              <SearchPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/music" 
                          element={
                            <ProtectedRoute>
                              <MusicPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/media/video" 
                          element={
                            <ProtectedRoute>
                              <div style={{ padding: '80px 20px 20px 100px' }}>
                                <VideoLibrary />
                              </div>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/media/music" 
                          element={
                            <ProtectedRoute>
                              <div style={{ padding: '80px 20px 20px 100px' }}>
                                <MusicLibrary />
                              </div>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/media/comics" 
                          element={
                            <ProtectedRoute>
                              <div style={{ padding: '80px 20px 20px 100px' }}>
                                <ComicLibrary />
                              </div>
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/media/*" 
                          element={
                            <ProtectedRoute>
                              <div style={{ padding: '80px 20px 20px 100px' }}>
                                <ComingSoon />
                              </div>
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/test-video" element={<VideoTestPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                    <GlobalNotification notificationContext={notificationContext} />
                  </MusicProvider>
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
