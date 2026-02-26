<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUploadsStore } from '../stores/uploads'
import { Icon } from '@iconify/vue'

// Store
const store = useUploadsStore()
const {
  processingUploads,
} = storeToRefs(store)

// Methods from store
const {
  getTruncatedFilename,
  formatDate,
} = store
</script>

<template>
  <div v-if="processingUploads.length > 0" class="border-b border-surface-200 dark:border-surface-600">
    <div class="px-4 py-3 text-xs font-medium text-surface-500 dark:text-surface-400">
      Processing Files
    </div>
    <div>
      <div v-for="upload in processingUploads" :key="upload.uuid" class="bg-surface-100/50 dark:bg-surface-600/50">
        <div class="flex items-start px-4 py-4">
          <!-- Processing Icon -->
          <div class="flex-shrink-0 mr-3">
            <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <div class="w-6 h-6 text-amber-600 dark:text-amber-400">
                <Icon icon="svg-spinners:gooey-balls-2" class="w-full h-full" />
              </div>
            </div>
          </div>

          <!-- File Details -->
          <div class="min-w-0 flex-1">
            <div class="flex justify-between">
              <h4 class="text-sm font-medium text-surface-900 dark:text-surface-100 truncate" :title="upload.filename">
                <span>{{ getTruncatedFilename(upload.filename, 40) }}</span>
              </h4>
              <div class="ml-2 flex-shrink-0 flex">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  {{ upload.stage || upload.status }}
                </span>
              </div>
            </div>
            <div class="mt-1 flex items-center text-xs text-surface-500 dark:text-surface-400">
              <span>{{ formatDate(upload.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 