import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  IconButton,
  Container,
  TextField,
  InputAdornment,
  Chip,
  Button
} from '@mui/material'
import {
  Search,
  PlayArrow,
  MoreVert,
  FilterList,
  ArrowBack
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Mock Data for Videos
const mockVideos = [
  {
    id: 1,
    title: 'Big Buck Bunny',
    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
    duration: '10:34',
    views: '1.2M',
    date: '2 years ago'
  },
  {
    id: 2,
    title: 'Elephant Dream',
    thumbnail: 'https://orange.blender.org/wp-content/themes/orange/images/media/gallery/s1_proog.jpg',
    duration: '12:15',
    views: '800K',
    date: '5 years ago'
  },
   {
    id: 3,
    title: 'Sintel',
    thumbnail: 'https://durian.blender.org/wp-content/uploads/2010/06/05.jpg',
    duration: '14:48',
    views: '2.5M',
    date: '4 years ago'
  },
]

const VideoLibrary = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleVideoClick = (videoId) => {
    // In a real app, you might navigate to a specific player page or open a modal
    // For now, we can link to the existing video test page or a new player route
     navigate('/test-video') // Reusing the existing test page for now as a player
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 500 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            视频库
          </Typography>
        </Box>
         <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                size="small"
                placeholder="搜索视频..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <Search />
                    </InputAdornment>
                    ),
                }}
            />
            <IconButton>
                <FilterList />
            </IconButton>
         </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>最近播放</Typography>
      {/* You could add a horizontal scroll list for "Recent" here */}


      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>全部视频</Typography>
      <Grid container spacing={3}>
        {mockVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
            <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => handleVideoClick(video.id)}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={video.thumbnail}
                    alt={video.title}
                  />
                  <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        px: 1,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}
                  >
                    {video.duration}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="subtitle1" component="div" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {video.title}
                    </Typography>
                    <IconButton size="small" sx={{ mt: -0.5, mr: -1 }}>
                        <MoreVert fontSize="small"/>
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {video.views} views • {video.date}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default VideoLibrary
