import React, { useRef, useState, useEffect } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  useMediaRemote,
  useMediaState,
  Track,
} from '@vidstack/react';
import 'vidstack/player/styles/base.css';
import {
  IoPlay,
  IoPause,
  IoSettings,
  IoVolumeHigh,
  IoVolumeMute,
  IoExpand,
  IoContract,
} from 'react-icons/io5';
import {
  Box,
  Slider,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Stack,
  Tabs,
  Tab,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import './VideoPlayer.css';

function VideoPlayer({ src, tracks = [], poster }) {
  const { theme } = useTheme();
  const playerRef = useRef(null);
  const remote = useMediaRemote(playerRef);

  // Vidstack state
  const paused = useMediaState('paused', playerRef);
  const currentTime = useMediaState('currentTime', playerRef);
  const duration = useMediaState('duration', playerRef);
  const volume = useMediaState('volume', playerRef);
  const muted = useMediaState('muted', playerRef);
  const fullscreen = useMediaState('fullscreen', playerRef);

  // Local state for controls visibility
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Settings Menu State
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const isSettingsOpen = Boolean(settingsAnchor);
  const [settingsTab, setSettingsTab] = useState(0);

  // Subtitle Settings
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleSize, setSubtitleSize] = useState(100);
  const [subtitleOpacity, setSubtitleOpacity] = useState(0);

  // Helper: Format time
  const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (paused) {
      remote.play();
    } else {
      remote.pause();
    }
  };

  // Handle Volume
  const handleVolumeChange = (_, newValue) => {
    remote.changeVolume(newValue / 100);
    if (newValue > 0 && muted) remote.unmute();
  };

  const toggleMute = () => {
    if (muted) {
      remote.unmute();
    } else {
      remote.mute();
    }
  };

  // Handle Seek
  const handleSeek = (_, newValue) => {
    remote.seek(newValue);
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (fullscreen) {
      remote.exitFullscreen();
    } else {
      remote.enterFullscreen();
    }
  };

  // Controls Visibility Logic
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (!paused) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isSettingsOpen) setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Settings Menu Handlers
  const handleSettingsClick = (event) => {
    setSettingsAnchor(event.currentTarget);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
    handleMouseMove(); // Reset hiding timer
  };

  const handleTabChange = (_, newValue) => {
    setSettingsTab(newValue);
  };

  return (
    <Box
      className="video-player-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !paused && setShowControls(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: theme.shadows[4],
      }}
    >
      <MediaPlayer
        className="vidstack-player"
        ref={playerRef}
        src={src}
        poster={poster}
        aspectRatio={16 / 9}
        onPlay={() => handleMouseMove()}
        onPause={() => setShowControls(true)}
        style={{
          // Apply subtitle settings via CSS variables
          '--media-cue-font-size': `${subtitleSize}%`,
          '--media-cue-bg-color': `rgba(0, 0, 0, ${subtitleOpacity / 100})`,
          '--media-cue-opacity': showSubtitles ? 1 : 0,
        }}
      >
        <MediaProvider>
          {tracks.map((track, index) => (
            <Track
              key={index}
              {...track}
              default={track.default && showSubtitles}
            />
          ))}
        </MediaProvider>

        {/* Custom Controls Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            opacity: showControls || paused ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pointerEvents: showControls || paused ? 'auto' : 'none',
          }}
        >
          {/* Seek Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Slider
              size="small"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              sx={{
                color: theme.palette.primary.main,
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.2s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': {
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}33`,
                    width: 16,
                    height: 16,
                  },
                  '&.Mui-active': {
                    width: 20,
                    height: 20,
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.28,
                  backgroundColor: '#fff',
                },
              }}
            />
          </Box>

          {/* Control Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '8px 16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={togglePlay} sx={{ color: '#fff' }}>
                {paused ? <IoPlay /> : <IoPause />}
              </IconButton>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 140 }}>
                <IconButton onClick={toggleMute} sx={{ color: '#fff', p: 0.5 }}>
                  {muted || volume === 0 ? <IoVolumeMute /> : <IoVolumeHigh />}
                </IconButton>
                <Slider
                  value={muted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  aria-labelledby="volume-slider"
                  sx={{
                    color: '#fff',
                    height: 4,
                    '& .MuiSlider-thumb': { width: 0, height: 0 },
                    '&:hover .MuiSlider-thumb': { width: 10, height: 10 },
                  }}
                />
              </Stack>

              <Typography variant="body2" sx={{ color: '#fff', userSelect: 'none' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleSettingsClick} sx={{ color: '#fff' }}>
                <IoSettings />
              </IconButton>
              <IconButton onClick={toggleFullscreen} sx={{ color: '#fff' }}>
                {fullscreen ? <IoContract /> : <IoExpand />}
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </MediaPlayer>

      {/* Settings Dialog/Menu */}
      <Dialog
        open={isSettingsOpen}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: 2,
            minWidth: 300,
          }
        }}
      >
        <DialogTitle sx={{ p: 2, pb: 0 }}>Settings</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={settingsTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Subtitles" />
            <Tab label="Audio" />
            <Tab label="Quality" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {settingsTab === 0 && (
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>Enable Subtitles</Typography>
                  <Switch
                    checked={showSubtitles}
                    onChange={(e) => setShowSubtitles(e.target.checked)}
                  />
                </Stack>

                <Box>
                  <Typography gutterBottom variant="caption">Font Size</Typography>
                  <Slider
                    value={subtitleSize}
                    onChange={(_, v) => setSubtitleSize(v)}
                    min={50}
                    max={200}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box>
                  <Typography gutterBottom variant="caption">Background Opacity</Typography>
                  <Slider
                    value={subtitleOpacity}
                    onChange={(_, v) => setSubtitleOpacity(v)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Stack>
            )}

            {settingsTab === 1 && (
              <Stack spacing={1}>
                {/* Mock Audio Tracks */}
                {['English (Original)', 'Spanish', 'French'].map((track) => (
                  <MenuItem key={track} onClick={handleSettingsClose} dense>
                    {track}
                  </MenuItem>
                ))}
              </Stack>
            )}

            {settingsTab === 2 && (
              <Stack spacing={1}>
                 {/* Mock Qualities */}
                {['Auto', '1080p', '720p', '480p'].map((quality) => (
                  <MenuItem key={quality} onClick={handleSettingsClose} dense>
                    {quality}
                  </MenuItem>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VideoPlayer;
