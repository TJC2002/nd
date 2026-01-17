import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <AuthProvider>
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
                      <Home />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MuiThemeProvider>
        )}
      </CustomThemeProvider>
    </AuthProvider>
  )
}

export default App
