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
  Grid,
  Slider,
  FormHelperText,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Error,
  Refresh,
  Assignment,
  CloudUpload,
  Speed,
  Storage,
  Security,
  Close,
  Save,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import './StoragePolicyConfig.css'

const mockUploadPolicies = [
  {
    id: 1,
    name: '默认策略',
    description: '适用于大多数文件的默认上传策略',
    priority: 1,
    maxFileSize: 536870912,
    allowedTypes: '*',
    storageNodeStrategy: 'PRIORITY',
    autoRetry: true,
    retryCount: 3,
    enabled: true,
    createdAt: '2026-01-20 10:00:00',
  },
  {
    id: 2,
    name: '大文件策略',
    description: '针对大文件优化的上传策略，支持断点续传',
    priority: 2,
    maxFileSize: 53687091200,
    allowedTypes: 'video,image',
    storageNodeStrategy: 'CAPACITY',
    autoRetry: true,
    retryCount: 5,
    enabled: true,
    createdAt: '2026-01-18 14:30:00',
  },
  {
    id: 3,
    name: '敏感文件策略',
    description: '针对敏感文件的安全上传策略',
    priority: 3,
    maxFileSize: 104857600,
    allowedTypes: 'document',
    storageNodeStrategy: 'SECURE',
    autoRetry: true,
    retryCount: 3,
    enabled: true,
    createdAt: '2026-01-15 09:20:00',
  },
  {
    id: 4,
    name: '测试策略',
    description: '测试用的上传策略',
    priority: 4,
    maxFileSize: 1073741824,
    allowedTypes: '*',
    storageNodeStrategy: 'RANDOM',
    autoRetry: false,
    retryCount: 1,
    enabled: false,
    createdAt: '2026-01-10 16:45:00',
  },
]

