import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  InputAdornment,
  Alert
} from '@mui/material'
import { ContentCopy } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { shareApi } from '../../services/api'

const ShareDialog = ({ open, onClose, file }) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [usePassword, setUsePassword] = useState(false)
  const [expireTime, setExpireTime] = useState('')
  const [maxDownloads, setMaxDownloads] = useState('')
  const [shareResult, setShareResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCreateShare = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = {
        fileId: file.id,
        password: usePassword ? password : null,
        expireTime: expireTime ? new Date(expireTime).toISOString() : null,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null
      }

      const response = await shareApi.createShare(data)
      if (response.code === 200) {
        setShareResult(response.data)
      } else {
        setError(response.message || 'Create share failed')
      }
    } catch (err) {
      setError('Network error or server failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShareResult(null)
    setPassword('')
    setUsePassword(false)
    setExpireTime('')
    setMaxDownloads('')
    setError(null)
    onClose()
  }

  const copyToClipboard = () => {
    if (!shareResult) return
    const url = `${window.location.origin}/s/${shareResult.shareCode}`
    navigator.clipboard.writeText(url)
      .then(() => alert('Link copied!'))
      .catch(() => alert('Failed to copy'))
  }

  const shareUrl = shareResult ? `${window.location.origin}/s/${shareResult.shareCode}` : ''

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
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
      <DialogTitle sx={{ color: 'text.primary' }}>
        {shareResult ? 'Share Created' : `Share "${file?.fileName}"`}
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {shareResult ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share Link
            </Typography>
            <TextField
              fullWidth
              value={shareUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={copyToClipboard} startIcon={<ContentCopy />}>
                      Copy
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            {shareResult.password && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  value={shareResult.password}
                  InputProps={{ readOnly: true }}
                />
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={usePassword} 
                  onChange={(e) => setUsePassword(e.target.checked)}
                  sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#00e5ff' } }}
                />
              }
              label="Require Password"
              sx={{ color: 'text.primary' }}
            />
            
            {usePassword && (
              <TextField
                label="Password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
                sx={{
                    '& .MuiInputLabel-root': { color: 'text.secondary' },
                    '& .MuiOutlinedInput-root': {
                        color: 'text.primary',
                        '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' },
                        '&:hover fieldset': { borderColor: 'text.primary' },
                        '&.Mui-focused fieldset': { borderColor: '#00e5ff' }
                    }
                }}
              />
            )}

            <TextField
              label="Expiration Time"
              type="datetime-local"
              value={expireTime}
              onChange={(e) => setExpireTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                  '& .MuiInputLabel-root': { color: 'text.secondary' },
                  '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' },
                      '&:hover fieldset': { borderColor: 'text.primary' },
                      '&.Mui-focused fieldset': { borderColor: '#00e5ff' },
                      // Fix for date input icon color in dark mode
                      '& ::-webkit-calendar-picker-indicator': {
                          filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none'
                      }
                  }
              }}
            />

            <TextField
              label="Max Downloads (Optional)"
              type="number"
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              fullWidth
              sx={{
                  '& .MuiInputLabel-root': { color: 'text.secondary' },
                  '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' },
                      '&:hover fieldset': { borderColor: 'text.primary' },
                      '&.Mui-focused fieldset': { borderColor: '#00e5ff' }
                  }
              }}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
          {shareResult ? 'Close' : 'Cancel'}
        </Button>
        {!shareResult && (
          <Button 
            onClick={handleCreateShare} 
            variant="contained" 
            disabled={loading}
            sx={{ bgcolor: '#00e5ff', color: 'black', '&:hover': { bgcolor: '#00b8cc' } }}
          >
            {loading ? 'Creating...' : 'Create Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ShareDialog
