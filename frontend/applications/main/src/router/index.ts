import { createMemoryHistory, createRouter } from 'vue-router'
import type { Router } from 'vue-router'
import type { HostApi } from '../types'

type OnSubscription = (
  pattern: string,
  callback: (event: { path?: string; message?: unknown }) => void,
) => void

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/home.vue'),
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../pages/users.vue'),
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('../pages/components.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
]

export function createAppRouter(host: HostApi, on: OnSubscription | null, initialPath: string): Router {
  const history = createMemoryHistory()
  history.replace(initialPath)
  const router = createRouter({ history, routes })

  router.afterEach((to) => {
    host.onRouteChanged(to.fullPath)
  })

  if (on) {
    on('@history', ({ path }) => {
      if (!path) return
      const normalized = path.startsWith('/') ? path : '/' + path
      if (router.currentRoute.value.fullPath !== normalized) {
        router.push(normalized)
      }
    })
  }

  return router
}
