import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const SecuritySettings = () => {
  const theme = useTheme()

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        安全设置
      </Typography>
      <Typography color="text.secondary">
        管理密码、二次验证等安全选项
      </Typography>
    </Box>
  )
}

export default SecuritySettings
