import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Container,
  useTheme,
  Paper,
  Fade,
  Tooltip,
} from '@mui/material'
import {
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeUpRounded,
  VolumeOffRounded,
  ArrowBackRounded,
  Settings,
  QueueMusic,
  Lyrics,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useMusic } from '../../context/MusicContext'
import MusicSettingsDialog from '../../components/music/MusicSettingsDialog'
import './MusicPage.css'

const MusicPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const {
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
    setFullScreen,
    musicSettings,
  } = useMusic()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const lyricsContainerRef = useRef(null)

  // Mock lyrics data (In a real app, this would come from the song object or an API)
  const lyrics = [
    { time: 0, text: "Wait for the music..." },
    { time: 5, text: "Instrumental Intro" },
    { time: 10, text: "Start of the song" },
    { time: 15, text: "Just a demo line one" },
    { time: 20, text: "Another lyric line here" },
    { time: 25, text: "Singing along with the code" },
    { time: 30, text: "React makes this easy" },
    { time: 35, text: "Material UI looks great" },
    { time: 40, text: "Fading in and out" },
    { time: 45, text: "End of the demo lyrics" },
  ]

  const activeLyricIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1]
    return progress >= line.time && (!nextLine || progress < nextLine.time)
  })

  // Auto-scroll lyrics
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex]
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [activeLyricIndex])

  const formatTime = (time) => {
    if (!time) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleBack = () => {
    setFullScreen(false)
    navigate(-1)
  }

  return (
    <Box className="music-page">
      {/* Dynamic Background */}
      {musicSettings.backgroundType === 'video' ? (
        <video
          autoPlay
          muted
          loop
          className="music-video-bg"
          src={musicSettings.background} 
        />
      ) : (
        <Box 
            className="music-video-bg"
            component="img"
            src={musicSettings.background}
            sx={{ objectFit: 'cover' }}
        />
      )}
      <Box className="music-overlay" />

      <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ color: 'white' }}>
              <ArrowBackRounded />
            </IconButton>
            <Typography variant="h6" sx={{ color: 'white', ml: 2 }}>
              沉浸模式
            </Typography>
          </Box>
          <Box>
            <Tooltip title="播放设置">
              <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: 'white' }}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', pb: 8 }}>
          {/* Left Side - Cover & Controls */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400 }}>
            <Box
              component="img"
              src={currentSong?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'}
              alt="Album Cover"
              className={`music-page-cover ${isPlaying ? 'playing' : ''}`}
            />
            
            <Box sx={{ textAlign: 'center', mt: 4, mb: 4, color: 'white' }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {currentSong?.title || 'No Song Selected'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                {currentSong?.artist || 'Unknown Artist'}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Slider
                value={progress}
                max={duration || 100}
                onChange={(_, value) => seek(value)}
                sx={{
                  color: 'white',
                  '& .MuiSlider-rail': { opacity: 0.3 },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', mt: -1 }}>
                <Typography variant="caption">{formatTime(progress)}</Typography>
                <Typography variant="caption">{formatTime(duration)}</Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <IconButton onClick={handlePrev} sx={{ color: 'white' }} size="large">
                <SkipPreviousRounded sx={{ fontSize: 40 }} />
              </IconButton>
              <IconButton
                onClick={togglePlay}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'white',
                  color: 'black',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                {isPlaying ? <PauseRounded sx={{ fontSize: 40 }} /> : <PlayArrowRounded sx={{ fontSize: 40 }} />}
              </IconButton>
              <IconButton onClick={handleNext} sx={{ color: 'white' }} size="large">
                <SkipNextRounded sx={{ fontSize: 40 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Right Side - Lyrics */}
          <Box className="lyrics-container" ref={lyricsContainerRef}>
            {lyrics.map((line, index) => (
              <Typography
                key={index}
                variant="h5"
                className={`lyric-line ${index === activeLyricIndex ? 'active' : ''}`}
              >
                {line.text}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
      
      <MusicSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  )
}

export default MusicPage
