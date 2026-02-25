<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import { useApi } from '../composables/useWippy'

const api = useApi()

interface User {
  user_id: string
  email: string
  full_name: string
  status: string
  security_groups: string[]
  created_at: number
}

const SECURITY_GROUPS = [
  { id: 'app.security:admin', label: 'Admin' },
  { id: 'app.security:user', label: 'User' },
]

const users = ref<User[]>([])
const loading = ref(false)

const showCreate = ref(false)
const createForm = ref({ email: '', full_name: '', password: '', groups: ['app.security:user'] as string[] })

const showEdit = ref(false)
const editForm = ref({ user_id: '', email: '', full_name: '', status: '', password: '', groups: [] as string[] })

const showDeleteConfirm = ref(false)
const deleteTarget = ref<User | null>(null)
const hoverRow = ref<string | null>(null)

function statusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' {
  switch (status) {
    case 'active': return 'success'
    case 'suspended': return 'danger'
    case 'pending': return 'warn'
    default: return 'secondary'
  }
}

function groupLabel(groupId: string): string {
  const g = SECURITY_GROUPS.find(sg => sg.id === groupId)
  return g ? g.label : groupId
}

function groupSeverity(groupId: string): 'warn' | 'info' {
  return groupId === 'app.security:admin' ? 'warn' : 'info'
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/api/v1/users')
    if (data.success) {
      users.value = data.users || []
    }
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function createUser() {
  if (!createForm.value.email || !createForm.value.password) return
  try {
    const { data } = await api.post('/api/v1/users', {
      email: createForm.value.email,
      full_name: createForm.value.full_name,
      password: createForm.value.password,
    })
    if (data.success && data.user) {
      if (createForm.value.groups.length > 0) {
        await api.put(`/api/v1/users/${data.user.user_id}/groups`, {
          groups: createForm.value.groups,
        })
      }
      createForm.value = { email: '', full_name: '', password: '', groups: ['app.security:user'] }
      showCreate.value = false
      await fetchUsers()
    }
  } catch {
    // handled by UI
  }
}

function openEdit(user: User) {
  editForm.value = {
    user_id: user.user_id,
    email: user.email,
    full_name: user.full_name,
    status: user.status,
    password: '',
    groups: [...user.security_groups],
  }
  showEdit.value = true
}

async function saveUser() {
  const userId = editForm.value.user_id
  if (!userId) return
  try {
    const updateData: Record<string, string> = {}
    if (editForm.value.email) updateData.email = editForm.value.email
    if (editForm.value.full_name) updateData.full_name = editForm.value.full_name
    if (editForm.value.status) updateData.status = editForm.value.status
    if (editForm.value.password) updateData.password = editForm.value.password

    await api.put(`/api/v1/users/${userId}`, updateData)
    await api.put(`/api/v1/users/${userId}/groups`, { groups: editForm.value.groups })

    showEdit.value = false
    await fetchUsers()
  } catch {
    // handled by UI
  }
}

function confirmDelete(user: User) {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  try {
    const { data } = await api.delete(`/api/v1/users/${deleteTarget.value.user_id}`)
    if (data.success) {
      showDeleteConfirm.value = false
      deleteTarget.value = null
      await fetchUsers()
    }
  } catch {
    // handled by UI
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-5 py-4 border-b border-surface-200 dark:border-surface-700 bg-surface-card shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Icon icon="tabler:users" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Users</h1>
            <p class="text-[11px] text-surface-400">{{ users.length }} user{{ users.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>
        <Button label="Create User" size="small" @click="showCreate = true">
          <template #icon><Icon icon="tabler:plus" class="w-4 h-4" /></template>
        </Button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <table v-if="users.length > 0" class="w-full text-sm">
        <thead class="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0">
          <tr>
            <th class="text-left px-5 py-2.5 text-xs font-medium text-surface-500 uppercase tracking-wider">User</th>
            <th class="text-left px-5 py-2.5 text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
            <th class="text-left px-5 py-2.5 text-xs font-medium text-surface-500 uppercase tracking-wider">Groups</th>
            <th class="text-left px-5 py-2.5 text-xs font-medium text-surface-500 uppercase tracking-wider">Created</th>
            <th class="w-24 px-5 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.user_id"
            class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
            @mouseenter="hoverRow = user.user_id"
            @mouseleave="hoverRow = null"
          >
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                  {{ (user.full_name || user.email).charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="text-surface-900 dark:text-surface-0 font-medium truncate">{{ user.full_name || '-' }}</div>
                  <div class="text-[11px] text-surface-400 truncate">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3">
              <Tag :value="user.status" :severity="statusSeverity(user.status)" class="text-[10px]" />
            </td>
            <td class="px-5 py-3">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="g in user.security_groups"
                  :key="g"
                  :value="groupLabel(g)"
                  :severity="groupSeverity(g)"
                  class="text-[10px]"
                />
                <span v-if="user.security_groups.length === 0" class="text-xs text-surface-400">None</span>
              </div>
            </td>
            <td class="px-5 py-3 text-xs text-surface-400">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-5 py-3">
              <div class="flex items-center gap-1 justify-end" :class="hoverRow === user.user_id ? 'opacity-100' : 'opacity-0'" style="transition: opacity 0.15s">
                <button
                  class="p-1.5 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  @click.stop="openEdit(user)"
                  title="Edit"
                >
                  <Icon icon="tabler:edit" class="w-4 h-4" />
                </button>
                <button
                  class="p-1.5 rounded text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  @click.stop="confirmDelete(user)"
                  title="Delete"
                >
                  <Icon icon="tabler:trash" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="!loading" class="h-full flex items-center justify-center">
        <div class="text-center">
          <Icon icon="tabler:users" class="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
          <p class="text-sm text-surface-400 mb-3">No users yet</p>
          <Button label="Create your first user" size="small" @click="showCreate = true" />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showCreate" header="Create User" :style="{ width: '460px' }" modal>
      <form @submit.prevent="createUser" class="space-y-4">
        <div>
          <label class="navi-label">Email</label>
          <input v-model="createForm.email" type="email" required class="navi-input" placeholder="user@example.com" />
        </div>
        <div>
          <label class="navi-label">Full Name</label>
          <input v-model="createForm.full_name" type="text" class="navi-input" placeholder="Jane Doe" />
        </div>
        <div>
          <label class="navi-label">Password</label>
          <input v-model="createForm.password" type="password" required minlength="8" class="navi-input" placeholder="Minimum 8 characters" />
        </div>
        <div>
          <label class="navi-label">Security Groups</label>
          <div class="space-y-2 mt-1.5">
            <label v-for="sg in SECURITY_GROUPS" :key="sg.id" class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-300">
              <Checkbox v-model="createForm.groups" :value="sg.id" />
              <span class="text-sm">{{ sg.label }}</span>
              <span class="text-[11px] text-surface-400 font-mono">{{ sg.id }}</span>
            </label>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="showCreate = false" />
          <Button label="Create" @click="createUser" :disabled="!createForm.email" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="showEdit" header="Edit User" :style="{ width: '460px' }" modal>
      <form @submit.prevent="saveUser" class="space-y-4">
        <div>
          <label class="navi-label">Email</label>
          <input v-model="editForm.email" type="email" class="navi-input" />
        </div>
        <div>
          <label class="navi-label">Full Name</label>
          <input v-model="editForm.full_name" type="text" class="navi-input" />
        </div>
        <div>
          <label class="navi-label">Status</label>
          <select v-model="editForm.status" class="navi-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label class="navi-label">New Password</label>
          <input v-model="editForm.password" type="password" minlength="8" placeholder="Leave empty to keep current" class="navi-input" />
        </div>
        <div>
          <label class="navi-label">Security Groups</label>
          <div class="space-y-2 mt-1.5">
            <label v-for="sg in SECURITY_GROUPS" :key="sg.id" class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-300">
              <Checkbox v-model="editForm.groups" :value="sg.id" />
              <span class="text-sm">{{ sg.label }}</span>
              <span class="text-[11px] text-surface-400 font-mono">{{ sg.id }}</span>
            </label>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="showEdit = false" />
          <Button label="Save" @click="saveUser" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="showDeleteConfirm" header="Delete User" :style="{ width: '420px' }" modal>
      <div class="flex items-start gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 shrink-0">
          <Icon icon="tabler:alert-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p class="text-sm text-surface-900 dark:text-surface-0 font-medium mb-1">Delete "{{ deleteTarget?.full_name || deleteTarget?.email }}"?</p>
          <p class="text-xs text-surface-400">This will permanently delete the user and revoke all access. This action cannot be undone.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="showDeleteConfirm = false" />
          <Button label="Delete" severity="danger" @click="executeDelete" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
