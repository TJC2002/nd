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
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Fade
} from '@mui/material'
import {
  Folder,
  CloudUploadOutlined,
  Description,
  PlayCircleFilled,
  ShareOutlined,
  Search,
  MoreVert,
  DeleteOutline,
  GridViewRounded,
  TableRowsRounded,
  FavoriteBorder,
  NavigateNext,
  Home,
  Sort,
  CheckCircle,
  CreateNewFolderOutlined,
  Image as ImageIcon,
  AudioFile,
  InsertDriveFile,
  Edit,
  Download,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material'
import { FcFolder, FcImageFile, FcAudioFile, FcVideoFile, FcDocument, FcFile } from 'react-icons/fc'
import { fileApi } from '../../services/api'
import { useUpload } from '../../context/UploadContext'
import VideoPlayer from '../../components/player/VideoPlayer' // Import VideoPlayer
import DocumentPreview from '../../components/preview/DocumentPreview'
import { ImagePreviewProvider, PreviewImage } from '../../components/preview/ImagePreview'
import ShareDialog from '../../components/share/ShareDialog'
import './FileManagement.css' // Ensure this file exists or styles are inline

// --- Helper Components & Styles ---

const GlassCard = ({ children, sx, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      background: theme => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.03)' 
        : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(16px)',
      border: '1px solid',
      borderColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.08)',
      borderRadius: 3, // Reduced radius (was 6)
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      ...sx
    }}
    {...props}
  >
    {children}
  </Paper>
)

import { useTheme } from '@mui/material/styles'

