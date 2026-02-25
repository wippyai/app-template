import { inject } from 'vue'
import { HOST_API, AXIOS_INSTANCE, ON_SUBSCRIPTION, WIPPY_CONFIG } from '../constants'
import type { HostApi, ProxyApiInstance, OnSubscription, WippyConfig } from '../types/wippy'

export function useHost(): HostApi {
  const host = inject(HOST_API)
  if (!host) throw new Error('HostApi not provided')
  return host
}

export function useApi(): ProxyApiInstance {
  const api = inject(AXIOS_INSTANCE)
  if (!api) throw new Error('ProxyApiInstance not provided')
  return api
}

export function useOn(): OnSubscription {
  const on = inject(ON_SUBSCRIPTION)
  if (!on) throw new Error('OnSubscription not provided')
  return on
}

export function useConfig(): WippyConfig {
  const config = inject(WIPPY_CONFIG)
  if (!config) throw new Error('WippyConfig not provided')
  return config
}
