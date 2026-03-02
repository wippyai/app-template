import { useProps, useEvents, usePropsErrors } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'

// Domain-specific events for this component
export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  'upload-complete': { fileId: string, status: string }
  'upload-error': { fileId: string, error: string }
  'upload-progress': { fileId: string, progress: number }
  'uploads-loaded': { count: number }
}

// Typed composable helpers for this component's Vue components
export const useComponentProps = () => useProps<ComponentProps>()
export const useComponentEvents = () => useEvents<Events>()
export const useComponentPropsErrors = usePropsErrors

export const DEFAULT_COMPONENT_PROPS = {
  apiEndpoint: '/api/v1/uploads',
  authToken: '',
  maxFileSize: 104857600, // 100MB
  allowedTypes: [] as string[],
  maxConcurrentUploads: 3,
  pageSize: 20,
  enableRealTimeUpdates: true,
  theme: 'auto' as 'auto' | 'light' | 'dark',
}