const FileManagement = () => {
  // --- State & Hooks ---
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setDialogOpen, setCurrentFolder } = useUpload()

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // 'name' | 'date' | 'size'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' | 'desc'
  
  // Dialogs
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  // Preview
  const [previewFile, setPreviewFile] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [docPreviewOpen, setDocPreviewOpen] = useState(false)
  const [docFile, setDocFile] = useState(null)

  // Menus
  const [anchorElSort, setAnchorElSort] = useState(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [activeFile, setActiveFile] = useState(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // --- Effects ---

  useEffect(() => {
    const folderId = searchParams.get('folderId')
    setCurrentFolderId(folderId ? parseInt(folderId) : null)
  }, [searchParams])

  useEffect(() => {
    loadFiles()
    updateBreadcrumbPath()
    setSelectedFiles(new Set()) // Clear selection on folder change
  }, [currentFolderId])

  // --- API Calls ---

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fileApi.getFiles(currentFolderId)
      if (response.code === 200 && response.data) {
        setFiles(response.data)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      showSnackbar('加载文件失败', 'error')
    } finally {
      setLoading(false)
    }
  }

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
      console.error('Failed to load path:', error)
    }
  }

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return
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
      showSnackbar('创建文件夹失败', 'error')
    }
  }

  const handleDelete = async () => {
    if (selectedFiles.size === 0) return
    // Simple confirmation - in a real app, use a Dialog
    if (!window.confirm(`确定要删除选中的 ${selectedFiles.size} 个项目吗?`)) return

    try {
      let successCount = 0
      for (const id of selectedFiles) {
        await fileApi.deleteFile(id)
        successCount++
      }
      showSnackbar(`成功删除 ${successCount} 个项目`)
      setSelectedFiles(new Set())
      loadFiles()
    } catch (error) {
      showSnackbar('部分文件删除失败', 'error')
    }
  }

  const handleBatchDownload = async () => {
    if (selectedFiles.size === 0) return

    try {
      let successCount = 0
      for (const id of selectedFiles) {
        const file = files.find(f => f.id === id)
        if (file && !file.isFolder) {
          const response = await fileApi.downloadFile(id)
          const url = window.URL.createObjectURL(new Blob([response]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', file.fileName)
          document.body.appendChild(link)
          link.click()
          link.remove()
          successCount++
        }
      }
      showSnackbar(`成功下载 ${successCount} 个文件`)
    } catch (error) {
      showSnackbar('部分文件下载失败', 'error')
    }
  }

  // --- Event Handlers ---

  const handleFileClick = (file) => {
    if (file.isFolder) {
      navigate(`?folderId=${file.id}`)
    } else {
        const mime = file.mimeType || ''
        if (mime.startsWith('video/')) {
            setPreviewFile(file)
            setPreviewOpen(true)
        } else if (mime.startsWith('image/')) {
            // Image preview is handled by wrapping component, but we can trigger it or handle click
            // For this implementation, we'll let the wrapper handle the click or 
            // if clicking the card body, we might want to trigger it programmatically 
            // but react-photo-view works best with declarative wrapper.
            // Since we are using a card click, let's just toggle selection for now 
            // and let the icon/thumbnail click trigger preview if we wrap it.
            // BETTER: Let's assume clicking the file card opens preview for supported types.
            // For images, we can't easily trigger the provider programmatically without ref.
            // So we will modify the render to wrap the image icon/thumbnail with PreviewImage.
            
            // Actually, we can just do nothing here if we wrap the icon in the render loop.
            // But if we want the WHOLE card to trigger preview:
            // We would need a custom handler.
            // For now, let's keep image preview on the Icon click or specific action.
            // Or better: Use a simple state-based lightbox for images if we want to open on card click.
            // But since we installed react-photo-view, let's use it.
            
            // Let's implement Document preview for others
        } else if (
            mime.includes('pdf') || 
            mime.includes('word') || 
            mime.includes('presentation') || 
            mime.includes('spreadsheet') ||
            mime.includes('officedocument')
        ) {
            setDocFile(file)
            setDocPreviewOpen(true)
        } else {
            // Toggle selection for other files
            toggleSelection(file.id)
        }
    }
  }

  const toggleSelection = (id) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedFiles.size === files.length) setSelectedFiles(new Set())
    else setSelectedFiles(new Set(files.map(f => f.id)))
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleMenuClick = (event, file) => {
    event.stopPropagation() // Stop click from reaching the card
    event.preventDefault() // Prevent any default action
    setMenuAnchorEl(event.currentTarget)
    setActiveFile(file)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setActiveFile(null)
  }

  const handleShare = () => {
    setShareDialogOpen(true)
    setMenuAnchorEl(null) // Keep activeFile for dialog
  }

  const handleDownload = async () => {
    if (!activeFile) return
    try {
      const response = await fileApi.downloadFile(activeFile.id)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', activeFile.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      showSnackbar('Download failed', 'error')
    }
    handleMenuClose()
  }

  // --- Render Helpers ---

  const getFileIcon = (file) => {
    const size = 64;
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/files/${file.id}/download?token=${localStorage.getItem('token')}`;
    
    if (file.isFolder) {
        return <FcFolder size={size} />;
    }
    
    const mime = file.mimeType || '';
    
    if (mime.includes('image')) {
        return (
            <div onClick={(e) => e.stopPropagation()}>
                <PreviewImage src={downloadUrl} alt={file.fileName}>
                    <FcImageFile size={size} style={{ cursor: 'zoom-in' }} />
                </PreviewImage>
            </div>
        );
    } else if (mime.includes('audio')) {
        return <FcAudioFile size={size} />;
    } else if (mime.includes('video')) {
        return <FcVideoFile size={size} />;
    } else if (mime.includes('pdf')) {
        return <FcDocument size={size} />;
    } else {
        return <FcFile size={size} />;
    }
  }

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '--'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files
    .filter(f => f.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      // Always put folders first
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      
      let compare = 0
      if (sortBy === 'name') compare = a.fileName.localeCompare(b.fileName)
      else if (sortBy === 'size') compare = (a.fileSize || 0) - (b.fileSize || 0)
      else if (sortBy === 'date') compare = new Date(a.createdAt) - new Date(b.createdAt)
      
      return sortOrder === 'asc' ? compare : -compare
    })

  // --- Render ---

  return (
    <ImagePreviewProvider>
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 4 }}>
        {/* Row 1: Breadcrumbs & Search */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />}
            sx={{ '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
          >
            <Link
              underline="none"
              onClick={() => navigate('/')}
              sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  color: !currentFolderId ? 'text.primary' : 'text.secondary',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                  '&:hover': { color: 'text.primary' }
              }}
            >
              Files
            </Link>
            {breadcrumbPath.map((folder, index) => {
                const isLast = index === breadcrumbPath.length - 1
                return (
                    <Link
                        key={folder.id}
                        underline="none"
                        onClick={() => navigate(`?folderId=${folder.id}`)}
                        sx={{ 
                            cursor: 'pointer', 
                            color: isLast ? 'text.primary' : 'text.secondary',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            transition: 'color 0.2s',
                            '&:hover': { color: 'text.primary' }
                        }}
                    >
                        {folder.fileName}
                    </Link>
                )
            })}
          </Breadcrumbs>
        </Box>

        {/* Row 2: Actions & Tools */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlined />}
              onClick={() => { setCurrentFolder(currentFolderId); setDialogOpen(true); }}
              sx={{
                borderRadius: 4,
                px: 4,
                py: 1,
                fontSize: '1rem',
              }}
            >
              Upload
            </Button>
            <Button
              variant="outlined"
              startIcon={<CreateNewFolderOutlined />}
              onClick={() => setCreateFolderDialog(true)}
              sx={{
                borderRadius: 4,
                px: 3,
                color: 'text.primary',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                '&:hover': { 
                  borderColor: 'text.primary', 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }
              }}
            >
              New Folder
            </Button>

            {selectedFiles.size > 0 && (
                <Fade in={selectedFiles.size > 0}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Download />}
                            onClick={handleBatchDownload}
                            sx={{ borderRadius: 4, px: 3 }}
                        >
                            Download ({selectedFiles.size})
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutline />}
                            onClick={handleDelete}
                            sx={{ borderRadius: 4, px: 3 }}
                        >
                            Delete ({selectedFiles.size})
                        </Button>
                    </Box>
                </Fade>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <Button
                endIcon={<Sort />}
                onClick={(e) => setAnchorElSort(e.currentTarget)}
                sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.95rem' }}
             >
                Sort by: {sortBy} ({sortOrder.toUpperCase()})
             </Button>
            <Menu
                anchorEl={anchorElSort}
                open={Boolean(anchorElSort)}
                onClose={() => setAnchorElSort(null)}
                PaperProps={{
                    sx: { 
                      bgcolor: 'background.paper', 
                      color: 'text.primary', 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      minWidth: 150
                    }
                }}
            >
                <MenuItem onClick={() => { setSortBy('name'); setAnchorElSort(null); }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        Name {sortBy === 'name' && <CheckCircle fontSize="small" color="primary" />}
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => { setSortBy('date'); setAnchorElSort(null); }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        Date {sortBy === 'date' && <CheckCircle fontSize="small" color="primary" />}
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => { setSortBy('size'); setAnchorElSort(null); }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        Size {sortBy === 'size' && <CheckCircle fontSize="small" color="primary" />}
                    </Box>
                </MenuItem>
                <Box sx={{ my: 1, borderTop: '1px solid', borderColor: 'divider' }} />
                <MenuItem onClick={() => { setSortOrder('asc'); setAnchorElSort(null); }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowUpward fontSize="small" /> Ascending {sortOrder === 'asc' && <CheckCircle fontSize="small" color="primary" sx={{ ml: 'auto' }} />}
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => { setSortOrder('desc'); setAnchorElSort(null); }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowDownward fontSize="small" /> Descending {sortOrder === 'desc' && <CheckCircle fontSize="small" color="primary" sx={{ ml: 'auto' }} />}
                    </Box>
                </MenuItem>
            </Menu>

            <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 3, p: 0.5, display: 'flex' }}>
                <IconButton 
                    size="small" 
                    onClick={() => setViewMode('grid')}
                    sx={{ 
                        color: viewMode === 'grid' ? 'text.primary' : 'text.secondary',
                        bgcolor: viewMode === 'grid' ? 'background.paper' : 'transparent',
                        borderRadius: 2.5,
                        boxShadow: viewMode === 'grid' ? 1 : 0,
                        '&:hover': { bgcolor: viewMode === 'grid' ? 'background.paper' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    }}
                >
                    <GridViewRounded fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={() => setViewMode('list')}
                    sx={{ 
                        color: viewMode === 'list' ? 'text.primary' : 'text.secondary',
                        bgcolor: viewMode === 'list' ? 'background.paper' : 'transparent',
                        borderRadius: 2.5,
                        boxShadow: viewMode === 'list' ? 1 : 0,
                        '&:hover': { bgcolor: viewMode === 'list' ? 'background.paper' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    }}
                >
                    <TableRowsRounded fontSize="small" />
                </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* --- CONTENT SECTION --- */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
        {loading && <LinearProgress sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />}
        
        {files.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
                <Folder sx={{ fontSize: 80, color: 'text.disabled' }} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>This folder is empty</Typography>
            </Box>
        ) : (
            <>
                {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                        {filteredFiles.map((file) => {
                            const isSelected = selectedFiles.has(file.id)
                            
                            // Define the hover content
                            const hoverContent = (
                                <Box sx={{ p: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, wordBreak: 'break-all' }}>
                                        {file.fileName}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                Type: {file.isFolder ? 'Folder' : file.mimeType?.split('/')[1] || 'Unknown'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                Size: {formatSize(file.fileSize)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                Date: {file.createdAt?.split('T')[0]}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )

                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={file.id}>
                                    <Tooltip 
                                        title={hoverContent} 
                                        placement="top" 
                                        arrow 
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
                                                    color: 'text.primary',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    boxShadow: theme.shadows[8],
                                                    maxWidth: 300
                                                }
                                            },
                                            arrow: {
                                                sx: {
                                                    color: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
                                                    '&::before': {
                                                        border: '1px solid', 
                                                        borderColor: 'divider'
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                    <GlassCard
                                        sx={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            height: { xs: 100, sm: 110, md: 120 },
                                            border: isSelected ? '2px solid #2E86DE' : '1px solid',
                                            borderColor: isSelected ? '#2E86DE' : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)'),
                                            boxShadow: isSelected ? '0 0 20px rgba(46, 134, 222, 0.3)' : 'none',
                                            background: isSelected 
                                                ? 'rgba(46, 134, 222, 0.05)' 
                                                : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255,255,255,0.6)'),
                                            display: 'flex', // Enable flex layout
                                            flexDirection: 'row', // Horizontal layout
                                            alignItems: 'center',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                                '& .file-actions': { opacity: 1 },
                                                '& .checkbox-area': { opacity: 1 } // Show checkbox on hover
                                            }
                                        }}
                                        onClick={(e) => {
                                           handleFileClick(file) 
                                        }}
                                    >
                                        <Box 
                                            className="checkbox-area"
                                            sx={{ 
                                                position: 'absolute', 
                                                top: 8, 
                                                left: 8, 
                                                zIndex: 3,
                                                opacity: isSelected ? 1 : 0, // Visible if selected or hovered
                                                transition: 'opacity 0.2s'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox 
                                                checked={isSelected}
                                                onChange={() => toggleSelection(file.id)}
                                                size="small"
                                                icon={<Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: 'text.secondary' }} />}
                                                checkedIcon={<CheckCircle sx={{ color: '#2E86DE', fontSize: 22 }} />}
                                            />
                                        </Box>
                                        
                                        <Box className="file-actions" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.2s', zIndex: 3 }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleMenuClick(e, file)}
                                                sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'black' } }}
                                            >
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Left Side: Icon */}
                                        <Box sx={{ 
                                            width: '100px', // Slightly reduced back to 100 to give text more room
                                            height: '100%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                                            flexShrink: 0
                                        }}>
                                            <Box sx={{ transform: 'scale(1.2)' }}> 
                                                {getFileIcon(file)}
                                            </Box>
                                        </Box>
                                        
                                        {/* Right Side: Info */}
                                        <Box sx={{ 
                                            flex: 1, 
                                            p: 2, 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            minWidth: 0 // Crucial for text truncation in flex items
                                        }}>
                                             {/* Basic Info */}
                                            <Box className="file-info" sx={{ width: '100%' }}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        color: 'text.primary', 
                                                        fontWeight: 600, 
                                                        mb: 0.5,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {file.fileName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                        {file.createdAt?.split('T')[0]}
                                                    </Typography>
                                                    {!file.isFolder && (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                            {formatSize(file.fileSize)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </GlassCard>
                                    </Tooltip>
                                </Grid>
                            )
                        })}
                    </Grid>
                ) : (
                    <TableContainer component={GlassCard} sx={{ borderRadius: 4 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            indeterminate={selectedFiles.size > 0 && selectedFiles.size < files.length}
                                            checked={files.length > 0 && selectedFiles.size === files.length}
                                            onChange={selectAll}
                                            sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#00e5ff' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>Size</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>Date</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFiles.map((file) => {
                                    const isSelected = selectedFiles.has(file.id)
                                    return (
                                        <TableRow 
                                            key={file.id}
                                            hover
                                            selected={isSelected}
                                            onClick={() => handleFileClick(file)}
                                            sx={{ 
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05) !important' : 'rgba(0,0,0,0.02) !important' },
                                                '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.08) !important' }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onChange={(e) => { e.stopPropagation(); toggleSelection(file.id); }}
                                                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#00e5ff' } }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {file.isFolder ? <Folder sx={{ color: '#FFD700' }} /> : <InsertDriveFile sx={{ color: '#00e5ff' }} />}
                                                    <Typography sx={{ color: 'text.primary' }}>{file.fileName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {file.isFolder ? '-' : formatSize(file.fileSize)}
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary' }}>
                                                {file.createdAt?.split('T')[0]}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleMenuClick(e, file)}
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </>
        )}
      </Box>

      {/* --- CONTEXT MENU --- */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
            sx: {
                minWidth: 180,
                borderRadius: 3,
                boxShadow: theme.shadows[8],
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                border: '1px solid',
                borderColor: 'divider'
            }
        }}
      >
        <MenuItem onClick={handleShare}>
            <ShareOutlined fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Share</Typography>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
            <Download fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Download</Typography>
        </MenuItem>
        {/* Placeholder for Rename */}
        <MenuItem disabled>
            <Edit fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2">Rename</Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); /* Add logic */ }} sx={{ color: 'error.main' }}>
            <DeleteOutline fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

      <ShareDialog 
        open={shareDialogOpen}
        onClose={() => { setShareDialogOpen(false); setActiveFile(null); }}
        file={activeFile}
      />

      {/* --- DIALOGS --- */}
      <Dialog 
        open={createFolderDialog} 
        onClose={() => setCreateFolderDialog(false)}
        PaperProps={{
            style: {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: 'text.primary',
                minWidth: '400px'
            }
        }}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>Create New Folder</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Folder Name"
                fullWidth
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                sx={{
                    mt: 1,
                    '& .MuiInputLabel-root': { color: 'text.secondary' },
                    '& .MuiOutlinedInput-root': {
                        color: 'text.primary',
                        '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' },
                        '&:hover fieldset': { borderColor: 'text.primary' },
                        '&.Mui-focused fieldset': { borderColor: '#00e5ff' }
                    }
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setCreateFolderDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button onClick={handleCreateFolder} variant="contained" sx={{ bgcolor: '#00e5ff', color: 'black', '&:hover': { bgcolor: '#00b8cc' } }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>

      {/* --- PREVIEW MODAL --- */}
      <Dialog
        fullScreen
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        PaperProps={{
            sx: {
                bgcolor: 'black',
                backgroundImage: 'none'
            }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header/Close Button */}
             <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                zIndex: 10, 
                p: 2, 
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{ color: 'white', ml: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {previewFile?.fileName}
                </Typography>
                <Button 
                    onClick={() => setPreviewOpen(false)}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                    Close
                </Button>
            </Box>

            {/* Video Player Container */}
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 0, md: 4 } }}>
                 {previewFile && (
                    <Box sx={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9' }}>
                        <VideoPlayer 
                            src={`${import.meta.env.VITE_API_BASE_URL || ''}/api/files/${previewFile.id}/download?token=${localStorage.getItem('token')}`}
                            poster={null} // Or fetch a thumbnail if available
                        />
                    </Box>
                 )}
            </Box>
        </Box>
      </Dialog>
      <DocumentPreview 
        open={docPreviewOpen}
        onClose={() => setDocPreviewOpen(false)}
        file={docFile}
        downloadUrl={docFile ? `${import.meta.env.VITE_API_BASE_URL || ''}/api/files/${docFile.id}/download?token=${localStorage.getItem('token')}` : ''}
      />
    </Box>
    </ImagePreviewProvider>
  )
}

export default FileManagement
