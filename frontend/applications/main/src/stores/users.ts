import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  user_id: string
  email: string
  full_name: string
  status: string
  security_groups: string[]
  created_at: number
}

export const useUsersStore = defineStore('users', () => {
  const list = ref<User[]>([])

  return { list }
}, {
  wippyPersist: {
    pick: ['list'],
  },
})
