export interface Upload {
  uuid: string
  created_at: string
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'error'
  size: number
  mime_type: string
  meta?: {
    filename?: string
    page_count?: number
  }
  metadata?: {
    filename?: string
  }
  error?: string
  stage?: string
  timestamp?: string
}

export interface ProcessingUpload {
  uuid: string
  filename: string
  status: string
  stage?: string
  timestamp: string
}

export interface UploadResponse {
  success: boolean
  uuid?: string
  error?: string
  upload?: Upload
}

export interface UploadListResponse {
  success: boolean
  uploads: Upload[]
  meta: {
    total: number
    limit: number
    offset: number
  }
  error?: string
}

export interface ComponentProps {
  allowedTypes?: string[]
  maxFileSize?: number
}

export interface UploadProgress {
  total: number
  completed: number
  failed: number
}

export interface FileWithProgress extends File {
  progress?: number
  error?: string
}

// Event interfaces for real-time updates
export interface UploadEvent {
  uuid: string
  status: string
  stage?: string
  timestamp: string
  error?: string
}