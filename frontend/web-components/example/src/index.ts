import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './app/app.vue'
import { createAppRouter } from './router'
import { HOST_API, AXIOS_INSTANCE, ON_SUBSCRIPTION, WIPPY_CONFIG } from './constants'
import './theme-config.css'
import './styles.css'

import type { WippyConfig, HostApi, ProxyApiInstance, OnSubscription } from './types/wippy'

async function bootstrap() {
  let config: WippyConfig = {}
  let host: HostApi | null = null
  let api: ProxyApiInstance | null = null
  let on: OnSubscription | null = null

  if (window.$W) {
    try {
      config = await window.$W.config()
      host = await window.$W.host()
      api = await window.$W.api()
      on = await window.$W.on()
    } catch (e) {
      console.warn('$W init failed:', e)
    }
  }

  const noopHost: HostApi = {
    toast: () => {},
    confirm: () => Promise.resolve(false),
    handleError: (_type, e) => console.error(e),
    navigate: () => {},
    onRouteChanged: () => {},
    startChat: () => {},
    openSession: () => {},
    logout: () => {},
  }

  const activeHost = host ?? noopHost

  const app = createApp(App)

  app.use(PrimeVue, { theme: 'none' })

  const router = createAppRouter(activeHost, on, config.path)
  app.use(router)

  app.provide(HOST_API, activeHost)
  app.provide(WIPPY_CONFIG, config)
  if (api) app.provide(AXIOS_INSTANCE, api)
  if (on) app.provide(ON_SUBSCRIPTION, on)

  app.mount('#app')
}

bootstrap()
