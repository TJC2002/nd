import SparkMD5 from 'spark-md5'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const CHUNK_SIZE = 4 * 1024 * 1024
const CONCURRENT_UPLOADS = 3

const api = axios.create()

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.satoken = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

class UploadService {
  constructor() {
    this.abortControllers = new Map()
  }

  async calculateFileHash(file) {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()
      const chunkSize = 2 * 1024 * 1024
      let currentChunk = 0
      const chunks = Math.ceil(file.size / chunkSize)

      fileReader.onload = (e) => {
        spark.append(e.target.result)
        currentChunk++

        if (currentChunk < chunks) {
          loadNext()
        } else {
          resolve(spark.end())
        }
      }

      fileReader.onerror = reject

      const loadNext = () => {
        const start = currentChunk * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        fileReader.readAsArrayBuffer(file.slice(start, end))
      }

      loadNext()
    })
  }

  async checkFileExist(hash, fileName, fileSize, fileType) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/files/check`, {
        hash,
        name: fileName,
        size: fileSize,
        type: fileType,
      })
      return response.data
    } catch (error) {
      console.error('检查文件是否存在失败:', error)
      return { exist: false }
    }
  }

  async initializeUpload(fileInfo, chunkSize, totalChunks, parentFolderId) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/files/upload/init`, {
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        hash: fileInfo.hash,
        chunkSize,
        totalChunks,
        parentFolderId,
      })
      return response.data
    } catch (error) {
      console.error('初始化上传失败:', error)
      throw error
    }
  }

  async uploadChunk(uploadId, chunkIndex, chunkData, onProgress) {
    const formData = new FormData()
    formData.append('uploadId', uploadId)
    formData.append('chunkIndex', chunkIndex)
    formData.append('chunkData', chunkData)

    const controller = new AbortController()
    this.abortControllers.set(`${uploadId}-${chunkIndex}`, controller)

    try {
      const response = await api.post(`${API_BASE_URL}/api/files/upload/chunk`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
        signal: controller.signal,
        })
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('上传已取消')
      } else {
        console.error('分片上传失败:', error)
      }
      throw error
    } finally {
      this.abortControllers.delete(`${uploadId}-${chunkIndex}`)
    }
  }

  async completeUpload(uploadId, fileName, hash) {
    try {
      const response = await api.post(`${API_BASE_URL}/api/files/upload/complete`, {
        uploadId,
        fileName,
        hash,
      })
      return response
    } catch (error) {
      console.error('完成上传失败:', error)
      throw error
    }
  }

  async getUploadStatus(uploadId) {
    try {
      const response = await api.get(`${API_BASE_URL}/api/files/upload/status/${uploadId}`)
      return response.data
    } catch (error) {
      console.error('获取上传状态失败:', error)
      throw error
    }
  }

  async cancelUpload(uploadId) {
    try {
      await api.post(`${API_BASE_URL}/api/files/upload/cancel/${uploadId}`)
    } catch (error) {
      console.error('取消上传失败:', error)
      throw error
    }
  }

  cancelAllChunks(uploadId) {
    this.abortControllers.forEach((controller, key) => {
      if (key.startsWith(`${uploadId}-`)) {
        controller.abort()
      }
    })
  }

  async uploadFile(file, parentFolderId, onProgress, onSpeedUpdate) {
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const chunkSize = CHUNK_SIZE
    const totalChunks = Math.ceil(file.size / chunkSize)

    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
    }

    try {
      onProgress({ status: 'hashing', progress: 0, speed: 0 })

      const hash = await this.calculateFileHash(file)
      fileInfo.hash = hash

      onProgress({ status: 'checking', progress: 10, speed: 0 })

      const checkResult = await this.checkFileExist(hash, file.name, file.size, file.type)

      if (checkResult.exist) {
        onProgress({ status: 'completed', progress: 100, speed: 0 })
        return {
          taskId,
          fileId: checkResult.fileId,
          fileName: file.name,
          fileSize: file.size,
          status: 'completed',
          progress: 100,
          speed: 0,
          isInstant: true,
        }
      }

      onProgress({ status: 'initializing', progress: 20, speed: 0 })

      const initResult = await this.initializeUpload(fileInfo, chunkSize, totalChunks, parentFolderId)
      const uploadId = initResult.data.uploadId

      onProgress({ status: 'uploading', progress: 20, speed: 0 })

      const startTime = Date.now()
      let uploadedBytes = 0
      let lastUpdateTime = startTime

      const uploadChunkWithRetry = async (chunkIndex, retries = 3) => {
        const start = chunkIndex * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            await this.uploadChunk(uploadId, chunkIndex, chunk, (chunkProgress) => {
              const chunkBytes = (end - start) * (chunkProgress / 100)
              uploadedBytes += chunkBytes

              const currentTime = Date.now()
              const timeElapsed = (currentTime - lastUpdateTime) / 1000

              if (timeElapsed >= 0.5) {
                const speed = uploadedBytes / timeElapsed
                const totalProgress = 20 + (chunkIndex / totalChunks) * 70
                onProgress({ status: 'uploading', progress: totalProgress, speed })
                if (onSpeedUpdate) {
                  onSpeedUpdate(speed)
                }
                uploadedBytes = 0
                lastUpdateTime = currentTime
              }
            })
            return
          } catch (error) {
            if (attempt === retries - 1) {
              throw error
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          }
        }
      }

      const uploadPromises = []
      for (let i = 0; i < totalChunks; i++) {
        if (i % CONCURRENT_UPLOADS === 0) {
          await Promise.all(uploadPromises)
          uploadPromises.length = 0
        }
        uploadPromises.push(uploadChunkWithRetry(i))
      }
      await Promise.all(uploadPromises)

      onProgress({ status: 'merging', progress: 90, speed: 0 })

      const completeResult = await this.completeUpload(uploadId, file.name, hash)

      onProgress({ status: 'completed', progress: 100, speed: 0 })

      return {
        taskId,
        fileId: completeResult.data.fileId,
        fileName: file.name,
        fileSize: file.size,
        status: 'completed',
        progress: 100,
        speed: 0,
        isInstant: false,
      }
    } catch (error) {
      onProgress({ status: 'failed', progress: 0, speed: 0 })
      throw error
    }
  }

  formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s'
    const k = 1024
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default new UploadService()
