import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const AccountInfo = () => {
  const theme = useTheme()

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        账号信息
      </Typography>
      <Typography color="text.secondary">
        管理您的个人资料和账号设置
      </Typography>
    </Box>
  )
}

export default AccountInfo
