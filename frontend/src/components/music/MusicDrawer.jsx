import React from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  Divider,
} from '@mui/material'
import {
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeUpRounded,
  VolumeOffRounded,
  FullscreenRounded,
  CloseRounded,
  QueueMusicRounded,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useMusic } from '../../context/MusicContext'
import './MusicDrawer.css'

const MusicDrawer = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const {
    drawerOpen,
    toggleDrawer,
    currentSong,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
    progress,
    duration,
    seek,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playlist,
    playSong,
    setFullScreen,
  } = useMusic()

  const formatTime = (time) => {
    if (!time) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleFullScreen = () => {
    setFullScreen(true)
    toggleDrawer(false)
    navigate('/music')
  }

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => toggleDrawer(false)}
      variant="temporary"
      sx={{ zIndex: 1400 }}
      PaperProps={{
        sx: {
          width: 360,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
          ...(theme.palette.mode === 'dark' && {
            bgcolor: 'rgba(30, 30, 30, 0.9)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          }),
        },
      }}
    >
      <Box className="music-drawer-container">
        {/* Header */}
        <Box className="music-drawer-header" sx={{ mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            音乐播放器
          </Typography>
          <Box>
             <IconButton onClick={handleFullScreen} size="small" title="全屏模式" color="primary">
              <FullscreenRounded />
            </IconButton>
            <IconButton onClick={() => toggleDrawer(false)} size="small" color="inherit">
              <CloseRounded />
            </IconButton>
          </Box>
        </Box>

        {/* Current Song Info */}
        <Box className="music-cover-section">
          <Box
            component="img"
            src={currentSong?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'}
            alt="Album Cover"
            className={`music-cover ${isPlaying ? 'playing' : ''}`}
            sx={{
               boxShadow: theme.shadows[10]
            }}
          />
          <Typography variant="h6" noWrap sx={{ mt: 2, mb: 0.5, fontWeight: 600 }}>
            {currentSong?.title || '未播放音乐'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentSong?.artist || '选择一首歌曲开始播放'}
          </Typography>
        </Box>

        {/* Controls */}
        <Box className="music-controls-section">
          {/* Timeline */}
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(progress)}
            </Typography>
            <Slider
              size="small"
              value={progress}
              max={duration || 100}
              onChange={(_, value) => seek(value)}
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.16)'
                        : 'rgba(0, 0, 0, 0.16)'
                    }`,
                  },
                  '&.Mui-active': {
                    width: 20,
                    height: 20,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Main Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={handlePrev} size="medium">
              <SkipPreviousRounded fontSize="large" />
            </IconButton>
            <IconButton
              onClick={togglePlay}
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }}
            >
              {isPlaying ? <PauseRounded sx={{ fontSize: 32 }} /> : <PlayArrowRounded sx={{ fontSize: 32 }} />}
            </IconButton>
            <IconButton onClick={handleNext} size="medium">
              <SkipNextRounded fontSize="large" />
            </IconButton>
          </Box>

          {/* Volume */}
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
            <IconButton onClick={() => setIsMuted(!isMuted)} size="small">
              {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
            </IconButton>
            <Slider
              size="small"
              value={isMuted ? 0 : volume * 100}
              onChange={(_, value) => setVolume(value / 100)}
              sx={{ width: 100 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Playlist */}
        <Box className="music-playlist-section">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 2 }}>
            <QueueMusicRounded sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary">
              播放列表 ({playlist.length})
            </Typography>
          </Box>
          <List dense sx={{ flex: 1, overflow: 'auto', px: 1 }}>
            {playlist.map((song) => (
              <ListItem
                key={song.id}
                button
                selected={currentSong?.id === song.id}
                onClick={() => playSong(song)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                    '& .MuiListItemText-secondary': {
                        color: 'rgba(255,255,255,0.7)'
                    }
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={song.cover} variant="rounded" />
                </ListItemAvatar>
                <ListItemText
                  primary={song.title}
                  secondary={song.artist}
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ noWrap: true, fontSize: '0.75rem' }}
                />
                {currentSong?.id === song.id && isPlaying && (
                    <Box className="playing-indicator">
                        <span className="bar n1"></span>
                        <span className="bar n2"></span>
                        <span className="bar n3"></span>
                    </Box>
                )}
              </ListItem>
            ))}
            {playlist.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        暂无歌曲，快去添加吧
                    </Typography>
                </Box>
            )}
          </List>
        </Box>
      </Box>
    </Drawer>
  )
}

export default MusicDrawer
