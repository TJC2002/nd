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
  InsertDriveFile
} from '@mui/icons-material'
import { FcFolder, FcImageFile, FcAudioFile, FcVideoFile, FcDocument, FcFile } from 'react-icons/fc'
import { fileApi } from '../../services/api'
import { useUpload } from '../../context/UploadContext'
import './FileManagement.css' // Ensure this file exists or styles are inline

// --- Helper Components & Styles ---

const GlassCard = ({ children, sx, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 6, // 24px radius
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      ...sx
    }}
    {...props}
  >
    {children}
  </Paper>
)

const FileManagement = () => {
  // --- State & Hooks ---
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
  
  // Dialogs
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  // Menus
  const [anchorElSort, setAnchorElSort] = useState(null)

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

  // --- Event Handlers ---

  const handleFileClick = (file) => {
    if (file.isFolder) {
      navigate(`?folderId=${file.id}`)
    } else {
      // Toggle selection for non-folders in this simplified logic, 
      // or implement preview logic here
      toggleSelection(file.id)
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

  // --- Render Helpers ---

  const getFileIcon = (file) => {
    const size = 64;
    
    if (file.isFolder) {
        return <FcFolder size={size} />;
    }
    
    const mime = file.mimeType || '';
    
    if (mime.includes('image')) {
        return <FcImageFile size={size} />;
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
      
      if (sortBy === 'name') return a.fileName.localeCompare(b.fileName)
      if (sortBy === 'size') return (a.fileSize || 0) - (b.fileSize || 0)
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt)
      return 0
    })

  // --- Render ---

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 4 }}>
        {/* Row 1: Breadcrumbs & Search */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,255,255,0.3)' }} />}
            sx={{ '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
          >
            <Link
              underline="none"
              color={!currentFolderId ? "primary" : "inherit"}
              onClick={() => navigate('/')}
              sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  color: !currentFolderId ? 'white' : 'rgba(255,255,255,0.5)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  transition: 'color 0.2s',
                  '&:hover': { color: 'white' }
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
                            color: isLast ? 'white' : 'rgba(255,255,255,0.5)',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            transition: 'color 0.2s',
                            '&:hover': { color: 'white' }
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
                color: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              New Folder
            </Button>

            {selectedFiles.size > 0 && (
                <Fade in={selectedFiles.size > 0}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', fontSize: '0.95rem' }}
             >
                Sort by: {sortBy}
             </Button>
            <Menu
                anchorEl={anchorElSort}
                open={Boolean(anchorElSort)}
                onClose={() => setAnchorElSort(null)}
                PaperProps={{
                    sx: { bgcolor: '#1e1e1e', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }
                }}
            >
                <MenuItem onClick={() => { setSortBy('name'); setAnchorElSort(null); }}>Name</MenuItem>
                <MenuItem onClick={() => { setSortBy('date'); setAnchorElSort(null); }}>Date</MenuItem>
                <MenuItem onClick={() => { setSortBy('size'); setAnchorElSort(null); }}>Size</MenuItem>
            </Menu>

            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3, p: 0.5, display: 'flex' }}>
                <IconButton 
                    size="small" 
                    onClick={() => setViewMode('grid')}
                    sx={{ 
                        color: viewMode === 'grid' ? 'black' : 'rgba(255,255,255,0.5)',
                        bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                        borderRadius: 2.5,
                        '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <GridViewRounded fontSize="small" />
                </IconButton>
                <IconButton 
                    size="small" 
                    onClick={() => setViewMode('list')}
                    sx={{ 
                        color: viewMode === 'list' ? 'black' : 'rgba(255,255,255,0.5)',
                        bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                        borderRadius: 2.5,
                        '&:hover': { bgcolor: viewMode === 'list' ? 'white' : 'rgba(255,255,255,0.1)' }
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
        {loading && <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />}
        
        {files.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
                <Folder sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>This folder is empty</Typography>
            </Box>
        ) : (
            <>
                {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                        {filteredFiles.map((file) => {
                            const isSelected = selectedFiles.has(file.id)
                            return (
                                <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={file.id}> {/* Larger grid items */}
                                    <GlassCard
                                        sx={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            height: 280, // Taller cards
                                            border: isSelected ? '2px solid #2E86DE' : '1px solid rgba(255, 255, 255, 0.05)',
                                            boxShadow: isSelected ? '0 0 20px rgba(46, 134, 222, 0.3)' : 'none',
                                            background: isSelected ? 'rgba(46, 134, 222, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                                '& .file-actions': { opacity: 1 }
                                            }
                                        }}
                                        onClick={() => handleFileClick(file)}
                                    >
                                        <Box 
                                            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox 
                                                checked={isSelected}
                                                onChange={() => toggleSelection(file.id)}
                                                size="small"
                                                icon={<Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />}
                                                checkedIcon={<CheckCircle sx={{ color: '#2E86DE', fontSize: 26 }} />}
                                            />
                                        </Box>
                                        
                                        <Box className="file-actions" sx={{ position: 'absolute', top: 12, right: 12, opacity: 0, transition: 'opacity 0.2s', zIndex: 2 }}>
                                            <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'black' } }}>
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '65%' }}>
                                            {getFileIcon(file)}
                                        </Box>
                                        
                                        <Box sx={{ p: 2, height: '35%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.1)' }}>
                                            <Typography 
                                                variant="subtitle1" 
                                                title={file.fileName} 
                                                sx={{ 
                                                    color: 'white', 
                                                    fontWeight: 600, 
                                                    mb: 0.5,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {file.fileName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                                                {file.isFolder ? (
                                                    file.createdAt?.split('T')[0]
                                                ) : (
                                                    `${formatSize(file.fileSize)} • ${file.createdAt?.split('T')[0]}`
                                                )}
                                            </Typography>
                                        </Box>
                                    </GlassCard>
                                </Grid>
                            )
                        })}
                    </Grid>
                ) : (
                    <TableContainer component={GlassCard} sx={{ borderRadius: 4 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            indeterminate={selectedFiles.size > 0 && selectedFiles.size < files.length}
                                            checked={files.length > 0 && selectedFiles.size === files.length}
                                            onChange={selectAll}
                                            sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#00e5ff' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Name</TableCell>
                                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Size</TableCell>
                                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }}>Date</TableCell>
                                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)' }} align="right">Actions</TableCell>
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
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05) !important' },
                                                '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.08) !important' }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onChange={(e) => { e.stopPropagation(); toggleSelection(file.id); }}
                                                    sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#00e5ff' } }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    {file.isFolder ? <Folder sx={{ color: '#FFD700' }} /> : <InsertDriveFile sx={{ color: '#00e5ff' }} />}
                                                    <Typography sx={{ color: 'white' }}>{file.fileName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                {file.isFolder ? '-' : formatSize(file.fileSize)}
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                {file.createdAt?.split('T')[0]}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => { e.stopPropagation(); /* Menu logic */ }}
                                                    sx={{ color: 'rgba(255,255,255,0.5)' }}
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

      {/* --- DIALOGS --- */}
      <Dialog 
        open={createFolderDialog} 
        onClose={() => setCreateFolderDialog(false)}
        PaperProps={{
            style: {
                backgroundColor: 'rgba(30,30,30,0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                minWidth: '400px'
            }
        }}
      >
        <DialogTitle>Create New Folder</DialogTitle>
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
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&:hover fieldset': { borderColor: 'white' },
                        '&.Mui-focused fieldset': { borderColor: '#00e5ff' }
                    }
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setCreateFolderDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
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
    </Box>
  )
}

export default FileManagement
