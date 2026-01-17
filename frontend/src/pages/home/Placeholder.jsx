import React from 'react'
import { Box, Typography } from '@mui/material'
import { Folder as FolderIcon } from '@mui/icons-material'
import './Placeholder.css'

const Placeholder = ({ title, icon: Icon, description }) => {
  return (
    <Box className="placeholder">
      <Box className="placeholder-icon">{Icon}</Box>
      <Typography variant="h6" className="placeholder-title">
        {title}
      </Typography>
      <Typography variant="body1" className="placeholder-description">
        {description}
      </Typography>
    </Box>
  )
}

export default Placeholder
