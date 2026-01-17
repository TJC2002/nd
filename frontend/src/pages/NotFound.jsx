import React from 'react'
import { Box, Container, Typography, Button, Paper } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          minHeight: '80vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: '4rem', 
            textAlign: 'center', 
            borderRadius: '1rem' 
          }}
        >
          <ErrorOutline sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            页面不存在
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            您访问的页面不存在或已被移除
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleGoHome}
          >
            返回首页
          </Button>
        </Paper>
      </Box>
    </Container>
  )
}

export default NotFound
