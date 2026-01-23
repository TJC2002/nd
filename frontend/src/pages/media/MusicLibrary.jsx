import React from 'react'
import MusicPage from '../music/MusicPage'

// Wrapper to use the existing MusicPage within the Media routes if needed, 
// or simply redirect/render it. 
// Since MusicPage is quite immersive and has its own layout, we might just re-export it 
// or wrap it if we want to keep the sidebar context (though MusicPage seems full screen).

// For this requirement, "Audio, also, like Netflix and Apple Music", implies a library view first.
// The existing MusicPage is a "Now Playing" interface.
// So we need a "Music Library" view similar to the MediaCenter but for music specifically (Albums, Artists, Playlists).

import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActionArea,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

const mockAlbums = [
    { id: 1, title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Random Access Memories', artist: 'Daft Punk', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Night Visions', artist: 'Imagine Dragons', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60' },
    { id: 4, title: 'A Head Full of Dreams', artist: 'Coldplay', cover: 'https://images.unsplash.com/photo-1514525253440-b393452e2380?w=500&auto=format&fit=crop&q=60' },
]

const MusicLibrary = () => {
    const navigate = useNavigate()

    const handleAlbumClick = () => {
        // Navigate to the player (immersive view)
        navigate('/music')
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                音乐库
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
                为你推荐
            </Typography>

            <Grid container spacing={3}>
                {mockAlbums.map((album) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={album.id}>
                        <Card sx={{ borderRadius: 2, height: '100%', bgcolor: 'transparent', boxShadow: 'none' }}>
                            <CardActionArea onClick={handleAlbumClick}>
                                <CardMedia
                                    component="img"
                                    image={album.cover}
                                    alt={album.title}
                                    sx={{ borderRadius: 2, aspectRatio: '1/1', objectFit: 'cover', mb: 1 }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                        {album.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {album.artist}
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

export default MusicLibrary
