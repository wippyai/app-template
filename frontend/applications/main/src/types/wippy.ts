import type { AxiosInstance } from 'axios'

export interface WippyConfig {
  path?: string
  artifactId?: string
  auth?: { token: string; expiresAt: string }
  customization?: {
    customCSS?: string
    cssVariables?: Record<string, string>
  }
  feature?: {
    session?: { type: string }
    routePrefix?: string
  }
}

export interface HostApi {
  toast(options: { severity: string; summary: string; detail?: string; life?: number }): void
  confirm(options: {
    message: string
    header?: string
    icon?: string
    acceptLabel?: string
    rejectLabel?: string
  }): Promise<boolean>
  handleError(type: 'auth-expired' | 'other', error: unknown): void
  navigate(url: string): void
  onRouteChanged(internalRoute: string): void
  startChat(token: string, options?: { sidebar?: boolean }): void
  openSession(sessionUUID: string, options?: { sidebar?: boolean }): void
  logout(): void
}

export type OnSubscription = (
  pattern: string,
  callback: (event: { path?: string; message?: unknown }) => void,
) => void

export type ProxyApiInstance = AxiosInstance

export interface Wippy {
  config(): Promise<WippyConfig>
  host(): Promise<HostApi>
  api(): Promise<ProxyApiInstance>
  form(): Promise<unknown>
  on(): Promise<OnSubscription>
}

declare global {
  interface Window {
    $W: Wippy
  }
}
