import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    if (response.data?.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('auth-error', { detail: { message: response.data.message || '认证失败，请重新登录' } }))
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    }
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('auth-error', { detail: { message: '认证失败，请重新登录' } }))
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    }
    return Promise.reject(error)
  }
)

export const fileApi = {
  getFiles: (folderId) => {
    return api.get('/files', { params: { folderId } })
  },
  getFolderPath: (folderId) => {
    return api.get('/files/path', { params: { folderId } })
  },
  uploadFile: (file, parentFolderId) => {
    const formData = new FormData()
    formData.append('file', file)
    if (parentFolderId) {
      formData.append('parentFolderId', parentFolderId)
    }
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getFile: (fileId) => {
    return api.get(`/files/${fileId}`)
  },

  deleteFile: (fileId) => {
    return api.delete(`/files/${fileId}`)
  },

  renameFile: (fileId, newName) => {
    return api.put(`/files/${fileId}/rename`, { name: newName })
  },

  moveFile: (fileId, targetFolderId) => {
    return api.put(`/files/${fileId}/move`, { targetFolderId })
  },

  downloadFile: (fileId) => {
    return api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    })
  },

  createFolder: (folderName, parentFolderId) => {
    return api.post('/files/folders', { folderName, parentFolderId })
  },

  searchFiles: (params) => {
    return api.get('/files/search', { params })
  },
}

export const shareApi = {
  createShare: (data) => {
    return api.post('/shares', data)
  },

  getShares: () => {
    return api.get('/shares')
  },

  verifyShare: (shareCode) => {
    return api.get(`/shares/${shareCode}`)
  },

  accessShare: (shareCode, password) => {
    return api.post(`/shares/${shareCode}/access`, { password })
  },

  downloadShare: (shareCode, password) => {
    return api.get(`/shares/${shareCode}/download`, {
      params: { password },
      responseType: 'blob'
    })
  },

  revokeShare: (shareId) => {
    return api.delete(`/shares/${shareId}`)
  },

  getShareStats: () => {
    return api.get('/shares/stats')
  },
}

export const storageApi = {
  getAllNodes: () => {
    return api.get('/storage/nodes')
  },

  getNode: (nodeId) => {
    return api.get(`/storage/nodes/${nodeId}`)
  },

  createNode: (data) => {
    return api.post('/storage/nodes', data)
  },

  updateNode: (nodeId, data) => {
    return api.put(`/storage/nodes/${nodeId}`, data)
  },

  updateNodeStatus: (nodeId, status) => {
    return api.put(`/storage/nodes/${nodeId}/status`, { status })
  },

  deleteNode: (nodeId) => {
    return api.delete(`/storage/nodes/${nodeId}`)
  },

  getStatus: () => {
    return api.get('/storage/status')
  },

  getActiveNodes: () => {
    return api.get('/storage/nodes/active')
  },

  getNodeUsage: (nodeId) => {
    return api.get(`/storage/nodes/${nodeId}/usage`)
  },

  testNodeConnection: (nodeId) => {
    return api.post(`/storage/nodes/${nodeId}/test`)
  },

  batchUpdateNodeStatus: (nodeIds, status) => {
    return api.put('/storage/nodes/batch/status', { nodeIds, status })
  },

  getNodeTypes: () => {
    return api.get('/storage/node-types')
  },
}

export default api
