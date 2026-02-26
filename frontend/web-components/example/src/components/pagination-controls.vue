<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUploadsStore } from '../stores/uploads'
import { Icon } from '@iconify/vue'

// Store
const store = useUploadsStore()
const {
  currentPage,
  totalPages,
  pageSize,
} = storeToRefs(store)

// Methods from store
const {
  prevPage,
  nextPage,
  handlePageSizeChange,
} = store
</script>

<template>
  <div v-if="totalPages > 0" class="px-4 sm:px-6 py-4 border-t border-surface-200 dark:border-surface-600 flex flex-col sm:flex-row justify-between sm:items-center">
    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-3 sm:mb-0">
      <span class="text-xs text-surface-500 dark:text-surface-400 mb-2 sm:mb-0">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <div class="text-xs text-surface-500 dark:text-surface-400">
        <label for="pageSize">Items per page:</label>
        <select
          id="pageSize"
          v-model="pageSize"
          class="ml-1 bg-surface-50 dark:bg-surface-700 border-surface-300 dark:border-surface-600 rounded text-surface-700 dark:text-surface-300"
          @change="handlePageSizeChange(Number((($event.target as HTMLSelectElement).value)))"
        >
          <option value="10">
            10
          </option>
          <option value="20">
            20
          </option>
          <option value="50">
            50
          </option>
          <option value="100">
            100
          </option>
        </select>
      </div>
    </div>
    <div class="flex space-x-2">
      <button
        :disabled="currentPage <= 1"
        :class="{ 'opacity-50': currentPage <= 1 }"
        class="p-button p-buttom-sm p-button-secondary"
        @click="prevPage"
      >
        <Icon icon="tabler:chevron-left" class="mr-1" /> Previous
      </button>
      <button
        :disabled="currentPage >= totalPages"
        :class="{ 'opacity-50': currentPage >= totalPages }"
        class="p-button p-buttom-sm p-button-secondary"
        @click="nextPage"
      >
        Next <Icon icon="tabler:chevron-right" class="ml-1" />
      </button>
    </div>
  </div>
</template> 