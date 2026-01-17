import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

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
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const fileApi = {
  getFiles: (folderId) => {
    return api.get('/files', { params: { folderId } })
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
}

export const storageApi = {
  getNodes: () => {
    return api.get('/storage/nodes')
  },

  createNode: (name, parentId) => {
    return api.post('/storage/nodes', { name, parentId })
  },

  getNode: (nodeId) => {
    return api.get(`/storage/nodes/${nodeId}`)
  },

  updateNode: (nodeId, data) => {
    return api.put(`/storage/nodes/${nodeId}`, data)
  },

  deleteNode: (nodeId) => {
    return api.delete(`/storage/nodes/${nodeId}`)
  },

  updateNodeStatus: (nodeId, status) => {
    return api.put(`/storage/nodes/${nodeId}/status`, { status })
  },

  getStatus: () => {
    return api.get('/storage/status')
  },
}

export default api
