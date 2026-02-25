import type { InjectionKey } from 'vue'
import type { HostApi, ProxyApiInstance, OnSubscription, WippyConfig } from './types/wippy'

export const HOST_API: InjectionKey<HostApi> = Symbol('HOST_API')
export const AXIOS_INSTANCE: InjectionKey<ProxyApiInstance> = Symbol('AXIOS_INSTANCE')
export const ON_SUBSCRIPTION: InjectionKey<OnSubscription> = Symbol('ON_SUBSCRIPTION')
export const WIPPY_CONFIG: InjectionKey<WippyConfig> = Symbol('WIPPY_CONFIG')