const StoragePolicyConfig = () => {
  const theme = useTheme()
  const [policies, setPolicies] = useState(mockUploadPolicies)
  const [filteredPolicies, setFilteredPolicies] = useState(mockUploadPolicies)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [strategyFilter, setStrategyFilter] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, policyId: null })
  const [editDialog, setEditDialog] = useState({ open: false, policy: null })
  const [createDialog, setCreateDialog] = useState(false)
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    priority: 5,
    maxFileSize: 536870912,
    allowedTypes: '*',
    storageNodeStrategy: 'PRIORITY',
    autoRetry: true,
    retryCount: 3,
    enabled: true,
  })

  useEffect(() => {
    let filtered = [...policies]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((policy) =>
        statusFilter === 'enabled' ? policy.enabled : !policy.enabled
      )
    }

    if (strategyFilter !== 'all') {
      filtered = filtered.filter((policy) => policy.storageNodeStrategy === strategyFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter((policy) =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPolicies(filtered)
  }, [policies, searchQuery, statusFilter, strategyFilter])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStrategyLabel = (strategy) => {
    switch (strategy) {
      case 'PRIORITY':
        return '优先级'
      case 'CAPACITY':
        return '容量优先'
      case 'SECURE':
        return '安全节点'
      case 'RANDOM':
        return '随机'
      default:
        return strategy
    }
  }

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'PRIORITY':
        return '#2196f3'
      case 'CAPACITY':
        return '#4caf50'
      case 'SECURE':
        return '#f44336'
      case 'RANDOM':
        return '#ff9800'
      default:
        return '#9e9e9e'
    }
  }

  const handleDelete = (policyId) => {
    setPolicies((prev) => prev.filter((policy) => policy.id !== policyId))
    setDeleteDialog({ open: false, policyId: null })
  }

  const handleToggleEnabled = (policyId) => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === policyId
          ? { ...policy, enabled: !policy.enabled }
          : policy
      )
    )
  }

  const handleSavePolicy = () => {
    const policyToSave = editDialog.policy
      ? { ...newPolicy, id: editDialog.policy.id }
      : { ...newPolicy, id: Date.now() }

    setPolicies((prev) =>
      editDialog.policy
        ? prev.map((p) => (p.id === editDialog.policy.id ? policyToSave : p))
        : [...prev, policyToSave]
    )
    setEditDialog({ open: false, policy: null })
    setCreateDialog(false)
    setNewPolicy({
      name: '',
      description: '',
      priority: 5,
      maxFileSize: 536870912,
      allowedTypes: '*',
      storageNodeStrategy: 'PRIORITY',
      autoRetry: true,
      retryCount: 3,
      enabled: true,
    })
  }

  const openEditDialog = (policy) => {
    setNewPolicy(policy)
    setEditDialog({ open: true, policy })
  }

  const enabledCount = policies.filter((p) => p.enabled).length
  const totalCount = policies.length

  return (
    <Box className="storage-policy-config">
      <Fade in timeout={400}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            存储策略配置
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            管理上传策略、设置存储节点选择规则
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255,255, 255, 0.03)'
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
                placeholder="搜索策略..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                }}
              />

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  value={statusFilter}
                  label="状态"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">全部状态</MenuItem>
                  <MenuItem value="enabled">已启用</MenuItem>
                  <MenuItem value="disabled">已禁用</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>节点策略</InputLabel>
                <Select
                  value={strategyFilter}
                  label="节点策略"
                  onChange={(e) => setStrategyFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">全部策略</MenuItem>
                  <MenuItem value="PRIORITY">优先级</MenuItem>
                  <MenuItem value="CAPACITY">容量优先</MenuItem>
                  <MenuItem value="SECURE">安全节点</MenuItem>
                  <MenuItem value="RANDOM">随机</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  刷新
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setNewPolicy({
                      name: '',
                      description: '',
                      priority: 5,
                      maxFileSize: 536870912,
                      allowedTypes: '*',
                      storageNodeStrategy: 'PRIORITY',
                      autoRetry: true,
                      retryCount: 3,
                      enabled: true,
                    })
                    setCreateDialog(true)
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  创建策略
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
                ? 'rgba(33, 150, 243, 0.1)'
                : 'rgba(33, 150, 243, 0.05)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(33, 150, 243, 0.3)'
                : 'rgba(33, 150, 243, 0.2)'}`,
              borderRadius: 2,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Assignment sx={{ fontSize: '2rem', color: '#2196f3' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  总策略数
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {totalCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <CheckCircle sx={{ fontSize: '2rem', color: '#4caf50' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  已启用
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {enabledCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Error sx={{ fontSize: '2rem', color: '#f44336' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  已禁用
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {totalCount - enabledCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Security sx={{ fontSize: '2rem', color: '#ff9800' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  启用率
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {((enabledCount / totalCount) * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Paper>

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
                  <TableCell sx={{ fontWeight: 600 }}>策略名称</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>描述</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>最大文件</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>允许类型</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>节点策略</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>优先级</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>重试次数</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>创建时间</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Assignment sx={{ fontSize: '4rem', color: theme.palette.text.secondary }} />
                        <Typography variant="h6" color="text.secondary">
                          没有找到符合条件的策略
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow
                      key={policy.id}
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
                        <Typography sx={{ fontWeight: 500 }}>{policy.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={policy.description}>
                          <Typography
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {policy.description}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={policy.enabled ? '已启用' : '已禁用'}
                          size="small"
                          sx={{
                            backgroundColor: policy.enabled ? '#4caf50' : '#9e9e9e',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatBytes(policy.maxFileSize)}</TableCell>
                      <TableCell>
                        <Chip
                          label={policy.allowedTypes === '*' ? '全部类型' : policy.allowedTypes}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStrategyLabel(policy.storageNodeStrategy)}
                          size="small"
                          sx={{
                            backgroundColor: getStrategyColor(policy.storageNodeStrategy) + '20',
                            color: getStrategyColor(policy.storageNodeStrategy),
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={policy.priority}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CloudUpload fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                          <Typography color="text.secondary">
                            {policy.autoRetry ? policy.retryCount : '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {policy.createdAt}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="编辑">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(policy)}
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
                          <Tooltip title={policy.enabled ? '禁用' : '启用'}>
                            <Switch
                              checked={policy.enabled}
                              onChange={() => handleToggleEnabled(policy.id)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteDialog({ open: true, policyId: policy.id })}
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
            onClose={() => setDeleteDialog({ open: false, policyId: null })}
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
              删除策略
            </DialogTitle>
            <DialogContent>
              <Typography color="text.secondary">
                确定要删除此策略吗？删除后将无法恢复，使用该策略的上传任务将自动切换到默认策略。
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setDeleteDialog({ open: false, policyId: null })}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                取消
              </Button>
              <Button
                onClick={() => handleDelete(deleteDialog.policyId)}
                variant="contained"
                color="error"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                确认删除
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={createDialog || editDialog.open}
            onClose={() => {
              setCreateDialog(false)
              setEditDialog({ open: false, policy: null })
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
              {editDialog.policy ? '编辑策略' : '创建策略'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="策略名称"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                    placeholder="例如：默认策略"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="描述"
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    placeholder="描述该策略的用途和特点..."
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>节点策略</InputLabel>
                    <Select
                      value={newPolicy.storageNodeStrategy}
                      label="节点策略"
                      onChange={(e) => setNewPolicy({ ...newPolicy, storageNodeStrategy: e.target.value })}
                    >
                      <MenuItem value="PRIORITY">优先级</MenuItem>
                      <MenuItem value="CAPACITY">容量优先</MenuItem>
                      <MenuItem value="SECURE">安全节点</MenuItem>
                      <MenuItem value="RANDOM">随机</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>允许类型</InputLabel>
                    <Select
                      value={newPolicy.allowedTypes}
                      label="允许类型"
                      onChange={(e) => setNewPolicy({ ...newPolicy, allowedTypes: e.target.value })}
                    >
                      <MenuItem value="*">全部类型</MenuItem>
                      <MenuItem value="image">图片</MenuItem>
                      <MenuItem value="video">视频</MenuItem>
                      <MenuItem value="audio">音频</MenuItem>
                      <MenuItem value="document">文档</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                    最大文件大小: <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>{formatBytes(newPolicy.maxFileSize)}</span>
                  </Typography>
                  <Slider
                    value={newPolicy.maxFileSize}
                    onChange={(e) => setNewPolicy({ ...newPolicy, maxFileSize: e.target.value })}
                    min={1048576}
                    max={107374182400}
                    step={1048576}
                    marks={[
                      { value: 1048576, label: '10 MB' },
                      { value: 104857600, label: '100 MB' },
                      { value: 1073741824, label: '1 GB' },
                      { value: 10737418240, label: '10 GB' },
                    ]}
                    valueLabelFormat={(value) => formatBytes(value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                    优先级: <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>{newPolicy.priority}</span>
                  </Typography>
                  <Slider
                    value={newPolicy.priority}
                    onChange={(e) => setNewPolicy({ ...newPolicy, priority: e.target.value })}
                    min={1}
                    max={10}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                    重试次数: <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>{newPolicy.retryCount}</span>
                  </Typography>
                  <Slider
                    value={newPolicy.retryCount}
                    onChange={(e) => setNewPolicy({ ...newPolicy, retryCount: e.target.value })}
                    min={0}
                    max={10}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 3, label: '3' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                  </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Switch
                      checked={newPolicy.autoRetry}
                      onChange={(e) => setNewPolicy({ ...newPolicy, autoRetry: e.target.checked })}
                    />
                    <Typography variant="body2">
                      自动重试
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Switch
                      checked={newPolicy.enabled}
                      onChange={(e) => setNewPolicy({ ...newPolicy, enabled: e.target.checked })}
                    />
                    <Typography variant="body2">
                      启用策略
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  setCreateDialog(false)
                  setEditDialog({ open: false, policy: null })
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                取消
              </Button>
              <Button
                onClick={handleSavePolicy}
                variant="contained"
                startIcon={<Save />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                保存
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Box>
  )
}

export default StoragePolicyConfig
