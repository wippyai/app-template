import { createMemoryHistory, createRouter } from 'vue-router'
import type { Router } from 'vue-router'
import type { HostApi, OnSubscription } from '../types/wippy'

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
]

export function createAppRouter(host: HostApi, on: OnSubscription | null, startPath?: string): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

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

  if (startPath) {
    const normalized = startPath.startsWith('/') ? startPath : '/' + startPath
    if (normalized !== '/') {
      router.push(normalized)
    }
  }

  return router
}
