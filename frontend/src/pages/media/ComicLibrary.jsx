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
  TextField,
  InputAdornment,
  Chip,
  Button
} from '@mui/material'
import {
  Search,
  MoreVert,
  FilterList,
  ArrowBack,
  MenuBook
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Mock Data for Comics
const mockComics = [
  {
    id: 1,
    title: 'Spider-Man: Miles Morales',
    cover: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop',
    chapters: 24,
    author: 'Marvel',
    updateTime: '2 days ago'
  },
  {
    id: 2,
    title: 'Batman: The Long Halloween',
    cover: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=400&h=300&fit=crop',
    chapters: 12,
    author: 'DC Comics',
    updateTime: '1 week ago'
  },
  {
    id: 3,
    title: 'One Piece Vol. 1',
    cover: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=300&fit=crop',
    chapters: 1000,
    author: 'Eiichiro Oda',
    updateTime: '3 days ago'
  },
  {
    id: 4,
    title: 'Attack on Titan',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=300&fit=crop',
    chapters: 139,
    author: 'Hajime Isayama',
    updateTime: '1 month ago'
  },
  {
    id: 5,
    title: 'Demon Slayer',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=300&fit=crop',
    chapters: 205,
    author: 'Koyoharu Gotouge',
    updateTime: '2 weeks ago'
  },
  {
    id: 6,
    title: 'My Hero Academia',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    chapters: 420,
    author: 'Kohei Horikoshi',
    updateTime: '5 days ago'
  },
]

const ComicLibrary = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleComicClick = (comicId) => {
    // Navigate to comic reader or detail page
    console.log('Open comic:', comicId)
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MenuBook sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              漫画库
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="搜索漫画..."
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

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="全部" color="primary" size="small" />
          <Chip label="连载中" variant="outlined" size="small" />
          <Chip label="已完结" variant="outlined" size="small" />
          <Chip label="最近更新" variant="outlined" size="small" />
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>最近阅读</Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>全部漫画</Typography>
      <Grid container spacing={3}>
        {mockComics.map((comic) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={comic.id}>
            <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea onClick={() => handleComicClick(comic.id)}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={comic.cover}
                    alt={comic.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      bgcolor: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {comic.chapters} 话
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography gutterBottom variant="subtitle1" component="div" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {comic.title}
                    </Typography>
                    <IconButton size="small" sx={{ mt: -0.5, mr: -1 }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {comic.author} • {comic.updateTime}
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

export default ComicLibrary
