import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  Tooltip,
  Fade,
  Alert,
  CircularProgress,
  Grid,
  Slider,
  Snackbar,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Error,
  Refresh,
  Storage,
  CloudUpload,
  Speed,
  Info,
  Close,
  Save,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { storageApi } from '../../services/api'
import './StorageNodeConfig.css'

const StorageNodeConfig = () => {
  const theme = useTheme()
  const [nodes, setNodes] = useState([])
  const [filteredNodes, setFilteredNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortField, setSortField] = useState('priority')
  const [sortOrder, setSortOrder] = useState('asc')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, nodeId: null })
  const [editDialog, setEditDialog] = useState({ open: false, node: null })
  const [createDialog, setCreateDialog] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [newNode, setNewNode] = useState({
    name: '',
    type: 'local',
    connectionConfig: '',
    capacity: 107374182400,
  })
  const [nodeTypes, setNodeTypes] = useState([])
  const [selectedNodeType, setSelectedNodeType] = useState(null)
  const [configValues, setConfigValues] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    loadNodes()
    loadNodeTypes()
  }, [])

  const loadNodes = async () => {
    setLoading(true)
    try {
      const response = await storageApi.getAllNodes()
      console.log('API Response:', response)
      console.log('Response data:', response.data)
      console.log('Response code:', response?.code)

      if (response?.code === 200 && response.data) {
        console.log('Setting nodes from API:', response.data)
        setNodes(response.data || [])
      } else {
        const errorMessage = response?.message || '获取存储节点列表失败'
        console.error('API Error:', errorMessage)
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('Error loading storage nodes:', error)
      setSnackbar({
        open: true,
        message: '获取存储节点列表失败',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadNodeTypes = async () => {
    try {
      const response = await storageApi.getNodeTypes()
      if (response.code === 200) {
        setNodeTypes(response.data || [])
        const defaultType = response.data?.find(t => t.type === 'local')
        if (defaultType) {
          setSelectedNodeType(defaultType)
          const initialValues = {}
          defaultType.configFields?.forEach(field => {
            initialValues[field.key] = field.defaultValue !== undefined ? field.defaultValue :
              field.type === 'boolean' ? false : ''
          })
          setConfigValues(initialValues)
        }
      }
    } catch (error) {
      console.error('Error loading node types:', error)
    }
  }

  const handleNodeTypeChange = (type) => {
    const selectedType = nodeTypes.find(t => t.type === type)
    setSelectedNodeType(selectedType)
    setNewNode(prev => ({ ...prev, type }))

    if (selectedType && selectedType.configFields) {
      const initialValues = {}
      selectedType.configFields.forEach(field => {
        initialValues[field.key] = field.defaultValue !== undefined ? field.defaultValue :
          field.type === 'boolean' ? false : ''
      })
      setConfigValues(initialValues)
    }
  }

  const handleConfigFieldChange = (key, value) => {
    setConfigValues(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    let filtered = [...nodes]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((node) => node.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((node) => node.storageType === typeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter((node) =>
        node.nodeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      let comparison = 0
      if (sortField === 'priority') {
        comparison = (a.id || 0) - (b.id || 0)
      } else if (sortField === 'capacity') {
        comparison = (a.capacity || 0) - (b.capacity || 0)
      } else if (sortField === 'used') {
        comparison = (a.usedSpace || 0) - (b.usedSpace || 0)
      } else if (sortField === 'name') {
        comparison = a.nodeName.localeCompare(b.nodeName)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredNodes(filtered)
  }, [nodes, searchQuery, statusFilter, typeFilter, sortField, sortOrder])

  const renderField = (field) => {
    const value = configValues[field.key] !== undefined ? configValues[field.key] : field.defaultValue

    switch (field.type) {
      case 'string':
        return (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => handleConfigFieldChange(field.key, e.target.value)}
            helperText={field.helperText}
            required={field.required}
          />
        )
      case 'number':
        return (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleConfigFieldChange(field.key, e.target.value)}
            helperText={field.helperText}
            required={field.required}
          />
        )
      case 'boolean':
        return (
          <FormControl key={field.key} fullWidth sx={{ mt: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value || false}
                  onChange={(e) => handleConfigFieldChange(field.key, e.target.checked)}
                />
              }
              label={field.label}
            />
            {field.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                {field.helperText}
              </Typography>
            )}
          </FormControl>
        )
      case 'password':
        return (
          <TextField
            key={field.key}
            fullWidth
            label={field.label}
            type="password"
            value={value || ''}
            onChange={(e) => handleConfigFieldChange(field.key, e.target.value)}
            helperText={field.helperText}
            required={field.required}
          />
        )
      default:
        return null
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#4caf50'
      case 'INACTIVE':
        return '#ff9800'
      case 'MAINTENANCE':
        return '#f44336'
      default:
        return '#9e9e9e'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '活跃'
      case 'INACTIVE':
        return '未激活'
      case 'MAINTENANCE':
        return '维护中'
      default:
        return status
    }
  }

  const getTypeLabel = (type) => {
    const typeObj = nodeTypes.find(t => t.type === type)
    return typeObj ? typeObj.name : type
  }

  const handleDelete = async (nodeId) => {
    try {
      await storageApi.deleteNode(nodeId)
      setNodes((prev) => prev.filter((node) => node.id !== nodeId))
      setDeleteDialog({ open: false, nodeId: null })
      setSnackbar({
        open: true,
        message: '存储节点删除成功',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error deleting storage node:', error)
      setSnackbar({
        open: true,
        message: '删除存储节点失败',
        severity: 'error',
      })
    }
  }

  const handleToggleStatus = async (nodeId, newStatus) => {
    try {
      await storageApi.updateNodeStatus(nodeId, newStatus)
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, status: newStatus } : node
        )
      )
      setSnackbar({
        open: true,
        message: '节点状态更新成功',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error updating storage node status:', error)
      setSnackbar({
        open: true,
        message: '更新节点状态失败',
        severity: 'error',
      })
    }
  }

  const handleTestConnection = async (nodeId) => {
    try {
      const response = await storageApi.testNodeConnection(nodeId)
      if (response.code === 200) {
        const result = response.data
        setTestResult({
          nodeId,
          success: result.reachable === true || result.status === 'success',
          message: result.reachable || result.status === 'success' ? '连接测试成功' : '连接测试失败',
          latency: result.latency || 0,
          exists: result.exists,
          writable: result.writable,
        })
      }
    } catch (error) {
      console.error('Error testing storage node connection:', error)
      setTestResult({
        nodeId,
        success: false,
        message: '连接测试失败',
      })
    }
    setTimeout(() => setTestResult(null), 5000)
  }

  const handleSaveNode = async () => {
    try {
      const response = await storageApi.createNode({
        nodeName: newNode.name,
        storageType: newNode.type,
        storagePath: '',
        connectionConfig: JSON.stringify(configValues, null, 2),
        capacity: newNode.capacity,
      })

      if (response.code === 200) {
        await loadNodes()
        setCreateDialog(false)
        setNewNode({
          name: '',
          type: 'LOCAL',
          connectionConfig: '',
          capacity: 107374182400,
        })
        setSelectedNodeType(null)
        setConfigValues({})
        setSnackbar({
          open: true,
          message: '存储节点创建成功',
          severity: 'success',
        })
      } else {
        setSnackbar({
          open: true,
          message: response?.message || '创建存储节点失败',
          severity: 'error',
        })
      }
    } catch (error) {
      console.error('Error creating storage node:', error)
      setSnackbar({
        open: true,
        message: '创建存储节点失败',
        severity: 'error',
      })
    }
  }

  const handleRefresh = () => {
    loadNodes()
    setTestResult(null)
  }

  const totalCapacity = nodes.reduce((sum, node) => sum + (node.capacity || 0), 0)
  const totalUsed = nodes.reduce((sum, node) => sum + (node.usedSpace || 0), 0)
  const totalUsagePercent = totalCapacity > 0 ? ((totalUsed / totalCapacity) * 100).toFixed(1) : '0'

  return (
    <Box className="storage-node-config">
      <Fade in={!loading} timeout={400}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            存储节点配置
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            管理存储节点、监控使用情况、配置存储策略
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="搜索存储节点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                sx={{
                  width: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>
                      🔍
                    </Box>
                  ),
                  endAdornment: loading ? (
                    <CircularProgress size={20} sx={{ ml: 1 }} />
                  ) : null,
                }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  value={statusFilter}
                  label="状态"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">全部状态</MenuItem>
                  <MenuItem value="ACTIVE">活跃</MenuItem>
                  <MenuItem value="INACTIVE">未激活</MenuItem>
                  <MenuItem value="MAINTENANCE">维护中</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>类型</InputLabel>
                <Select
                  value={typeFilter}
                  label="类型"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">全部类型</MenuItem>
                  {nodeTypes.map((type) => (
                    <MenuItem key={type.type} value={type.type}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>排序</InputLabel>
                <Select
                  value={sortField}
                  label="排序"
                  onChange={(e) => setSortField(e.target.value)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="priority">优先级</MenuItem>
                  <MenuItem value="capacity">容量</MenuItem>
                  <MenuItem value="used">已用</MenuItem>
                  <MenuItem value="name">名称</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                disabled={loading}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.primary.main },
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </IconButton>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  刷新
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialog(true)}
                  disabled={loading}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  添加节点
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(76, 175, 80, 0.05)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(76, 175, 80, 0.3)'
                : 'rgba(76, 175, 80, 0.2)'}`,
              borderRadius: 2,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Storage sx={{ fontSize: '2rem', color: '#4caf50' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    总容量
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {formatBytes(totalCapacity)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <CloudUpload sx={{ fontSize: '2rem', color: '#2196f3' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    已使用
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {formatBytes(totalUsed)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Speed sx={{ fontSize: '2rem', color: '#ff9800' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    使用率
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {totalUsagePercent}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <CheckCircle sx={{ fontSize: '2rem', color: '#4caf50' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    活跃节点
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {nodes.filter((n) => n.status === 'ACTIVE').length} / {nodes.length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {testResult && (
            <Alert
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
              icon={testResult.success ? <CheckCircle /> : <Error />}
              onClose={() => setTestResult(null)}
            >
              {testResult.message} {testResult.latency > 0 && `(延迟: ${testResult.latency}ms)`}
              {testResult.exists !== undefined && (
                <>
                  <Typography component="span" sx={{ mr: 2 }}>
                    路径存在: {testResult.exists ? '是' : '否'}
                  </Typography>
                  <Typography component="span" sx={{ mr: 2 }}>
                    可写: {testResult.writable ? '是' : '否'}
                  </Typography>
                </>
              )}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.06)'}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>名称</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>类型</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>容量</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>已用</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>使用率</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>优先级</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>路径</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Info sx={{ fontSize: '4rem', color: theme.palette.text.secondary }} />
                        <Typography variant="h6" color="text.secondary">
                          没有找到符合条件的存储节点
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNodes.map((node) => (
                    <TableRow
                      key={node.id}
                      sx={{
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.04)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 500 }}>{node.nodeName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(node.storageType)}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(node.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(node.status) + '20',
                            color: getStatusColor(node.status),
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatBytes(node.capacity)}</TableCell>
                      <TableCell>{formatBytes(node.usedSpace)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 80,
                              height: 8,
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.1)',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(node.usedSpace / node.capacity) * 100}%`,
                                height: '100%',
                                backgroundColor:
                                  (node.usedSpace / node.capacity) > 0.8
                                    ? '#f44336'
                                    : (node.usedSpace / node.capacity) > 0.6
                                      ? '#ff9800'
                                      : '#4caf50',
                                borderRadius: 4,
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {((node.usedSpace / node.capacity) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={node.id}
                          size="small"
                          sx={{
                            backgroundColor: `${theme.palette.primary.main}20`,
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={node.storagePath}>
                          <Typography
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {node.storagePath}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="测试连接">
                            <IconButton
                              size="small"
                              onClick={() => handleTestConnection(node.id)}
                              disabled={loading}
                              sx={{
                                color: theme.palette.info.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.info.main + '20',
                                },
                              }}
                            >
                              <Speed fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="编辑">
                            <IconButton
                              size="small"
                              onClick={() => setEditDialog({ open: true, node })}
                              disabled={loading}
                              sx={{
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={node.status === 'ACTIVE' ? '停用' : '启用'}>
                            <Switch
                              checked={node.status === 'ACTIVE'}
                              onChange={() => handleToggleStatus(
                                node.id,
                                node.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                              )}
                              disabled={loading}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteDialog({ open: true, nodeId: node.id })}
                              disabled={loading}
                              sx={{
                                color: '#f44336',
                                '&:hover': {
                                  backgroundColor: '#f44336' + '20',
                                },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog
            open={deleteDialog.open}
            onClose={() => setDeleteDialog({ open: false, nodeId: null })}
            PaperProps={{
              sx: {
                borderRadius: 3,
                p: 1,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
              },
            }}
          >
            <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
              删除存储节点
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary">
                确定要删除此存储节点吗？删除后将无法恢复，且与该节点相关的所有文件将无法访问。
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setDeleteDialog({ open: false, nodeId: null })}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                取消
              </Button>
              <Button
                onClick={() => handleDelete(deleteDialog.nodeId)}
                variant="contained"
                color="error"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                确认删除
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={createDialog}
            onClose={() => {
        setCreateDialog(false)
        setNewNode({
          name: '',
          type: 'LOCAL',
          connectionConfig: '',
          capacity: 107374182400,
        })
        setSelectedNodeType(null)
        setConfigValues({})
      }}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                p: 1,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
              },
            }}
          >
            <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
              添加存储节点
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="节点名称"
                    value={newNode.name}
                    onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                    placeholder="例如：主存储节点"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>节点类型</InputLabel>
                    <Select
                      value={newNode.type}
                      label="节点类型"
                      onChange={(e) => handleNodeTypeChange(e.target.value)}
                    >
                      {nodeTypes.map((type) => (
                        <MenuItem key={type.type} value={type.type}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {selectedNodeType && selectedNodeType.configFields && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        配置参数
                      </Typography>
                      <Grid container spacing={2}>
                        {selectedNodeType.configFields
                          .sort((a, b) => a.order - b.order)
                          .map(field => (
                            <Grid item xs={12} key={field.key}>
                              {renderField(field)}
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="容量 (GB)"
                    type="number"
                    value={(newNode.capacity / 1073741824).toFixed(2)}
                    onChange={(e) => setNewNode({ ...newNode, capacity: Math.floor(e.target.value * 1073741824) })}
                    helperText="存储节点的总容量，单位：GB"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => {
        setCreateDialog(false)
        setNewNode({
          name: '',
          type: 'local',
          connectionConfig: '',
          capacity: 107374182400,
        })
        setSelectedNodeType(null)
        setConfigValues({})
                  }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveNode}
                variant="contained"
                startIcon={<Save />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                保存
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Box>
  )
}

export default StorageNodeConfig
