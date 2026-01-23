import React from 'react'
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  useTheme,
  Icon,
} from '@mui/material'
import {
  MusicNote,
  Movie,
  Description,
  MenuBook,
  Book,
  Spa, // For White Noise
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const MediaCard = ({ title, icon, color, path, description }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(path)} 
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 3 }}
      >
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: '50%', 
            bgcolor: `${color}20`, 
            color: color,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  )
}

const MediaCenter = () => {
  const theme = useTheme()

  const mediaItems = [
    {
      title: '音乐',
      icon: <MusicNote fontSize="large" />,
      color: '#E91E63', // Pink
      path: '/media/music',
      description: '沉浸式音乐播放体验，支持歌词与可视化。'
    },
    {
      title: '视频',
      icon: <Movie fontSize="large" />,
      color: '#F44336', // Red
      path: '/media/video',
      description: '观看您的个人视频库，支持多种格式播放。'
    },
    {
      title: '文档',
      icon: <Description fontSize="large" />,
      color: '#2196F3', // Blue
      path: '/media/documents', // Placeholder
      description: '浏览和管理您的文档，支持预览与编辑。'
    },
    {
      title: '漫画',
      icon: <MenuBook fontSize="large" />,
      color: '#FF9800', // Orange
      path: '/media/comics', // Placeholder
      description: '沉浸式漫画阅读体验。'
    },
    {
      title: '小说',
      icon: <Book fontSize="large" />,
      color: '#4CAF50', // Green
      path: '/media/novels', // Placeholder
      description: '舒适的文本阅读环境，支持自定义设置。'
    },
    {
      title: '白噪音',
      icon: <Spa fontSize="large" />,
      color: '#00BCD4', // Cyan
      path: '/media/whitenoise', // Placeholder
      description: '专注与放松，多种自然音效组合。'
    },
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        影音中心
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        在线播放您的视频和音频文件，支持多种格式。
      </Typography>
      <Grid container spacing={3}>
        {mediaItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MediaCard {...item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default MediaCenter
