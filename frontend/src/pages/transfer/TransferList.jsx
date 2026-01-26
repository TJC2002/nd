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
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  Pause,
  PlayArrow,
  Close,
  DeleteOutline,
  CheckCircleOutlined,
  ErrorOutline,
  ScheduleOutlined,
} from '@mui/icons-material'
import { useUpload } from '../../context/UploadContext'
import uploadService from '../../services/uploadService'

const TransferList = () => {
  const [tabValue, setTabValue] = useState(0)
  const {
    tasks,
    getActiveTasks,
    getCompletedTasks,
    getFailedTasks,
    removeTask,
  } = useUpload()

  const activeTasks = getActiveTasks()
  const completedTasks = getCompletedTasks()
  const failedTasks = getFailedTasks()

  const allUploadTasks = [...activeTasks, ...completedTasks, ...failedTasks]

  // Placeholder data for download tasks
  const downloadTasks = [
    { id: 1, name: 'Movie_4K.mp4', size: '4.5 GB', progress: 12, speed: '5.2 MB/s', status: 'downloading' },
    { id: 2, name: 'Document_v2.pdf', size: '12 MB', progress: 0, speed: '-', status: 'paused' },
  ]

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const formatFileSize = (bytes) => {
    return uploadService.formatFileSize(bytes)
  }

  const formatSpeed = (bytesPerSecond) => {
    return uploadService.formatSpeed(bytesPerSecond)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined sx={{ color: 'success.main', fontSize: 16 }} />
      case 'failed':
        return <ErrorOutline sx={{ color: 'error.main', fontSize: 16 }} />
      case 'uploading':
        return <CloudUploadOutlined sx={{ color: 'primary.main', fontSize: 16 }} />
      case 'downloading':
        return <CloudDownloadOutlined sx={{ color: 'primary.main', fontSize: 16 }} />
      default:
        return <ScheduleOutlined sx={{ color: 'text.secondary', fontSize: 16 }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      case 'uploading':
      case 'downloading':
        return 'primary'
      case 'paused':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: '等待中',
      hashing: '计算哈希',
      checking: '检查秒传',
      initializing: '初始化',
      uploading: '上传中',
      merging: '合并分片',
      completed: '已完成',
      failed: '失败',
      downloading: '下载中',
      paused: '已暂停',
    }
    return statusMap[status] || status
  }

  const renderUploadStatus = (task) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon(task.status)}
        <Chip
          label={task.isInstant ? '秒传' : getStatusText(task.status)}
          size="small"
          color={task.isInstant ? 'secondary' : getStatusColor(task.status)}
          variant="outlined"
        />
      </Box>
    )
  }

  const UploadTaskTable = () => (
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
          {allUploadTasks.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getStatusIcon(task.status)}
                  <Typography variant="body2">{task.fileName}</Typography>
                </Box>
              </TableCell>
              <TableCell>{formatFileSize(task.fileSize)}</TableCell>
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
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {task.speed > 0 ? formatSpeed(task.speed) : '-'}
                </Typography>
              </TableCell>
              <TableCell>{renderUploadStatus(task)}</TableCell>
              <TableCell align="right">
                <Tooltip title="删除">
                  <IconButton
                    size="small"
                    onClick={() => removeTask(task.id)}
                    disabled={task.status === 'uploading'}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {allUploadTasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CloudUploadOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography variant="body1" color="text.secondary">暂无上传任务</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderDownloadStatus = (status) => {
    switch(status) {
      case 'downloading':
        return <Typography variant="caption" color="primary">下载中</Typography>
      case 'completed':
        return <Typography variant="caption" color="success.main">已完成</Typography>
      case 'paused':
        return <Typography variant="caption" color="warning.main">已暂停</Typography>
      default:
        return <Typography variant="caption" color="text.secondary">{status}</Typography>
    }
  }

  const DownloadTaskTable = () => (
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
          {downloadTasks.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudDownloadOutlined fontSize="small" color="action" />
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
              <TableCell>{renderDownloadStatus(task.status)}</TableCell>
              <TableCell align="right">
                <Tooltip title={task.status === 'paused' ? '继续' : '暂停'}>
                  <IconButton size="small">
                    {task.status === 'paused' ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton size="small" color="error">
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {downloadTasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CloudDownloadOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography variant="body1" color="text.secondary">暂无下载任务</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>传输管理</Typography>
      
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChange} 
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`上传 (${allUploadTasks.length})`} icon={<CloudUploadOutlined />} iconPosition="start" />
          <Tab label={`下载 (${downloadTasks.length})`} icon={<CloudDownloadOutlined />} iconPosition="start" />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1 }}>
        <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && <UploadTaskTable />}
        </Box>
        <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && <DownloadTaskTable />}
        </Box>
      </Box>
    </Box>
  )
}

export default TransferList
