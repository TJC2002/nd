import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Folder,
  CloudUploadOutlined,
  Description,
  PlayCircleFilled,
  ShareOutlined,
  SearchOutlined,
  Visibility,
  VisibilityOff,
  MoreVertOutlined,
  DeleteOutline,
  StarOutline,
  StarBorderOutlined,
  ViewList,
  GridViewOutlined,
} from '@mui/icons-material'
import { fileApi, storageApi } from '../../services/api'
import './FileManagement.css'

const FileManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [sortBy, setSortBy] = useState('name')
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    loadFiles()
  }, [currentFolderId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fileApi.getFiles(currentFolderId)
      if (response.code === 200 && response.data) {
        setFiles(response.data)
      }
    } catch (error) {
      console.error('加载文件失败:', error)
      showSnackbar('加载文件失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleSearch = (event) => {
    setSearchQuery(event.target.value)
  }

  const handleFileClick = (file) => {
    if (selectedFiles.has(file.id)) {
      setSelectedFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(file.id)
        return newSet
      })
    } else {
      setSelectedFiles(prev => new Set(prev).add(file.id))
    }
  }

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)))
    }
  }

  const handleUpload = () => {
    console.log('上传文件')
  }

  const handleCreateFolder = () => {
    setCreateFolderDialog(true)
    setFolderName('')
  }

  const handleCreateFolderConfirm = async () => {
    if (folderName.trim()) {
      try {
        const response = await storageApi.createNode(folderName.trim(), currentFolderId)
        if (response.code === 200) {
          showSnackbar('文件夹创建成功')
          setCreateFolderDialog(false)
          setFolderName('')
          loadFiles()
        } else {
          showSnackbar(response.message || '创建失败', 'error')
        }
      } catch (error) {
        console.error('创建文件夹失败:', error)
        showSnackbar('创建文件夹失败', 'error')
      }
    }
  }

  const handleCreateFolderCancel = () => {
    setCreateFolderDialog(false)
    setFolderName('')
  }

  const handleDelete = async (fileId) => {
    try {
      const response = await fileApi.deleteFile(fileId)
      if (response.code === 200) {
        showSnackbar('删除成功')
        setSelectedFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
        loadFiles()
      } else {
        showSnackbar(response.message || '删除失败', 'error')
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      showSnackbar('删除文件失败', 'error')
    }
  }

  const handleToggleFavorite = (fileId) => {
    console.log('切换收藏:', fileId)
  }

  const handleSort = (field) => {
    setSortBy(field)
  }

  const getFileIcon = (type) => {
    const iconMap = {
      folder: <Folder />,
      pdf: <Description />,
      docx: <Description />,
      xlsx: <Description />,
      png: <Description />,
      jpg: <Description />,
      mp4: <PlayCircleFilled />,
      zip: <Description />,
    }
    return iconMap[type] || <Folder />
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy === 'size') {
      return parseFloat(a.size) - parseFloat(b.size)
    }
    return 0
  })

  return (
    <Box className="file-management">
      {loading && (
        <Box className="loading-container">
          <LinearProgress />
        </Box>
      )}
      <Box className="top-bar">
        <Box className="top-bar-left">
          <Button
            variant="outlined"
            startIcon={<Folder />}
            onClick={handleCreateFolder}
          >
            新建文件夹
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadOutlined />}
            onClick={handleUpload}
          >
            上传文件
          </Button>
        </Box>
        <Box className="top-bar-right">
          <Box sx={{ display: 'flex', gap: '4px', mr: 2 }}>
            <Tooltip title="网格视图">
              <IconButton
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <GridViewOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="列表视图">
              <IconButton
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <Chip
            label={`已选 ${selectedFiles.size}`}
            color="primary"
            variant="outlined"
            onClick={handleSelectAll}
          />
        </Box>
      </Box>

      <Box className="content-area">
        {files.length === 0 ? (
          <Box className="empty-state">
            <Folder sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6">暂无文件</Typography>
          </Box>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={2} className="file-grid" sx={{ margin: 0, width: '100%' }}>
                {sortedFiles.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                    <Paper
                      className={`file-card ${selectedFiles.has(file.id) ? 'selected' : ''}`}
                      onClick={() => handleFileClick(file)}
                      elevation={0}
                    >
                      <Box className={`file-icon ${file.type === 'folder' ? 'folder-icon' : ''}`}>
                        {getFileIcon(file.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" className="file-name">
                          {file.name}
                        </Typography>
                        <Typography variant="body2" className="file-meta">
                          {file.size}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box className="file-list-container">
                <Box className="file-list-header">
                  <Typography variant="body2" sx={{ flex: 3, fontWeight: 'bold', fontSize: '0.875rem' }}>名称</Typography>
                  <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', fontSize: '0.875rem' }}>大小</Typography>
                  <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold', fontSize: '0.875rem' }}>修改日期</Typography>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', fontSize: '0.875rem' }}>操作</Typography>
                </Box>
                <List className="file-list">
                  {sortedFiles.map((file) => (
                    <ListItem
                      key={file.id}
                      className={`file-item ${selectedFiles.has(file.id) ? 'selected' : ''}`}
                      onClick={() => handleFileClick(file)}
                      sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}
                    >
                      <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box className={`file-icon ${file.type === 'folder' ? 'folder-icon' : ''}`}>
                          {getFileIcon(file.type)}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{file.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>{file.size}</Typography>
                      <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>{file.date}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <IconButton edge="end" size="small" sx={{ padding: '4px' }}>
                          <MoreVertOutlined sx={{ fontSize: '1.25rem' }} />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}

        {selectedFiles.size > 0 && (
          <Box className="bulk-actions">
            <Button
              variant="outlined"
              startIcon={<DeleteOutline />}
              onClick={() => handleDelete([...selectedFiles][0])}
            >
              删除
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareOutlined />}
            >
              分享
            </Button>
            <Button
              variant="outlined"
              startIcon={selectedFiles.has([...selectedFiles][0]?.id) ? <StarBorderOutlined /> : <StarOutline />}
              onClick={() => handleToggleFavorite([...selectedFiles][0]?.id)}
            >
              {selectedFiles.has([...selectedFiles][0]?.id) ? '取消收藏' : '收藏'}
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={createFolderDialog} onClose={handleCreateFolderCancel} maxWidth="sm" fullWidth>
        <DialogTitle>新建文件夹</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文件夹名称"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="请输入文件夹名称"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateFolderCancel}>取消</Button>
          <Button onClick={handleCreateFolderConfirm} variant="contained" disabled={!folderName.trim()}>
            创建
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FileManagement
