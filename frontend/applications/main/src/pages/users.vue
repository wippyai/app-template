<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Avatar from 'primevue/avatar'
import { useApi, useHost } from '../composables/useWippy'

const api = useApi()
const host = useHost()

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending', value: 'pending' },
]

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

function userInitial(user: User): string {
  return (user.full_name || user.email).charAt(0).toUpperCase()
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
      host.toast({ severity: 'success', summary: 'User created' })
      await fetchUsers()
    }
  } catch {
    host.toast({ severity: 'error', summary: 'Failed to create user' })
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
    host.toast({ severity: 'success', summary: 'User updated' })
    await fetchUsers()
  } catch {
    host.toast({ severity: 'error', summary: 'Failed to update user' })
  }
}

async function confirmDelete(user: User) {
  const name = user.full_name || user.email
  const confirmed = await host.confirm({
    header: 'Delete User',
    html: `<div class="flex items-start gap-3">
      <iconify-icon icon="tabler:alert-triangle" width="24" style="color: var(--p-danger-500); margin-top: 2px; flex-shrink: 0;"></iconify-icon>
      <div>
        <p style="font-weight: 500; margin: 0 0 4px 0;">Delete "${name}"?</p>
        <p style="font-size: 0.75rem; color: var(--p-text-muted-color); margin: 0;">This will permanently delete the user and revoke all access. This action cannot be undone.</p>
      </div>
    </div>`,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', text: true },
  })
  if (confirmed) await executeDelete(user)
}

async function executeDelete(user: User) {
  try {
    const { data } = await api.delete(`/api/v1/users/${user.user_id}`)
    if (data.success) {
      host.toast({ severity: 'success', summary: 'User deleted' })
      await fetchUsers()
    }
  } catch {
    host.toast({ severity: 'error', summary: 'Failed to delete user' })
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
            <Icon icon="tabler:users" class="w-5 h-5 text-primary-contrast" aria-hidden="true" />
          </div>
          <div>
            <h1 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Users</h1>
            <p class="text-[11px] text-surface-400">{{ users.length }} user{{ users.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>
        <Button label="Create User" size="small" @click="showCreate = true">
          <template #icon><Icon icon="tabler:plus" class="w-4 h-4" aria-hidden="true" /></template>
        </Button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <DataTable
        v-if="users.length > 0"
        :value="users"
        :loading="loading"
        dataKey="user_id"
        :pt="{ bodyRow: { class: 'group' } }"
        class="text-sm"
      >
        <Column header="User" field="full_name">
          <template #body="{ data: user }">
            <div class="flex items-center gap-3">
              <Avatar :label="userInitial(user)" shape="circle" class="bg-primary/10 text-primary text-xs font-semibold" />
              <div class="min-w-0">
                <div class="text-surface-900 dark:text-surface-0 font-medium truncate">{{ user.full_name || '-' }}</div>
                <div class="text-[11px] text-surface-400 truncate">{{ user.email }}</div>
              </div>
            </div>
          </template>
        </Column>
        <Column header="Status" field="status">
          <template #body="{ data: user }">
            <Tag :value="user.status" :severity="statusSeverity(user.status)" class="text-[10px]" />
          </template>
        </Column>
        <Column header="Groups" field="security_groups">
          <template #body="{ data: user }">
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
          </template>
        </Column>
        <Column header="Created" field="created_at">
          <template #body="{ data: user }">
            <span class="text-xs text-surface-400">{{ formatDate(user.created_at) }}</span>
          </template>
        </Column>
        <Column headerStyle="width: 6rem">
          <template #body="{ data: user }">
            <div class="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                text
                rounded
                class="!p-1.5"
                @click.stop="openEdit(user)"
                :aria-label="`Edit ${user.full_name || user.email}`"
              >
                <template #icon><Icon icon="tabler:edit" class="w-4 h-4" aria-hidden="true" /></template>
              </Button>
              <Button
                text
                rounded
                severity="danger"
                class="!p-1.5"
                @click.stop="confirmDelete(user)"
                :aria-label="`Delete ${user.full_name || user.email}`"
              >
                <template #icon><Icon icon="tabler:trash" class="w-4 h-4" aria-hidden="true" /></template>
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>

      <div v-else-if="!loading" class="h-full flex items-center justify-center">
        <div class="text-center">
          <Icon icon="tabler:users" class="w-10 h-10 text-surface-300 dark:text-surface-600 mx-auto mb-2" aria-hidden="true" />
          <p class="text-sm text-surface-400 mb-3">No users yet</p>
          <Button label="Create your first user" size="small" @click="showCreate = true" />
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showCreate" header="Create User" :style="{ width: '460px' }" modal>
      <form @submit.prevent="createUser" class="space-y-4">
        <div>
          <label for="create-email" class="block mb-1 text-xs font-medium text-muted-color">Email</label>
          <InputText id="create-email" v-model="createForm.email" type="email" placeholder="user@example.com" fluid />
        </div>
        <div>
          <label for="create-name" class="block mb-1 text-xs font-medium text-muted-color">Full Name</label>
          <InputText id="create-name" v-model="createForm.full_name" placeholder="Jane Doe" fluid />
        </div>
        <div>
          <label for="create-password" class="block mb-1 text-xs font-medium text-muted-color">Password</label>
          <Password v-model="createForm.password" inputId="create-password" placeholder="Minimum 8 characters" :feedback="false" fluid toggleMask />
        </div>
        <div>
          <span class="block mb-1 text-xs font-medium text-muted-color">Security Groups</span>
          <div class="space-y-2 mt-1.5" role="group" aria-label="Security groups">
            <label v-for="sg in SECURITY_GROUPS" :key="sg.id" class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-300">
              <Checkbox v-model="createForm.groups" :value="sg.id" :aria-label="sg.label" />
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
          <label for="edit-email" class="block mb-1 text-xs font-medium text-muted-color">Email</label>
          <InputText id="edit-email" v-model="editForm.email" type="email" fluid />
        </div>
        <div>
          <label for="edit-name" class="block mb-1 text-xs font-medium text-muted-color">Full Name</label>
          <InputText id="edit-name" v-model="editForm.full_name" fluid />
        </div>
        <div>
          <label for="edit-status" class="block mb-1 text-xs font-medium text-muted-color">Status</label>
          <Select v-model="editForm.status" inputId="edit-status" :options="STATUS_OPTIONS" optionLabel="label" optionValue="value" fluid aria-label="User status" />
        </div>
        <div>
          <label for="edit-password" class="block mb-1 text-xs font-medium text-muted-color">New Password</label>
          <Password v-model="editForm.password" inputId="edit-password" placeholder="Leave empty to keep current" :feedback="false" fluid toggleMask />
        </div>
        <div>
          <span class="block mb-1 text-xs font-medium text-muted-color">Security Groups</span>
          <div class="space-y-2 mt-1.5" role="group" aria-label="Security groups">
            <label v-for="sg in SECURITY_GROUPS" :key="sg.id" class="flex items-center gap-2 cursor-pointer text-surface-700 dark:text-surface-300">
              <Checkbox v-model="editForm.groups" :value="sg.id" :aria-label="sg.label" />
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

  </div>
</template>
