import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material'
import {
  LibraryMusic,
  QueueMusic,
  Settings,
  Image,
  Videocam,
  ColorLens,
  Add,
  Close,
} from '@mui/icons-material'
import { useMusic } from '../../context/MusicContext'

const MusicSettingsDialog = ({ open, onClose }) => {
  const theme = useTheme()
  const { musicSettings, setMusicSettings } = useMusic()
  const [activeTab, setActiveTab] = useState(0)

  const handleBackgroundChange = (type, value) => {
    setMusicSettings(prev => ({
      ...prev,
      backgroundType: type,
      background: value
    }))
  }

  const presetBackgrounds = [
    { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-heads-like-statues-32733-large.mp4', label: '默认抽象' },
    { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4', label: '星空' },
    { type: 'video', url: 'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-background-1564-large.mp4', label: '海滩' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=1920&q=80', label: '城市夜景' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=1920&q=80', label: '自然风光' },
  ]

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: 4
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
        <DialogTitle sx={{ p: 0 }}>播放器设置</DialogTitle>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      <DialogContent sx={{ mt: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="背景风格" />
          <Tab label="界面主题" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Videocam fontSize="small" /> 动态背景
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {presetBackgrounds.filter(bg => bg.type === 'video').map((bg, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      border: musicSettings.background === bg.url ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent'
                    }}
                  >
                    <CardActionArea onClick={() => handleBackgroundChange('video', bg.url)}>
                      <CardMedia
                        component="video"
                        src={bg.url}
                        autoPlay
                        muted
                        loop
                        sx={{ height: 100, objectFit: 'cover' }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption">{bg.label}</Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Image fontSize="small" /> 静态背景
            </Typography>
            <Grid container spacing={2}>
              {presetBackgrounds.filter(bg => bg.type === 'image').map((bg, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Card 
                     sx={{ 
                      borderRadius: 2,
                      border: musicSettings.background === bg.url ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent'
                    }}
                  >
                    <CardActionArea onClick={() => handleBackgroundChange('image', bg.url)}>
                      <CardMedia
                        component="img"
                        image={bg.url}
                        sx={{ height: 100 }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption">{bg.label}</Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3 }}>
                 <TextField 
                    fullWidth 
                    label="自定义背景链接 (图片/视频 URL)" 
                    variant="outlined" 
                    size="small"
                    placeholder="https://..."
                    onChange={(e) => {
                         const val = e.target.value;
                         const type = val.endsWith('.mp4') || val.endsWith('.webm') ? 'video' : 'image';
                         handleBackgroundChange(type, val);
                    }}
                 />
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
            <Box>
                <Typography variant="body1" color="text.secondary">
                    更多主题配置开发中...
                </Typography>
            </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MusicSettingsDialog
