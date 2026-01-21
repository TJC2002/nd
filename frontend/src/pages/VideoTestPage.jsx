import React from 'react'
import { Box } from '@mui/material'
import VideoPlayer from '../components/player/VideoPlayer'

const VideoTestPage = () => {
    // A sample public video URL for testing purposes
    const sampleVideo = "https://media-files.vidstack.io/720p.mp4";
    const samplePoster = "https://media-files.vidstack.io/poster.png";

    return (
        <Box sx={{ 
            width: '100vw', 
            height: '100vh', 
            bgcolor: 'black', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4
        }}>
            <Box sx={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9' }}>
                <VideoPlayer src={sampleVideo} poster={samplePoster} />
            </Box>
        </Box>
    )
}

export default VideoTestPage
