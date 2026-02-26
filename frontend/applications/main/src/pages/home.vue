<script setup lang="ts">
import { Icon } from '@iconify/vue'

const logoUrl = '/app/wippy-logo.svg'
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center max-w-md px-6">
      <img :src="logoUrl" alt="Wippy" class="w-16 h-16 rounded-2xl mx-auto mb-5" />
      <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Welcome to Wippy App</h1>
      <p class="text-sm text-surface-500 mb-6">
        Manage your users and interact with the Wippy AI assistant from the sidebar.
      </p>
      <div class="flex flex-col gap-3 text-left text-sm text-surface-600 dark:text-surface-400">
        <div class="flex items-start gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
          <Icon icon="tabler:users" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div class="font-medium text-surface-900 dark:text-surface-0">Users</div>
            <div class="text-xs text-surface-400">Create, edit, and manage user accounts and security groups.</div>
          </div>
        </div>
        <div class="flex items-start gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
          <Icon icon="tabler:message-circle" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div class="font-medium text-surface-900 dark:text-surface-0">Ask Wippy</div>
            <div class="text-xs text-surface-400">Chat with the AI assistant for help navigating the application.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
