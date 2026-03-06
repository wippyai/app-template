<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import { useApi, useHost, useWippy } from '../composables/useWippy'

const router = useRouter()
const route = useRoute()
const api = useApi()
const host = useHost()
const instance = useWippy()

const logoUrl = computed(() => '/app/wippy-logo.svg')
const collapsed = ref(false)

instance.on('action:navigate', (data: any) => {
  const path = data?.data?.path || data?.path
  if (path) router.push(path)
})

const navItems = [
  { path: '/', name: 'home', label: 'Home', icon: 'tabler:home' },
  { path: '/users', name: 'users', label: 'Users', icon: 'tabler:users' },
  { path: '/components', name: 'components', label: 'Components', icon: 'tabler:components' },
]

const currentName = computed(() => route.name)
const currentUser = ref<{ email: string; full_name: string } | null>(null)
const wippyToken = ref<string | null>(null)

function navigate(path: string) {
  router.push(path)
}

function userInitials(user: { email: string; full_name: string }): string {
  if (user.full_name) {
    return user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }
  return user.email.charAt(0).toUpperCase()
}

async function fetchMe() {
  try {
    const { data } = await api.get('/api/v1/user/me')
    if (data.success && data.user) {
      currentUser.value = { email: data.user.email, full_name: data.user.full_name }
    }
  } catch {
    // silently fail
  }
}

async function fetchWippyAgent() {
  try {
    const { data } = await api.get('/api/v1/agents/list')
    if (data.success && data.agents) {
      const primary = data.agents.find((a: { class: string[] }) =>
        a.class && a.class.includes('primary')
      )
      if (primary) {
        wippyToken.value = primary.start_token
      }
    }
  } catch {
    // silently fail
  }
}

function openWippy() {
  if (wippyToken.value) {
    host.startChat(wippyToken.value, { sidebar: true })
  }
}

function logout() {
  host.logout()
}

onMounted(() => {
  fetchMe()
  fetchWippyAgent()
})
</script>

<template>
  <div class="h-full flex">
    <aside
      aria-label="App sidebar"
      class="shrink-0 h-full border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 flex flex-col transition-all duration-200"
      :class="collapsed ? 'w-14' : 'w-56'"
    >
      <div class="px-3 py-4 flex items-center" :class="collapsed ? 'justify-center' : 'gap-2.5 px-4'">
        <button class="shrink-0" @click="collapsed = !collapsed" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <img :src="logoUrl" alt="Wippy" class="w-8 h-8 rounded-lg" />
        </button>
        <span v-if="!collapsed" class="text-sm font-bold text-surface-900 dark:text-surface-0 tracking-tight">Wippy</span>
      </div>

      <nav aria-label="Main navigation" class="flex-1 px-1.5 py-1 space-y-0.5" :class="{ 'px-2': !collapsed }">
        <button
          v-for="item in navItems"
          :key="item.name"
          class="w-full flex items-center rounded-lg text-sm transition-colors"
          :class="[
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
            currentName === item.name
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
          ]"
          :aria-current="currentName === item.name ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
          @click="navigate(item.path)"
        >
          <Icon :icon="item.icon" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
          <span v-if="!collapsed">{{ item.label }}</span>
        </button>
      </nav>

      <div v-if="wippyToken" class="px-1.5 py-2" :class="{ 'px-2': !collapsed }">
        <button
          class="w-full flex items-center rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          :class="collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'"
          :title="collapsed ? 'Ask Wippy' : undefined"
          @click="openWippy"
        >
          <Icon icon="tabler:message-circle" class="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
          <span v-if="!collapsed">Ask Wippy</span>
        </button>
      </div>

      <div class="px-2 py-3 border-t border-surface-200 dark:border-surface-700" :class="{ 'px-3': !collapsed }">
        <div v-if="currentUser && !collapsed" class="flex items-center gap-2.5">
          <Avatar :label="userInitials(currentUser)" shape="circle" class="bg-primary/10 text-primary text-xs font-semibold shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">{{ currentUser.full_name || currentUser.email }}</div>
            <div v-if="currentUser.full_name" class="text-[11px] text-surface-400 truncate">{{ currentUser.email }}</div>
          </div>
          <Button
            text
            rounded
            class="!p-1.5 shrink-0"
            aria-label="Sign out"
            @click="logout"
          >
            <template #icon><Icon icon="tabler:logout" class="w-4 h-4" aria-hidden="true" /></template>
          </Button>
        </div>
        <div v-else-if="currentUser && collapsed" class="flex justify-center">
          <button
            class="shrink-0"
            :title="currentUser.full_name || currentUser.email"
            @click="logout"
          >
            <Avatar :label="userInitials(currentUser)" shape="circle" class="bg-primary/10 text-primary text-xs font-semibold" />
          </button>
        </div>
        <div v-else class="flex items-center gap-2 text-[11px] text-surface-400" :class="{ 'justify-center': collapsed }">
          <Icon icon="tabler:circle-filled" class="w-2 h-2 text-primary" aria-hidden="true" />
          <span v-if="!collapsed">Connected</span>
        </div>
      </div>
    </aside>

    <main class="flex-1 h-full overflow-y-auto" style="background: color-mix(in srgb, var(--p-content-background) 94%, var(--p-text-color) 6%)">
      <router-view />
    </main>
  </div>
</template>
