import React from 'react'
import {
  Popover,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Paper,
  Button,
  Tooltip,
} from '@mui/material'
import {
  CloudUploadOutlined,
  Close as CloseIcon,
  DeleteOutline,
  RefreshOutlined,
  CheckCircleOutlined,
  ErrorOutline,
  ScheduleOutlined,
} from '@mui/icons-material'
import { useUpload } from '../../context/UploadContext'
import uploadService from '../../services/uploadService'
import './UploadPopover.css'

const UploadPopover = ({ anchorEl, onClose }) => {
  const {
    tasks,
    getActiveTasks,
    getCompletedTasks,
    getFailedTasks,
    removeTask,
    clearCompletedTasks,
  } = useUpload()

  const activeTasks = getActiveTasks()
  const completedTasks = getCompletedTasks()
  const failedTasks = getFailedTasks()

  const handleRemoveTask = (taskId) => {
    removeTask(taskId)
  }

  const handleClearCompleted = () => {
    clearCompletedTasks()
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
        return 'primary'
      default:
        return 'default'
    }
  }

  const renderTaskRow = (task) => (
    <TableRow key={task.id} className="upload-task-row">
      <TableCell className="upload-task-cell">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon(task.status)}
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {task.fileName}
          </Typography>
        </Box>
      </TableCell>
      <TableCell className="upload-task-cell">
        <Typography variant="body2">{formatFileSize(task.fileSize)}</Typography>
      </TableCell>
      <TableCell className="upload-task-cell">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
          <Typography variant="caption" sx={{ minWidth: 35 }}>
            {task.progress}%
          </Typography>
        </Box>
      </TableCell>
      <TableCell className="upload-task-cell">
        <Typography variant="body2">
          {task.speed > 0 ? formatSpeed(task.speed) : '-'}
        </Typography>
      </TableCell>
      <TableCell className="upload-task-cell">
        <Chip
          label={task.isInstant ? '秒传' : getStatusText(task.status)}
          size="small"
          color={task.isInstant ? 'secondary' : getStatusColor(task.status)}
          variant="outlined"
        />
      </TableCell>
      <TableCell className="upload-task-cell" align="right">
        <Tooltip title="删除">
          <IconButton
            size="small"
            onClick={() => handleRemoveTask(task.id)}
            disabled={task.status === 'uploading'}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )

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
    }
    return statusMap[status] || status
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 600,
          maxHeight: 500,
          borderRadius: 2,
        },
      }}
    >
      <Box className="upload-popover-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadOutlined />
          <Typography variant="h6">上传任务</Typography>
          <Chip
            label={`${activeTasks.length} 进行中`}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
          {completedTasks.length > 0 && (
            <Chip
              label={`${completedTasks.length} 已完成`}
              size="small"
              color="success"
            />
          )}
          {failedTasks.length > 0 && (
            <Chip
              label={`${failedTasks.length} 失败`}
              size="small"
              color="error"
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box className="upload-popover-content">
        {tasks.length === 0 ? (
          <Box className="upload-empty-state">
            <CloudUploadOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              暂无上传任务
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="upload-table-header">文件名</TableCell>
                  <TableCell className="upload-table-header">大小</TableCell>
                  <TableCell className="upload-table-header">进度</TableCell>
                  <TableCell className="upload-table-header">速度</TableCell>
                  <TableCell className="upload-table-header">状态</TableCell>
                  <TableCell className="upload-table-header" align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeTasks.map(renderTaskRow)}
                {completedTasks.map(renderTaskRow)}
                {failedTasks.map(renderTaskRow)}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {tasks.length > 0 && (
        <Box className="upload-popover-footer">
          <Button
            size="small"
            onClick={handleClearCompleted}
            disabled={completedTasks.length === 0}
            startIcon={<RefreshOutlined />}
          >
            清除已完成
          </Button>
        </Box>
      )}
    </Popover>
  )
}

export default UploadPopover
