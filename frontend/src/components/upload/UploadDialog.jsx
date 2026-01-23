import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  CloudUploadOutlined,
  InsertDriveFile,
  Folder,
  DeleteOutline,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useUpload } from '../../context/UploadContext'
import uploadService from '../../services/uploadService'
import './UploadDialog.css'

const UploadDialog = () => {
  const { dialogOpen, setDialogOpen, currentFolderId, addTask, updateTask } = useUpload()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
      speed: 0,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    multiple: true,
  })

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    for (const fileItem of files) {
      const taskId = fileItem.id

      const task = {
        id: taskId,
        fileName: fileItem.file.name,
        fileSize: fileItem.file.size,
        status: 'pending',
        progress: 0,
        speed: 0,
        createdAt: new Date().toISOString(),
      }

      addTask(task)

      try {
        updateTask(taskId, { status: 'hashing', progress: 0, speed: 0 })

        const result = await uploadService.uploadFile(
          fileItem.file,
          currentFolderId,
          (progress) => {
            updateTask(taskId, {
              status: progress.status,
              progress: progress.progress,
              speed: progress.speed,
            })
          },
          (speed) => {
            updateTask(taskId, { speed })
          }
        )

        updateTask(taskId, {
          status: 'completed',
          progress: 100,
          speed: 0,
          fileId: result.fileId,
          isInstant: result.isInstant,
        })
      } catch (error) {
        console.error('上传失败:', error)
        updateTask(taskId, {
          status: 'failed',
          progress: 0,
          speed: 0,
          error: error.message || '上传失败',
        })
      }
    }

    setDialogOpen(false)
    setFiles([])
    setUploading(false)
  }

  const handleClose = () => {
    if (!uploading) {
      setFiles([])
      setDialogOpen(false)
    }
  }

  const formatFileSize = (bytes) => {
    return uploadService.formatFileSize(bytes)
  }

  const formatSpeed = (bytesPerSecond) => {
    return uploadService.formatSpeed(bytesPerSecond)
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
    }
    return statusMap[status] || status
  }

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadOutlined />
          <Typography variant="h6">上传文件</Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={uploading} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          {...getRootProps()}
          className={`upload-dropzone ${isDragActive ? 'active' : ''}`}
          onClick={() => document.getElementById('file-input').click()}
          sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'primary.main',
              }
          }}
        >
          <input {...getInputProps()} id="file-input" />
          <CloudUploadOutlined sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            {isDragActive ? '释放文件以上传' : '拖拽文件到此处，或点击选择文件'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            支持分片上传、秒传、断点续传
          </Typography>
        </Box>

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'white' }}>
                已选择 {files.length} 个文件
              </Typography>
              <Button
                size="small"
                onClick={() => setFiles([])}
                disabled={uploading}
                sx={{ color: 'rgba(255, 255, 255, 0.6)', '&:hover': { color: 'white' } }}
              >
                清空列表
              </Button>
            </Box>
            <List className="upload-file-list">
              {files.map((fileItem) => (
                <ListItem key={fileItem.id} className="upload-file-item" sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <ListItemIcon>
                    {fileItem.file.type?.startsWith('image/') ? (
                      <InsertDriveFile sx={{ color: 'primary.main' }} />
                    ) : (
                      <InsertDriveFile sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ color: 'white' }}>{fileItem.file.name}</Typography>}
                    secondary={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>{formatFileSize(fileItem.file.size)}</Typography>}
                  />
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(fileItem.id)}
                    disabled={uploading}
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: 'error.main' } }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={uploading} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          取消
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={files.length === 0 || uploading}
          startIcon={<CloudUploadOutlined />}
        >
          {uploading ? '上传中...' : '开始上传'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadDialog
