import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

const MusicContext = createContext(null)

export const MusicProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [playlist, setPlaylist] = useState([])
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const [musicSettings, setMusicSettings] = useState({
    background: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-heads-like-statues-32733-large.mp4',
    backgroundType: 'video', // 'video', 'image', 'color'
    themeColor: '#ffffff'
  })
  
  const audioRef = useRef(new Audio())

  // Initialize audio events
  useEffect(() => {
    const audio = audioRef.current
    
    const updateProgress = () => setProgress(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => handleNext()
    
    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Handle play/pause
  useEffect(() => {
    if (currentSong) {
      if (audioRef.current.src !== currentSong.url) {
        audioRef.current.src = currentSong.url
        audioRef.current.load()
      }
      
      if (isPlaying) {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed:", error)
            setIsPlaying(false)
          })
        }
      } else {
        audioRef.current.pause()
      }
    }
  }, [currentSong, isPlaying])

  // Handle volume
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const togglePlay = () => setIsPlaying(!isPlaying)
  
  const playSong = (song) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
      // Add to playlist if not present
      if (!playlist.find(s => s.id === song.id)) {
        setPlaylist([...playlist, song])
      }
    }
  }

  const handleNext = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.findIndex(s => s.id === currentSong?.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    setCurrentSong(playlist[nextIndex])
    setIsPlaying(true)
  }

  const handlePrev = () => {
    if (playlist.length === 0) return
    const currentIndex = playlist.findIndex(s => s.id === currentSong?.id)
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    setCurrentSong(playlist[prevIndex])
    setIsPlaying(true)
  }

  const seek = (time) => {
    audioRef.current.currentTime = time
    setProgress(time)
  }

  const toggleDrawer = (open) => {
    setDrawerOpen(open)
  }

  const value = {
    isPlaying,
    currentSong,
    playlist,
    progress,
    duration,
    volume,
    isMuted,
    drawerOpen,
    fullScreen,
    togglePlay,
    playSong,
    handleNext,
    handlePrev,
    seek,
    setVolume,
    setIsMuted,
    toggleDrawer,
    setFullScreen,
    setPlaylist,
    musicSettings,
    setMusicSettings,
  }

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  )
}

export const useMusic = () => {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
