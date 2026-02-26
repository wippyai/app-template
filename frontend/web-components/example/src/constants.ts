import type { InjectionKey, Ref } from 'vue'
import type { ComponentProps } from './index.ts'

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

export type EventEmitter = <K extends keyof Events>(event: K, details: Events[K]) => void

export const EVENT_PROVIDER = Symbol('emit') as InjectionKey<EventEmitter>
export const PROPS_PROVIDER = Symbol('props') as InjectionKey<Ref<ComponentProps>>
export const PROPS_ERROR_PROVIDER = Symbol('props_error') as InjectionKey<Ref<string | null>>

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