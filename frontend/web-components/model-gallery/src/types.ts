export interface ComponentProps {
  showDetails?: boolean
}

export interface Model {
  name: string
  provider: string
  description?: string
  capabilities?: string[]
}

export interface ModelsListResponse {
  success: boolean
  models: Model[]
  error?: string
}
