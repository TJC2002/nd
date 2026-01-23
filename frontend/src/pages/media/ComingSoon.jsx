import React from 'react'
import { Box, Typography, Button, Container, Icon } from '@mui/material'
import { ArrowBack, Construction } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const ComingSoon = ({ title }) => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 10 }}>
        <Box sx={{ mb: 4, color: 'text.secondary' }}>
            <Construction sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h3" gutterBottom fontWeight="bold">
            {title || '即将推出'}
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
            这个功能正在紧锣密鼓地开发中，敬请期待！
        </Typography>
        <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ mt: 4 }}
        >
            返回
        </Button>
    </Container>
  )
}

export default ComingSoon
