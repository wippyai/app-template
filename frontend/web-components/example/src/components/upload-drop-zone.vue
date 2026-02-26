<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useUploadsStore } from '../stores/uploads'
import { Icon } from '@iconify/vue'

// Props
interface Props {
  allowedTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  allowedTypes: () => [],
})

// Store
const store = useUploadsStore()
const {
  isDragging,
  isUploading,
  uploadQueue,
} = storeToRefs(store)

// Methods from store
const {
  addFilesToQueue,
  clearFileSelection,
  startUpload,
  getTruncatedFilename,
  formatFileSize,
  formatTotalSize,
} = store

// Refs
const fileInput = ref<HTMLInputElement>()

// Computed
const allowedTypesString = computed(() => {
  return props.allowedTypes.length > 0 ? props.allowedTypes.join(',') : ''
})

// Event handlers
function handleFileDrop(event: DragEvent) {
  isDragging.value = false

  if (event.dataTransfer?.files.length) {
    addFilesToQueue(Array.from(event.dataTransfer.files))
  }
}

function handleFileSelect() {
  if (fileInput.value?.files?.length) {
    addFilesToQueue(Array.from(fileInput.value.files))
  }
}
</script>

<template>
  <div class="bg-surface-50 dark:bg-surface-700 shadow rounded-lg overflow-hidden">
    <!-- Upload Header -->
    <div class="px-4 py-5 border-b border-surface-200 dark:border-surface-600 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-surface-900 dark:text-surface-100">
          Upload Files
        </h3>
        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Drag and drop files or click to browse
        </p>
      </div>
      <span
        v-show="uploadQueue.length > 0"
        class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
      >
        {{ uploadQueue.length }}
      </span>
    </div>

    <!-- Drop Zone -->
    <div class="px-4 sm:px-6 pt-5 pb-3">
      <div
        :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDragging }"
        class="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors duration-200 ease-in-out hover:bg-surface-100 dark:hover:bg-surface-600/50"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        @click="fileInput?.click()"
      >
        <div class="flex flex-col items-center">
          <Icon icon="tabler:cloud-upload" class="text-3xl sm:text-4xl text-surface-400 dark:text-surface-500 mb-3" />
          <p class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
            Drop files here or click to browse
          </p>
          <p class="text-xs text-surface-500 dark:text-surface-400">
            Supports multiple files
          </p>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        :accept="allowedTypesString"
        @change="handleFileSelect"
      >
    </div>

    <!-- File Details -->
    <div v-show="uploadQueue.length > 0" v-if="uploadQueue.length > 0" class="px-4 sm:px-6 pb-3">
      <h3 class="text-xs font-medium text-surface-700 dark:text-surface-300 mb-2">
        Selected Files:
      </h3>
      <div class="max-h-[150px] overflow-y-auto text-xs text-surface-600 dark:text-surface-400 space-y-1 mb-2">
        <div v-for="(file, index) in uploadQueue" :key="index" class="py-1">
          <div class="flex justify-between items-center">
            <span
              class="font-medium text-surface-700 dark:text-surface-300 truncate"
              :title="file.name"
              style="max-width: 80%;"
            >
              {{ getTruncatedFilename(file.name) }}
            </span>
            <span class="text-surface-500 dark:text-surface-400">
              {{ formatFileSize(file.size) }}
            </span>
          </div>
        </div>

        <div v-show="uploadQueue.length > 0" class="border-t border-surface-200 dark:border-surface-600 mt-2 pt-2 font-medium">
          <span>Total: {{ uploadQueue.length }} {{ uploadQueue.length === 1 ? 'file' : 'files' }} ({{ formatTotalSize() }})</span>
        </div>
      </div>
    </div>

    <!-- Upload Actions -->
    <div class="px-4 sm:px-6 pb-5 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
      <button
        :disabled="isUploading || uploadQueue.length === 0"
        :class="{ 'opacity-70': isUploading || uploadQueue.length === 0 }"
        class="p-button"
        @click="startUpload"
      >
        {{ isUploading ? 'Uploading...' : 'Upload Files' }}
      </button>
      <button
        class="p-button p-button-secondary"
        @click="clearFileSelection"
      >
        Clear
      </button>
    </div>
  </div>
</template> 