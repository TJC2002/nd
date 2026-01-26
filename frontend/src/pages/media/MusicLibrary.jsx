import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMusic } from '../../context/MusicContext'

import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActionArea,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

const mockRecommendations = [
    { id: 1, title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Random Access Memories', artist: 'Daft Punk', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Night Visions', artist: 'Imagine Dragons', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60' },
    { id: 4, title: 'A Head Full of Dreams', artist: 'Coldplay', cover: 'https://images.unsplash.com/photo-1514525253440-b393452e2380?w=500&auto=format&fit=crop&q=60' },
]

const mockPlaylists = [
    { id: 1, title: '今日推荐', songCount: 50, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60' },
    { id: 2, title: '工作专注', songCount: 35, cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=60' },
    { id: 3, title: '运动激情', songCount: 45, cover: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=500&auto=format&fit=crop&q=60' },
    { id: 4, title: '放松时刻', songCount: 28, cover: 'https://images.unsplash.com/photo-1459749411177-287ce327f24d?w=500&auto=format&fit=crop&q=60' },
]

const mockAlbums = [
    { id: 1, title: 'Midnight City', artist: 'M83', year: 2011, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
    { id: 2, title: 'Random Access Memories', artist: 'Daft Punk', year: 2013, cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60' },
    { id: 3, title: 'Night Visions', artist: 'Imagine Dragons', year: 2012, cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60' },
    { id: 4, title: 'A Head Full of Dreams', artist: 'Coldplay', year: 2015, cover: 'https://images.unsplash.com/photo-1514525253440-b393452e2380?w=500&auto=format&fit=crop&q=60' },
]

const mockArtists = [
    { id: 1, name: 'Taylor Swift', followers: '85M', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60' },
    { id: 2, name: 'The Weeknd', followers: '72M', cover: 'https://images.unsplash.com/photo-1499415479124-43c32433a620?w=500&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Billie Eilish', followers: '65M', cover: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=500&auto=format&fit=crop&q=60' },
    { id: 4, name: 'Drake', followers: '68M', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60' },
]

const mockCategories = [
    { id: 1, name: '流行音乐', color: '#FF6B6B' },
    { id: 2, name: '摇滚', color: '#4ECDC4' },
    { id: 3, name: '电子', color: '#FFE66D' },
    { id: 4, name: '古典', color: '#95E1D3' },
    { id: 5, name: '爵士', color: '#F38181' },
    { id: 6, name: '民谣', color: '#AA96DA' },
]

const MusicLibrary = () => {
    const navigate = useNavigate()
    const { playSong } = useMusic()

    const [addDialog, setAddDialog] = useState({ open: false, type: null, title: '' })
    const [newItemName, setNewItemName] = useState('')

    const handleOpenAddDialog = (type, defaultTitle) => {
        setAddDialog({ open: true, type, title: defaultTitle })
        setNewItemName('')
    }

    const handleCloseAddDialog = () => {
        setAddDialog({ ...addDialog, open: false })
    }

    const handleAddItem = () => {
        console.log(`Adding ${addDialog.type}:`, newItemName)
        handleCloseAddDialog()
    }

    const handlePlaySong = (song) => {
        playSong({
            id: song.id,
            title: song.title || song.name,
            artist: song.artist || '',
            cover: song.cover || '',
            url: song.url || '',
        })
    }

    const MusicCard = ({ item, type }) => {
        const handleCardClick = () => {
            if (type === 'song' || type === 'recommendation') {
                handlePlaySong(item)
            } else {
                navigate('/music')
            }
        }

        if (type === 'category') {
            return (
                <Grid item xs={6} sm={4} md={2} key={item.id}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            height: 120,
                            bgcolor: item.color,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                            },
                        }}
                        onClick={() => navigate('/music')}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: 2,
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" color="white" textAlign="center">
                                {item.name}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            )
        }

        if (type === 'artist') {
            return (
                <Grid item xs={6} sm={4} md={2} key={item.id}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            bgcolor: 'transparent',
                            boxShadow: 'none',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}
                        onClick={() => navigate('/music')}
                    >
                        <Box sx={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', pt: 1 }}>
                            <CardMedia
                                component="img"
                                image={item.cover}
                                alt={item.name}
                                sx={{
                                    borderRadius: '50%',
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto',
                                    aspectRatio: '1/1',
                                    objectFit: 'cover',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    },
                                }}
                            />
                        </Box>
                        <CardContent sx={{ p: 0 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {item.followers}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )
        }

        return (
            <Grid item xs={6} sm={4} md={2} key={item.id}>
                <Card
                    sx={{
                        borderRadius: 3,
                        height: '100%',
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                        },
                    }}
                    onClick={handleCardClick}
                >
                    <CardMedia
                        component="img"
                        image={item.cover}
                        alt={item.title}
                        sx={{
                            borderRadius: 3,
                            aspectRatio: '1/1',
                            objectFit: 'cover',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                            },
                        }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {item.title || item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {type === 'playlist' ? `${item.songCount} 首歌曲` : item.artist}
                            {type === 'album' && ` · ${item.year}`}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        )
    }

    const Section = ({ title, items, type, addButtonText }) => (
        <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                {title}
            </Typography>
            <Grid container spacing={3}>
                {items.map((item) => (
                    <MusicCard key={item.id} item={item} type={type} />
                ))}
                <Grid item xs={6} sm={4} md={2} key="add">
                    <Card
                        sx={{
                            borderRadius: 3,
                            height: '100%',
                            bgcolor: 'transparent',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '2px dashed rgba(255, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            aspectRatio: '1/1',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: 'rgba(0, 229, 255, 0.6)',
                                bgcolor: 'rgba(0, 229, 255, 0.05)',
                            },
                        }}
                        onClick={() => handleOpenAddDialog(type, addButtonText)}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                color: 'text.secondary',
                                p: 2,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
                            <AddIcon sx={{ fontSize: 40 }} />
                            <Typography variant="body2" fontWeight="bold">
                                {addButtonText}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                音乐库
            </Typography>

            <Section title="为你推荐" items={mockRecommendations} type="recommendation" addButtonText="添加推荐" />
            <Section title="热门歌单" items={mockPlaylists} type="playlist" addButtonText="添加歌单" />
            <Section title="热门专辑" items={mockAlbums} type="album" addButtonText="添加专辑" />
            <Section title="热门作者" items={mockArtists} type="artist" addButtonText="添加作者" />
            <Section title="音乐分类" items={mockCategories} type="category" addButtonText="添加分类" />

            <Dialog
                open={addDialog.open}
                onClose={handleCloseAddDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {addDialog.title}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="名称"
                        fullWidth
                        variant="outlined"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderRadius: 2,
                                },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} sx={{ borderRadius: 2 }}>
                        取消
                    </Button>
                    <Button
                        onClick={handleAddItem}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            bgcolor: '#00e5ff',
                            color: 'black',
                            '&:hover': {
                                bgcolor: '#00b8cc',
                            },
                        }}
                    >
                        添加
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default MusicLibrary
