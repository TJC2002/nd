import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material'
import {
  ContentCopy,
  DeleteOutline,
  ShareOutlined,
  LockOutlined,
  LockOpenOutlined
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { shareApi } from '../../services/api'

// Reuse GlassCard style
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
      borderRadius: 6,
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      ...sx
    }}
    {...props}
  >
    {children}
  </Paper>
)

const ShareList = () => {
  const theme = useTheme()
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(false)
  const [revokeDialog, setRevokeDialog] = useState({ open: false, shareId: null, fileName: '' })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    loadShares()
  }, [])

  const loadShares = async () => {
    try {
      setLoading(true)
      const response = await shareApi.getShares()
      if (response.code === 200) {
        setShares(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load shares:', error)
      showSnackbar('Failed to load share history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    try {
      const response = await shareApi.revokeShare(revokeDialog.shareId)
      if (response.code === 200) {
        showSnackbar('Share link revoked successfully')
        loadShares()
      } else {
        showSnackbar(response.message || 'Revoke failed', 'error')
      }
    } catch (error) {
      showSnackbar('Network error', 'error')
    } finally {
      setRevokeDialog({ open: false, shareId: null, fileName: '' })
    }
  }

  const copyLink = (shareCode) => {
    const url = `${window.location.origin}/s/${shareCode}`
    navigator.clipboard.writeText(url)
      .then(() => showSnackbar('Link copied to clipboard'))
      .catch(() => showSnackbar('Failed to copy link', 'error'))
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const isExpired = (expireTime) => {
    if (!expireTime) return false
    return new Date(expireTime) < new Date()
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShareOutlined sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            My Shares
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your shared files and links
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {loading && <LinearProgress sx={{ mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />}
        
        {shares.length === 0 && !loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
            <ShareOutlined sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No active shares</Typography>
          </Box>
        ) : (
          <TableContainer component={GlassCard}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary' }}>File Name</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Share Code</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Type</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Downloads</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Expires</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>Status</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shares.map((share) => {
                  const expired = isExpired(share.expireTime)
                  return (
                    <TableRow key={share.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05) !important' : 'rgba(0,0,0,0.02) !important' } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {share.fileName || 'Unknown File'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={share.shareCode} 
                          size="small" 
                          variant="outlined"
                          onClick={() => copyLink(share.shareCode)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                          icon={<ContentCopy fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={share.hasPassword ? "Password Protected" : "Public Link"}>
                            {share.hasPassword ? <LockOutlined fontSize="small" color="warning" /> : <LockOpenOutlined fontSize="small" color="success" />}
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {share.downloadCount} / {share.maxDownloads || '∞'}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {share.expireTime ? new Date(share.expireTime).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {expired ? (
                           <Chip label="Expired" size="small" color="error" variant="outlined" />
                        ) : (
                           <Chip label="Active" size="small" color="success" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Copy Link">
                            <IconButton size="small" onClick={() => copyLink(share.shareCode)} sx={{ color: 'primary.main' }}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Revoke Share">
                            <IconButton 
                                size="small" 
                                onClick={() => setRevokeDialog({ open: true, shareId: share.id, fileName: share.fileName })}
                                sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Revoke Dialog */}
      <Dialog
        open={revokeDialog.open}
        onClose={() => setRevokeDialog({ open: false, shareId: null, fileName: '' })}
        PaperProps={{
            style: {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: 'text.primary'
            }
        }}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>Revoke Share Link?</DialogTitle>
        <DialogContent>
            <Typography sx={{ color: 'text.secondary' }}>
                Are you sure you want to revoke the share link for <b>{revokeDialog.fileName}</b>? 
                This action cannot be undone and the link will stop working immediately.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setRevokeDialog({ open: false, shareId: null, fileName: '' })} sx={{ color: 'text.secondary' }}>
                Cancel
            </Button>
            <Button onClick={handleRevoke} color="error" variant="contained">
                Revoke
            </Button>
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

export default ShareList
