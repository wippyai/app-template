<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUploadsStore } from '../stores/uploads'
import { Icon } from '@iconify/vue'

// Store
const store = useUploadsStore()
const {
  isLoading,
  uploads,
  totalItems,
  startItem,
  endItem,
} = storeToRefs(store)

// Methods from store
const {
  deleteUpload,
  getFilename,
  getTruncatedFilename,
  formatFileSize,
  formatDate,
  getStatusColor,
  getFileIcon,
} = store
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-32">
      <Icon class="w-12 h-12 text-primary-500" icon="svg-spinners:gooey-balls-2" />
    </div>

    <!-- No Uploads State -->
    <div v-if="!isLoading && uploads.length === 0" class="text-center py-10">
      <Icon icon="tabler:inbox" class="text-4xl text-surface-300 dark:text-surface-600 mb-3" width="80" />
      <p class="text-sm text-surface-500 dark:text-surface-400">
        No uploads found
      </p>
    </div>

    <!-- Completed Uploads List -->
    <div v-if="!isLoading && uploads.length > 0">
      <!-- Range Text -->
      <div class="px-4 py-3 text-xs text-surface-500 dark:text-surface-400">
        <span>Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} uploads</span>
      </div>

      <!-- File Items -->
      <div>
        <div
          v-for="upload in uploads"
          :key="upload.uuid"
          class="hover:bg-surface-100 dark:hover:bg-surface-600/50 transition-colors duration-150"
        >
          <div class="flex items-start px-4 py-4">
            <!-- File Icon -->
            <div class="flex-shrink-0 mr-3">
              <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-200 dark:bg-surface-600">
                <Icon :icon="getFileIcon(upload.mime_type)" width="24" class="text-surface-600 dark:text-surface-300" />
              </div>
            </div>

            <!-- File Details -->
            <div class="min-w-0 flex-1">
              <div class="flex justify-between">
                <h4 class="text-sm font-medium text-surface-900 dark:text-surface-100 truncate" :title="getFilename(upload)">
                  <span>{{ getTruncatedFilename(getFilename(upload), 40) }}</span>
                </h4>
                <div class="ml-2 flex-shrink-0 flex">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" :class="getStatusColor(upload.status)">
                    {{ upload.status }}
                  </span>
                </div>
              </div>
              <div class="mt-1 flex items-center text-xs text-surface-500 dark:text-surface-400">
                <span>{{ formatDate(upload.created_at) }}</span>
                <span class="mx-1">•</span>
                <span>{{ formatFileSize(upload.size) }}</span>
                <div v-if="upload.meta && upload.meta.page_count" class="ml-1">
                  <span class="mx-1">•</span>
                  <span>{{ upload.meta.page_count }} {{ upload.meta.page_count === 1 ? 'page' : 'pages' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="ml-4 flex-shrink-0">
              <button
                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                @click="deleteUpload(upload)"
              >
                <Icon icon="tabler:trash" width="20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 