import React, { useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
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
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Checkbox,
  CardMedia,
  Breadcrumbs,
  Link,
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
  FavoriteBorder,
  Favorite,
} from '@mui/icons-material'
import { fileApi, storageApi } from '../../services/api'
import { useUpload } from '../../context/UploadContext'
import './FileManagement.css'

const FileManagement = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { setDialogOpen, setCurrentFolder } = useUpload()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [sortBy, setSortBy] = useState('name')
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const folderId = searchParams.get('folderId')
    console.log('folderId from URL:', folderId)
    if (folderId) {
      setCurrentFolderId(parseInt(folderId))
    } else {
      setCurrentFolderId(null)
    }
  }, [searchParams])

  useEffect(() => {
    console.log('currentFolderId changed:', currentFolderId)
    loadFiles()
    updateBreadcrumbPath()
  }, [currentFolderId])

  const updateBreadcrumbPath = async () => {
    if (!currentFolderId) {
      setBreadcrumbPath([])
      return
    }

    try {
      const response = await fileApi.getFolderPath(currentFolderId)
      if (response.code === 200 && response.data) {
        setBreadcrumbPath(response.data)
      }
    } catch (error) {
      console.error('获取文件夹路径失败:', error)
    }
  }

  const loadFiles = async () => {
    try {
      setLoading(true)
      console.log('Loading files for folderId:', currentFolderId)
      const response = await fileApi.getFiles(currentFolderId)
      console.log('API response:', response)
      if (response.code === 200 && response.data) {
        console.log('Setting files:', response.data)
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
    setCurrentFolder(currentFolderId)
    setDialogOpen(true)
  }

  const handleCreateFolder = () => {
    setCreateFolderDialog(true)
    setFolderName('')
  }

  const handleCreateFolderConfirm = async () => {
    if (folderName.trim()) {
      try {
        const response = await fileApi.createFolder(folderName.trim(), currentFolderId)
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

  const handleFolderClick = (file) => {
    if (file.isFolder) {
      const params = new URLSearchParams(searchParams)
      params.set('folderId', file.id)
      navigate(`?${params.toString()}`)
    }
  }

  const handleBack = () => {
    navigate('/')
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

  const getFileIcon = (isFolder, mimeType) => {
    if (isFolder) {
      return <Folder />
    }
    const iconMap = {
      'application/pdf': <Description />,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <Description />,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <Description />,
      'image/jpeg': <Description />,
      'image/png': <Description />,
      'video/mp4': <PlayCircleFilled />,
      'application/zip': <Description />,
    }
    return iconMap[mimeType] || <Description />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    if (days < 30) return `${Math.floor(days / 7)} 周前`
    if (days < 365) return `${Math.floor(days / 30)} 月前`
    return `${Math.floor(days / 365)} 年前`
  }

  const filteredFiles = files.filter(file =>
    file.fileName && file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return a.fileName.localeCompare(b.fileName)
    } else if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy === 'size') {
      return parseFloat(a.fileSize) - parseFloat(b.fileSize)
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentFolderId && (
            <IconButton onClick={handleBack}>
              <Folder />
            </IconButton>
          )}
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
            <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>
              全部文件
            </Link>
            {breadcrumbPath.map((folder, index) => (
              <Link
                key={folder.id}
                color="inherit"
                href={`?folderId=${folder.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`?folderId=${folder.id}`)
                }}
              >
                {folder.fileName}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
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
          {selectedFiles.size > 0 && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutline />}
                onClick={() => handleDelete([...selectedFiles][0])}
              >
                删除 ({selectedFiles.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareOutlined />}
              >
                分享 ({selectedFiles.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Favorite />}
                onClick={() => handleToggleFavorite([...selectedFiles][0]?.id)}
              >
                收藏 ({selectedFiles.size})
              </Button>
            </>
          )}
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
                    <Card
                      className={`file-card ${selectedFiles.has(file.id) ? 'selected' : ''}`}
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={selectedFiles.has(file.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleFileClick(file)
                              }}
                              size="small"
                            />
                            <Avatar 
                              sx={{ bgcolor: file.isFolder ? 'primary.main' : 'secondary.main', cursor: file.isFolder ? 'pointer' : 'default' }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (file.isFolder) {
                                  handleFolderClick(file)
                                }
                              }}
                            >
                              {getFileIcon(file.isFolder, file.mimeType)}
                            </Avatar>
                          </Box>
                        }
                        title={file.fileName}
                        subheader={formatFileSize(file.fileSize)}
                        titleTypographyProps={{
                          sx: { color: 'text.primary' }
                        }}
                        subheaderTypographyProps={{
                          sx: { color: 'text.secondary' }
                        }}
                        action={
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <MoreVertOutlined />
                          </IconButton>
                        }
                      />
                      <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 0 }}>
                        {!file.isFolder ? (
                          <Box sx={{ width: '100%', height: 150, position: 'relative', overflow: 'hidden', borderRadius: 1, cursor: 'pointer' }}>
                            <img 
                              src={`http://localhost:8080/files/${file.id}/cover`} 
                              alt={file.fileName}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                backgroundColor: '#f5f5f5'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextElementSibling.style.display = 'flex'
                              }}
                            />
                            <Box 
                              style={{ 
                                display: 'none',
                                width: '100%', 
                                height: '100%', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5'
                              }}
                            >
                              {getFileIcon(file.isFolder, file.mimeType)}
                            </Box>
                          </Box>
                        ) : (
                          <Box 
                            sx={{ fontSize: 64, color: 'text.secondary', cursor: file.isFolder ? 'pointer' : 'default' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (file.isFolder) {
                                handleFolderClick(file)
                              }
                            }}
                          >
                            {getFileIcon(file.isFolder, file.mimeType)}
                          </Box>
                        )}
                      </CardContent>
                      <CardActions disableSpacing>
                        <IconButton aria-label="收藏" size="small">
                          <FavoriteBorder />
                        </IconButton>
                        <IconButton aria-label="分享" size="small">
                          <ShareOutlined />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box className="file-list-container">
                <Box className="file-list-header">
                  <Box sx={{ flex: 0.5 }}></Box>
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
                      onClick={(e) => {
                        if (!file.isFolder) {
                          handleFileClick(file)
                        }
                      }}
                      sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}
                    >
                      <Box sx={{ flex: 0.5 }}>
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleFileClick(file)
                          }}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box 
                          sx={{ fontSize: 32, color: 'text.secondary', cursor: file.isFolder ? 'pointer' : 'default' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (file.isFolder) {
                              handleFolderClick(file)
                            }
                          }}
                        >
                          {getFileIcon(file.isFolder, file.mimeType)}
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ fontSize: '0.875rem', cursor: file.isFolder ? 'pointer' : 'default' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (file.isFolder) {
                              handleFolderClick(file)
                            }
                          }}
                        >
                          {file.fileName}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>{formatFileSize(file.fileSize)}</Typography>
                      <Typography variant="body2" sx={{ flex: 2, fontSize: '0.875rem' }}>{formatDate(file.createdAt)}</Typography>
                      <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                        <IconButton edge="end" size="small" sx={{ padding: '4px' }}>
                          <FavoriteBorder sx={{ fontSize: '1.25rem' }} />
                        </IconButton>
                        <IconButton edge="end" size="small" sx={{ padding: '4px' }}>
                          <ShareOutlined sx={{ fontSize: '1.25rem' }} />
                        </IconButton>
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
