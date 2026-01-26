import React, { useRef, useState, useEffect } from 'react'
import { Box, IconButton, Typography, useTheme, Slider } from '@mui/material'
import {
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  SkipPreviousRounded,
  VolumeUpRounded,
  VolumeOffRounded,
} from '@mui/icons-material'
import { useMusic } from '../../context/MusicContext'
import { useNavigate, useLocation } from 'react-router-dom'
import './MusicMiniPlayer.css'

const MusicMiniPlayer = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
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
  } = useMusic()

  const [isHovered, setIsHovered] = useState(false)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const formatTime = (time) => {
    if (!time) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const textRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth
      const containerWidth = containerRef.current.clientWidth
      setShouldScroll(textWidth > containerWidth)
    }
  }, [currentSong?.title])

  useEffect(() => {
    if (shouldScroll && isPlaying) {
      const interval = setInterval(() => {
        setScrollPosition((prev) => {
          const textWidth = textRef.current?.scrollWidth || 0
          const containerWidth = containerRef.current?.clientWidth || 0
          const maxScroll = textWidth - containerWidth

          if (prev >= maxScroll) {
            return 0
          }
          return prev + 1
        })
      }, 30)

      return () => clearInterval(interval)
    } else if (!isPlaying) {
      setScrollPosition(0)
    }
  }, [shouldScroll, isPlaying])

  const handleClick = () => {
    navigate('/music')
  }

  const shouldShow = location.pathname === '/media/music' && currentSong

  if (!shouldShow) return null

  return (
    <Box
      className="music-mini-player"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Box className="mini-player-cover-container">
        <Box
          component="img"
          src={currentSong.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'}
          alt="Album Cover"
          className={`mini-player-cover ${isPlaying ? 'playing' : ''}`}
        />
      </Box>

      <Box className="mini-player-info">
        <Box className="mini-player-song-info">
          <Box className="mini-player-title-container" ref={containerRef}>
            <Typography
              ref={textRef}
              variant="subtitle1"
              className={`mini-player-title ${shouldScroll ? 'scrolling' : ''}`}
              sx={{
                transform: `translateX(-${scrollPosition}px)`,
                transition: 'none',
              }}
            >
              {currentSong.title || 'Unknown Title'}
            </Typography>
          </Box>
          <Typography variant="body2" className="mini-player-artist">
            {currentSong.artist || 'Unknown Artist'}
          </Typography>
        </Box>

        <Box className="mini-player-progress-container">
          <Box
            className="mini-player-progress-bar"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <Box
              className="mini-player-progress-fill"
              sx={{
                width: duration ? `${(progress / duration) * 100}%` : '0%',
                transition: isDragging ? 'none' : 'width 0.1s linear',
              }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="mini-player-progress-input"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </Box>
          <Typography variant="caption" className="mini-player-time">
            {formatTime(progress)} / {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      <Box className="mini-player-controls" onClick={(e) => e.stopPropagation()}>
        <IconButton
          onClick={handlePrev}
          className="mini-player-prev-btn"
          sx={{ color: 'white', mr: 1 }}
        >
          <SkipPreviousRounded />
        </IconButton>
        <IconButton
          onClick={togglePlay}
          className="mini-player-play-btn"
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'white',
            color: 'black',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
        </IconButton>
        <IconButton
          onClick={handleNext}
          className="mini-player-next-btn"
          sx={{ color: 'white', ml: 1 }}
        >
          <SkipNextRounded />
        </IconButton>
        <Box className="mini-player-volume">
          <IconButton
            onClick={() => setIsMuted(!isMuted)}
            size="small"
            sx={{ color: 'white' }}
          >
            {isMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
          </IconButton>
          <Box sx={{ width: 80 }}>
            <Slider
              size="small"
              value={isMuted ? 0 : volume * 100}
              onChange={(_, value) => setVolume(value / 100)}
              sx={{
                color: 'white',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                },
                '&:hover .MuiSlider-thumb': {
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MusicMiniPlayer
