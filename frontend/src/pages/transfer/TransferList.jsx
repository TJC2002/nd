import React, { useState } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton
} from '@mui/material'
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  Pause,
  PlayArrow,
  Close
} from '@mui/icons-material'

const TransferList = () => {
  const [tabValue, setTabValue] = useState(0)

  // Placeholder data for upload tasks
  const uploadTasks = [
    { id: 1, name: 'Project_Backup.zip', size: '1.2 GB', progress: 45, speed: '2.5 MB/s', status: 'uploading' },
    { id: 2, name: 'Photos_2024.rar', size: '500 MB', progress: 100, speed: '-', status: 'completed' },
  ]

  // Placeholder data for download tasks
  const downloadTasks = [
    { id: 1, name: 'Movie_4K.mp4', size: '4.5 GB', progress: 12, speed: '5.2 MB/s', status: 'downloading' },
    { id: 2, name: 'Document_v2.pdf', size: '12 MB', progress: 0, speed: '-', status: 'paused' },
  ]

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const renderStatus = (status) => {
    switch(status) {
      case 'uploading':
      case 'downloading':
        return <Typography variant="caption" color="primary">In Progress</Typography>
      case 'completed':
        return <Typography variant="caption" color="success.main">Completed</Typography>
      case 'paused':
        return <Typography variant="caption" color="warning.main">Paused</Typography>
      default:
        return <Typography variant="caption" color="text.secondary">{status}</Typography>
    }
  }

  const TaskTable = ({ tasks, type }) => (
    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Size</TableCell>
            <TableCell sx={{ minWidth: 200 }}>Progress</TableCell>
            <TableCell>Speed</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {type === 'upload' ? <CloudUploadOutlined fontSize="small" color="action" /> : <CloudDownloadOutlined fontSize="small" color="action" />}
                  <Typography variant="body2">{task.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{task.size}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={task.progress} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(task.progress)}%`}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{task.speed}</TableCell>
              <TableCell>{renderStatus(task.status)}</TableCell>
              <TableCell align="right">
                <IconButton size="small">
                  {task.status === 'paused' ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                </IconButton>
                <IconButton size="small" color="error">
                  <Close fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Typography variant="body1" color="text.secondary">No {type} tasks</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Transfer Manager</Typography>
      
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChange} 
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Uploading" icon={<CloudUploadOutlined />} iconPosition="start" />
          <Tab label="Downloading" icon={<CloudDownloadOutlined />} iconPosition="start" />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1 }}>
        <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && <TaskTable tasks={uploadTasks} type="upload" />}
        </Box>
        <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && <TaskTable tasks={downloadTasks} type="download" />}
        </Box>
      </Box>
    </Box>
  )
}

export default TransferList
