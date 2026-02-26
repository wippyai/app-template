<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted } from 'vue'
import PaginationControls from '../components/pagination-controls.vue'
import ProcessingUploads from '../components/processing-uploads.vue'
import UploadDropZone from '../components/upload-drop-zone.vue'
import UploadsList from '../components/uploads-list.vue'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER, DEFAULT_COMPONENT_PROPS } from '../constants'
import Layout from '../layout/layout.vue'
import { useUploadsStore } from '../stores/uploads'

// Inject providers
const props = inject(PROPS_PROVIDER)!
const propsError = inject(PROPS_ERROR_PROVIDER)!
const emit = inject(EVENT_PROVIDER)!

// Store
const store = useUploadsStore()
const {
  totalItems,
} = storeToRefs(store)

// Methods from store
const {
  fetchUploads,
} = store

// Computed properties
const hasError = computed(() => !!propsError?.value)
const isValidProps = computed(() => !hasError.value && props?.value)

// Merge configurable props with constants
const mergedProps = computed(() => ({
  ...DEFAULT_COMPONENT_PROPS,
  ...props.value
}))

// Lifecycle
onMounted(async () => {
  // Log the merged props
  console.log('UploadsManager merged props:', mergedProps.value)

  // Initialize store with merged props
  store.initializeProps(mergedProps.value)

  // Fetch initial uploads if props are valid
  if (isValidProps.value) {
    try {
      await fetchUploads()
      emit('uploads-loaded', { count: totalItems.value || 0 })
    } catch (error) {
      emit('error', {
        message: 'Failed to fetch uploads',
        error,
      })
    }
  }
})
</script>

<template>
  <Layout class="uploads-manager-component">
    <!-- Error State -->
    <div v-if="hasError" class="flex items-center justify-center h-full">
      <div class="text-center p-6">
        <div class="text-red-500 text-lg font-medium mb-2">
          Configuration Error
        </div>
        <div class="text-surface-600 dark:text-surface-400">
          {{ propsError }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="isValidProps" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Upload Section -->
      <div class="lg:col-span-1">
        <UploadDropZone :allowed-types="mergedProps.allowedTypes" />
      </div>

      <!-- File List Section -->
      <div class="lg:col-span-3 bg-surface-50 dark:bg-surface-700 shadow rounded-lg overflow-hidden">
        <!-- File List Header -->
        <div class="px-4 py-5 border-b border-surface-200 dark:border-surface-600 sm:px-6 flex flex-col sm:flex-row justify-between sm:items-center">
          <div class="mb-3 sm:mb-0">
            <h3 class="text-lg leading-6 font-medium text-surface-900 dark:text-surface-100">
              Recent Uploads
            </h3>
            <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
              View and manage your uploaded files
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="text-xs text-surface-500 dark:text-surface-400">
              {{ totalItems }} uploads
            </div>
          </div>
        </div>

        <!-- File List Content -->
        <div class="px-0 py-0 sm:p-0">
          <!-- Processing Uploads -->
          <ProcessingUploads />

          <!-- Main Uploads List -->
          <UploadsList />
        </div>

        <!-- Pagination Controls -->
        <PaginationControls />
      </div>
    </div>

    <!-- Loading/Empty State -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="text-center p-6">
        <div class="text-surface-500 dark:text-surface-400">
          Loading uploads manager...
        </div>
      </div>
    </div>
  </Layout>
</template>
