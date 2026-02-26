import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DateTime } from 'luxon'
import type { 
  Upload, 
  ProcessingUpload, 
  UploadResponse, 
  UploadListResponse, 
  ComponentProps,
  UploadProgress,
  FileWithProgress,
} from '../types'

import { api, host, on } from '@wippy-fe/proxy'

export const useUploadsStore = defineStore('uploads', () => {
  // State
  const isLoading = ref(false)
  const isDragging = ref(false)
  const isUploading = ref(false)
  const uploadQueue = ref<FileWithProgress[]>([])
  const uploads = ref<Upload[]>([])
  const processingUploads = ref<ProcessingUpload[]>([])
  const totalItems = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const processing = ref<UploadProgress>({
    total: 0,
    completed: 0,
    failed: 0
  })
  
  const uploadSubscriptionUnsubscribers = ref<Record<string, () => void>>({})
  const props = ref<ComponentProps>({
    apiEndpoint: '/api/v1/uploads',
    authToken: '',
    maxFileSize: 104857600, // 100MB
    allowedTypes: [],
    maxConcurrentUploads: 3,
    pageSize: 20,
    enableRealTimeUpdates: true,
    theme: 'auto'
  })

  // Computed
  const startItem = computed(() => (currentPage.value - 1) * pageSize.value + 1)
  const endItem = computed(() => Math.min(startItem.value + pageSize.value - 1, totalItems.value))

  // Actions
  function initializeProps(newProps: Partial<ComponentProps>) {
    props.value = { ...props.value, ...newProps }
    pageSize.value = props.value.pageSize
  }

  function addFilesToQueue(files: File[]) {
    if (files.length === 0) return

    // Validate files
    const validFiles: FileWithProgress[] = []
    for (const file of files) {
      // Check file size
      if (file.size > props.value.maxFileSize) {
        console.warn(`File ${file.name} exceeds maximum size limit`)
        continue
      }

      // Check file type if restrictions are set
      if (props.value.allowedTypes.length > 0 && !props.value.allowedTypes.includes(file.type)) {
        console.warn(`File ${file.name} type ${file.type} is not allowed`)
        continue
      }

      validFiles.push(file)
    }

    uploadQueue.value = [...uploadQueue.value, ...validFiles]
  }

  async function clearFileSelection() {
    if (isUploading.value) {
      try {
        const result = await host.confirm({
          message: "Uploads are in progress. Do you want to clear the remaining queued files?",
          header: 'Clear Uploads',
          icon: 'tabler:alert-triangle',
          acceptLabel: 'Clear Queue',
          rejectLabel: 'Cancel',
          acceptClass: 'p-button-warning',
          rejectClass: 'p-button-secondary'
        })

        if (!result) return
      } catch (error) {
        console.error('Confirmation dialog error:', error)
        return
      }

      uploadQueue.value = []
      processing.value = { total: 0, completed: 0, failed: 0 }
    } else {
      uploadQueue.value = []
      processing.value = { total: 0, completed: 0, failed: 0 }
    }
  }

  async function startUpload() {
    if (uploadQueue.value.length === 0 || isUploading.value) return

    isUploading.value = true
    processing.value.total = uploadQueue.value.length
    processing.value.completed = 0
    processing.value.failed = 0

    try {
      const maxConcurrent = props.value.maxConcurrentUploads

      for (let i = 0; i < uploadQueue.value.length; i += maxConcurrent) {
        const batch = uploadQueue.value.slice(i, i + maxConcurrent)
        await Promise.all(batch.map(file => uploadFile(file)))

        if (i + maxConcurrent < uploadQueue.value.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      uploadQueue.value = []
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      isUploading.value = false
    }
  }

  async function uploadFile(file: FileWithProgress): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(`${props.value.apiEndpoint}`, formData, {
        headers: {
          'Authorization': `Bearer ${props.value.authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      const result: UploadResponse = response.data

      if (!result.success || !result.uuid) {
        throw new Error(result.error || 'Upload failed')
      }

      addProcessingUpload({
        uuid: result.uuid,
        filename: file.name,
        status: 'uploading',
        timestamp: new Date().toISOString()
      })

      const processingTimeout = setTimeout(() => {
        const stillProcessing = processingUploads.value.find(u => u.uuid === result.uuid)
        if (stillProcessing) {
          handleFileProcessingError(result.uuid!, file.name, 'Processing timeout')
        }
      }, 300000) // 5 minutes timeout

      if (props.value.enableRealTimeUpdates) {
        subscribeToUploadEvents(result.uuid, file.name, processingTimeout)
      }

      processing.value.completed++
      return result
    } catch (error) {
      processing.value.failed++
      console.error(`Upload failed for ${file.name}:`, error)

      uploads.value.unshift({
        uuid: 'local-' + Date.now(),
        created_at: new Date().toISOString(),
        status: 'failed',
        size: file.size,
        meta: { filename: file.name },
        mime_type: file.type || 'application/octet-stream'
      })

      throw error
    }
  }

  function addProcessingUpload(upload: ProcessingUpload) {
    const existingIndex = processingUploads.value.findIndex(u => u.uuid === upload.uuid)
    if (existingIndex >= 0) {
      processingUploads.value[existingIndex] = { ...processingUploads.value[existingIndex], ...upload }
    } else {
      processingUploads.value.push(upload)
    }
  }

  function removeProcessingUpload(uuid: string) {
    processingUploads.value = processingUploads.value.filter(u => u.uuid !== uuid)
  }

  function subscribeToUploadEvents(uuid: string, filename: string, processingTimeout?: ReturnType<typeof setTimeout>) {
    if (uploadSubscriptionUnsubscribers.value[uuid]) return

    console.log(`Subscribing to upload events for ${uuid}`)

    const handleUploadEvent = (data: any) => {
      if (!data || !data.data) return

      const eventData = data.data
      console.log(`Upload event for ${uuid}:`, eventData)

      addProcessingUpload({
        uuid: eventData.uuid,
        filename,
        status: eventData.status,
        stage: eventData.stage,
        timestamp: eventData.timestamp
      })

      if (eventData.error) {
        handleFileProcessingError(uuid, filename, eventData.error)
        if (processingTimeout) clearTimeout(processingTimeout)
        return
      }

      if (['completed', 'failed', 'error'].includes(eventData.status)) {
        fetchUploadDetails(uuid)
        setTimeout(() => removeProcessingUpload(uuid), 100)
        unsubscribeFromUploadEvents(uuid)
        if (processingTimeout) clearTimeout(processingTimeout)
      }
    }
    uploadSubscriptionUnsubscribers.value[uuid] = on(`upload:${uuid}`, handleUploadEvent)
  }

  function unsubscribeFromUploadEvents(uuid: string) {
    if (!uploadSubscriptionUnsubscribers.value[uuid]) return

    console.log(`Unsubscribing from upload events for ${uuid}`)
    uploadSubscriptionUnsubscribers.value[uuid]()
    delete uploadSubscriptionUnsubscribers.value[uuid]
  }

  function handleFileProcessingError(uuid: string, filename: string, errorMessage: string) {
    console.error(`Processing error for ${filename}: ${errorMessage}`)

    uploads.value.unshift({
      uuid,
      created_at: new Date().toISOString(),
      status: 'failed',
      error: errorMessage,
      meta: { filename },
      size: 0,
      mime_type: 'application/octet-stream'
    })

    removeProcessingUpload(uuid)
    unsubscribeFromUploadEvents(uuid)
    totalItems.value++
    totalPages.value = Math.ceil(totalItems.value / pageSize.value)
  }

  async function fetchUploadDetails(uuid: string) {
    try {
      const response = await api.get(`${props.value.apiEndpoint}/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${props.value.authToken}`
        }
      })

      const result: UploadResponse = response.data

      if (!result.success || !result.upload) {
        throw new Error(result.error || 'Failed to fetch upload')
      }

      const existingIndex = uploads.value.findIndex(u => u.uuid === result.upload!.uuid)
      if (existingIndex >= 0) {
        uploads.value[existingIndex] = result.upload
      } else {
        uploads.value.unshift(result.upload)
        totalItems.value++
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      }
    } catch (error) {
      console.error(`Failed to fetch upload ${uuid}:`, error)
    }
  }

  async function fetchUploads() {
    isLoading.value = true

    try {
      const offset = (currentPage.value - 1) * pageSize.value
      const response = await api.get(
        `${props.value.apiEndpoint}/list?limit=${pageSize.value}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${props.value.authToken}`
          }
        }
      )

      const result: UploadListResponse = response.data

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch uploads')
      }

      if (result.meta) {
        totalItems.value = result.meta.total
        totalPages.value = Math.ceil(totalItems.value / pageSize.value)
      }

      uploads.value = result.uploads || []

      const processingUploads = uploads.value.filter(
        upload => ['queued', 'uploading', 'processing'].includes(upload.status)
      )

      processingUploads.forEach(upload => {
        addProcessingUpload({
          uuid: upload.uuid,
          filename: getFilename(upload),
          status: upload.status,
          timestamp: upload.created_at
        })

        if (props.value.enableRealTimeUpdates) {
          subscribeToUploadEvents(upload.uuid, getFilename(upload))
        }
      })
    } catch (error) {
      console.error('Failed to fetch uploads:', error)
      uploads.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUpload(upload: Upload) {

    try {
      const result = await host.confirm({
        message: `Are you sure you want to delete "${getFilename(upload)}"?`,
        header: 'Confirm Deletion',
        icon: 'tabler:trash',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary'
      })

      if (!result) return

      const response = await api.delete(`${props.value.apiEndpoint}/${upload.uuid}`, {
        headers: {
          'Authorization': `Bearer ${props.value.authToken}`
        }
      })

      const deleteResult: UploadResponse = response.data

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete upload')
      }

      uploads.value = uploads.value.filter(u => u.uuid !== upload.uuid)
      totalItems.value--
      totalPages.value = Math.ceil(totalItems.value / pageSize.value)

      if (uploads.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
        await fetchUploads()
      }
    } catch (error) {
      console.error('Failed to delete upload:', error)
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
      fetchUploads()
    }
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      fetchUploads()
    }
  }

  function handlePageSizeChange(newPageSize: number) {
    pageSize.value = newPageSize
    currentPage.value = 1
    fetchUploads()
  }

  // Helper functions
  function getFilename(upload: Upload): string {
    return (upload.meta && upload.meta.filename) ||
           (upload.metadata && upload.metadata.filename) ||
           'Unknown file'
  }

  function getTruncatedFilename(filename: string, maxLength = 30): string {
    if (!filename || filename.length <= maxLength) return filename

    const ext = filename.lastIndexOf('.') > -1 ? filename.substring(filename.lastIndexOf('.')) : ''
    const name = filename.substring(0, filename.lastIndexOf('.') > -1 ? filename.lastIndexOf('.') : filename.length)
    return name.substring(0, maxLength - ext.length - 3) + '...' + ext
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function formatTotalSize(): string {
    const totalSize = uploadQueue.value.reduce((sum, file) => sum + file.size, 0)
    return formatFileSize(totalSize)
  }

  function formatDate(dateString: string): string {
    try {
      const date = DateTime.fromISO(dateString)
      return date.toLocaleString(DateTime.DATETIME_SHORT)
    } catch {
      return 'Invalid date'
    }
  }

  function getStatusColor(status: string): string {
    switch(status) {
      case 'uploaded':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
      case 'queued':
        return 'bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-200'
    }
  }

  function getFileIcon(mimeType: string): string {
    let icon = 'tabler:file'

    if (!mimeType) return icon

    if (mimeType.startsWith('image/')) {
      icon = 'tabler:file-image'
    } else if (mimeType.startsWith('video/')) {
      icon = 'tabler:file-video'
    } else if (mimeType.startsWith('audio/')) {
      icon = 'tabler:file-audio'
    } else if (mimeType === 'application/pdf') {
      icon = 'tabler:file-type-pdf'
    } else if (mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      icon = 'tabler:file-type-doc'
    } else if (mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      icon = 'tabler:file-type-xls'
    } else if (mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      icon = 'tabler:file-type-ppt'
    } else if (mimeType === 'application/zip' ||
      mimeType === 'application/x-zip-compressed' ||
      mimeType === 'application/x-rar-compressed') {
      icon = 'tabler:file-zip'
    } else if (mimeType === 'text/plain') {
      icon = 'tabler:file-text'
    } else if (mimeType === 'text/html' || mimeType === 'application/xhtml+xml') {
      icon = 'tabler:file-code'
    } else if (mimeType === 'application/json') {
      icon = 'tabler:file-json'
    }

    return icon
  }

  return {
    // State
    isLoading,
    isDragging,
    isUploading,
    uploadQueue,
    uploads,
    processingUploads,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    processing,
    props,
    
    // Computed
    startItem,
    endItem,
    
    // Actions
    initializeProps,
    addFilesToQueue,
    clearFileSelection,
    startUpload,
    fetchUploads,
    deleteUpload,
    prevPage,
    nextPage,
    handlePageSizeChange,
    
    // Helper functions
    getFilename,
    getTruncatedFilename,
    formatFileSize,
    formatTotalSize,
    formatDate,
    getStatusColor,
    getFileIcon
  }
}) 