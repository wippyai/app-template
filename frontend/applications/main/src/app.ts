import { addCollection } from '@iconify/vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import App from './app/app.vue'
import { AXIOS_INSTANCE, HOST_API, WIPPY_INSTANCE } from './constants'
import { createAppRouter } from './router'
import './theme-config.css'
import './styles.css'
import './tailwind.css'

export async function createMainApp() {
  const config = await window.$W.config()
  const hostApi = await window.$W.host()
  const axios = await window.$W.api()
  const instance = await window.$W.instance()

  const initialPath = config.path
    ? (config.path.startsWith('/') ? config.path : '/' + config.path)
    : '/'

  if (config.customization?.icons) {
    addCollection({
      prefix: 'custom',
      icons: config.customization?.icons,
    })
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(PrimeVue, { theme: 'none' })

  app.provide(HOST_API, hostApi)
  app.provide(AXIOS_INSTANCE, axios)
  app.provide(WIPPY_INSTANCE, instance)

  const router = createAppRouter(hostApi, instance.on, initialPath)
  app.use(router)

  return app
}

export async function mountApp(elementId: string = '#app') {
  const app = await createMainApp()
  app.mount(elementId)
  return app
}

mountApp()
