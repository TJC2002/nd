import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Checkbox,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  Paper,
  Tooltip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  Search,
  Folder,
  InsertDriveFile,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  GridViewRounded,
  TableRowsRounded,
  Download,
  DeleteOutline,
  MoreVert,
  ArrowBack,
  Sort,
} from '@mui/icons-material'
import { FcFolder, FcImageFile, FcAudioFile, FcVideoFile, FcDocument, FcFile } from 'react-icons/fc'
import { fileApi } from '../../services/api'

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
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      ...sx
    }}
    {...props}
  >
    {children}
  </Paper>
)

const SearchPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedFiles, setSelectedFiles] = useState(new Set())

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [fileType, setFileType] = useState(searchParams.get('fileType') || '')
  const [minSize, setMinSize] = useState(searchParams.get('minSize') || '')
  const [maxSize, setMaxSize] = useState(searchParams.get('maxSize') || '')
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  const [anchorElSort, setAnchorElSort] = useState(null)
  const [anchorElMore, setAnchorElMore] = useState(null)
  const [activeFile, setActiveFile] = useState(null)

  useEffect(() => {
    const newKeyword = searchParams.get('keyword') || ''
    setKeyword(newKeyword)
    setFileType(searchParams.get('fileType') || '')
    setMinSize(searchParams.get('minSize') || '')
    setMaxSize(searchParams.get('maxSize') || '')
    setStartDate(searchParams.get('startDate') || '')
    setEndDate(searchParams.get('endDate') || '')
    setSortBy(searchParams.get('sortBy') || 'created_at')
    setSortOrder(searchParams.get('sortOrder') || 'desc')
    setPage(parseInt(searchParams.get('page') || '0'))
    setPageSize(parseInt(searchParams.get('pageSize') || '20'))

    if (newKeyword || Object.fromEntries(searchParams).length > 0) {
      searchFiles()
    }
  }, [searchParams])

  const searchFiles = async () => {
    try {
      setLoading(true)
      const params = {
        keyword,
        fileType,
        minSize: minSize ? parseInt(minSize) : undefined,
        maxSize: maxSize ? parseInt(maxSize) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page: page || 0,
        pageSize: pageSize || 20,
        offset: (page || 0) * (pageSize || 20),
      }
      const response = await fileApi.searchFiles(params)
      if (response.code === 200) {
        setFiles(response.data || [])
        setTotal(response.total || 0)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (fileType) params.set('fileType', fileType)
    if (minSize) params.set('minSize', minSize)
    if (maxSize) params.set('maxSize', maxSize)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    params.set('page', '0')
    params.set('pageSize', pageSize.toString())
    setSearchParams(params)
    setPage(0)
  }

  const handleReset = () => {
    setKeyword('')
    setFileType('')
    setMinSize('')
    setMaxSize('')
    setStartDate('')
    setEndDate('')
    setSearchParams({})
    setFiles([])
    setTotal(0)
    setPage(0)
  }

  const getFileIcon = (file) => {
    const size = 64
    if (file.isFolder) {
      return <FcFolder size={size} />
    }

    const mime = file.mimeType || ''
    if (mime.includes('image')) return <FcImageFile size={size} />
    if (mime.includes('video')) return <FcVideoFile size={size} />
    if (mime.includes('audio')) return <FcAudioFile size={size} />
    if (mime.includes('pdf') || mime.includes('document')) return <FcDocument size={size} />
    return <FcFile size={size} />
  }

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '--'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (file) => {
    try {
      const response = await fileApi.downloadFile(file.id)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (fileId) => {
    if (!window.confirm('确定要删除这个文件吗？')) return
    try {
      await fileApi.deleteFile(fileId)
      setFiles(files.filter(f => f.id !== fileId))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleBatchDownload = async () => {
    if (selectedFiles.size === 0) return
    for (const id of selectedFiles) {
      const file = files.find(f => f.id === id)
      if (file && !file.isFolder) {
        await handleDownload(file)
      }
    }
    setSelectedFiles(new Set())
  }

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return
    if (!window.confirm(`确定要删除选中的 ${selectedFiles.size} 个文件吗？`)) return
    try {
      for (const id of selectedFiles) {
        await fileApi.deleteFile(id)
      }
      setSelectedFiles(new Set())
      searchFiles()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="static" 
        sx={{ 
          zIndex: theme.zIndex.appBar,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <Toolbar sx={{ height: 80, px: { xs: 2, md: 4 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Search Files
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 2, md: 4 } }}>

      <GlassCard sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>File Type</InputLabel>
              <Select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                label="File Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="image/">Images</MenuItem>
                <MenuItem value="video/">Videos</MenuItem>
                <MenuItem value="audio/">Audio</MenuItem>
                <MenuItem value="application/pdf">PDF</MenuItem>
                <MenuItem value="application/vnd.ms-excel">Excel</MenuItem>
                <MenuItem value="application/vnd.ms-powerpoint">PowerPoint</MenuItem>
                <MenuItem value="application/msword">Word</MenuItem>
                <MenuItem value="text/plain">Text</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField
              fullWidth
              size="small"
              label="Min Size (KB)"
              type="number"
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField
              fullWidth
              size="small"
              label="Max Size (KB)"
              type="number"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate?.split('T')[0] || ''}
              onChange={(e) => setStartDate(e.target.value ? `${e.target.value}T00:00:00` : '')}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate?.split('T')[0] || ''}
              onChange={(e) => setEndDate(e.target.value ? `${e.target.value}T23:59:59` : '')}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                sx={{ flex: 1 }}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </GlassCard>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {selectedFiles.size > 0 && (
            <>
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
                onClick={handleBatchDelete}
                sx={{ borderRadius: 4, px: 3 }}
              >
                Delete ({selectedFiles.size})
              </Button>
            </>
          )}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {total} results
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            endIcon={<Sort />}
            onClick={(e) => setAnchorElSort(e.currentTarget)}
            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.95rem' }}
          >
            Sort by: {sortBy === 'name' ? 'Name' : sortBy === 'size' ? 'Size' : 'Date'} ({sortOrder.toUpperCase()})
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
            <MenuItem onClick={() => { setSortBy('size'); setAnchorElSort(null); }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                Size {sortBy === 'size' && <CheckCircle fontSize="small" color="primary" />}
              </Box>
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('created_at'); setAnchorElSort(null); }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                Date {sortBy === 'created_at' && <CheckCircle fontSize="small" color="primary" />}
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

      {loading && <LinearProgress sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />}

      {files.length === 0 && !loading && keyword ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
          <Search sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No results found</Typography>
        </Box>
      ) : files.length === 0 && !loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
          <Search sx={{ fontSize: 80, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Enter a keyword to search</Typography>
        </Box>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {files.map((file) => {
                const isSelected = selectedFiles.has(file.id)
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={file.id}>
                    <Tooltip 
                      title={
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
                      } 
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
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                          }
                        }}
                        onClick={(e) => {
                          // Handle file click if needed
                        }}
                      >
                        <Box 
                          className="checkbox-area"
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8, 
                            zIndex: 3,
                            opacity: isSelected ? 1 : 0,
                            transition: 'opacity 0.2s'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => {
                              const newSelected = new Set(selectedFiles)
                              if (isSelected) {
                                newSelected.delete(file.id)
                              } else {
                                newSelected.add(file.id)
                              }
                              setSelectedFiles(newSelected)
                            }}
                            size="small"
                            icon={<Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: 'text.secondary' }} />}
                            checkedIcon={<CheckCircle sx={{ color: '#2E86DE', fontSize: 22 }} />}
                          />
                        </Box>
                        
                        <Box className="file-actions" sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.2s', zIndex: 3 }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation()
                              setAnchorElMore(e.currentTarget)
                              setActiveFile(file)
                            }}
                            sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'black' } }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ 
                          width: '100px',
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
                        
                        <Box sx={{ 
                          flex: 1, 
                          p: 2, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          overflow: 'hidden',
                          minWidth: 0
                        }}>
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(new Set(files.map(f => f.id)))
                          } else {
                            setSelectedFiles(new Set())
                          }
                        }}
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
                  {files.map((file) => {
                    const isSelected = selectedFiles.has(file.id)
                    return (
                      <TableRow 
                        key={file.id}
                        hover
                        selected={isSelected}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05) !important' : 'rgba(0,0,0,0.02) !important' },
                          '&.Mui-selected': { bgcolor: 'rgba(0, 229, 255, 0.08) !important' }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox 
                            checked={isSelected}
                            onChange={(e) => { 
                              e.stopPropagation(); 
                              const newSelected = new Set(selectedFiles)
                              if (isSelected) {
                                newSelected.delete(file.id)
                              } else {
                                newSelected.add(file.id)
                              }
                              setSelectedFiles(newSelected)
                            }}
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
                            onClick={() => handleDownload(file)}
                            disabled={file.isFolder}
                            sx={{ color: 'text.secondary' }}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAnchorElMore(e.currentTarget)
                              setActiveFile(file)
                            }}
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

          {total > pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 1 }}>
              <Button
                variant="outlined"
                disabled={page === 0}
                onClick={() => {
                  const newPage = page - 1
                  setPage(newPage)
                  const params = new URLSearchParams(searchParams)
                  params.set('page', newPage.toString())
                  setSearchParams(params)
                }}
              >
                Previous
              </Button>
              <Chip label={`Page ${page + 1}`} />
              <Button
                variant="outlined"
                disabled={(page + 1) * pageSize >= total}
                onClick={() => {
                  const newPage = page + 1
                  setPage(newPage)
                  const params = new URLSearchParams(searchParams)
                  params.set('page', newPage.toString())
                  setSearchParams(params)
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
    </Box>
  )
}

export default SearchPage
