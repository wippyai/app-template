<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@wippy-fe/proxy'
import Button from 'primevue/button'
import { useComponentProps, useComponentEvents } from '../constants'
import type { Model, ModelsListResponse } from '../types'
import ModelCard from './components/model-card.vue'

const props = useComponentProps()
const emit = useComponentEvents()

const models = ref<Model[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const showDetails = computed(() => props.value.showDetails ?? true)

async function fetchModels() {
  if (loading.value && models.value.length > 0) return // Prevent duplicate requests
  loading.value = true
  error.value = null

  try {
    const { data } = await api.get('/api/v1/models/list')
    const response = data as ModelsListResponse

    if (response.success && response.models) {
      models.value = response.models
    } else {
      error.value = response.error ?? 'Failed to load models'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch models'
    emit('error', { message: error.value, error: err })
  } finally {
    loading.value = false
  }
}

function selectModel(model: Model) {
  emit('model-selected', { name: model.name, provider: model.provider })
}

onMounted(() => {
  fetchModels()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex items-center gap-3 text-surface-500 dark:text-surface-400">
        <svg
          class="animate-spin h-5 w-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span
          class="text-sm"
          role="status"
        >Loading models...</span>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-12 gap-3"
      role="alert"
    >
      <div class="text-red-500 text-sm">
        {{ error }}
      </div>
      <Button
        label="Retry"
        size="small"
        :disabled="loading"
        @click="fetchModels"
      />
    </div>

    <!-- Model Grid -->
    <div
      v-else-if="models.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      role="list"
      aria-label="Available models"
    >
      <ModelCard
        v-for="model in models"
        :key="model.name"
        :model="model"
        :show-details="showDetails"
        @select="selectModel"
      />
    </div>

    <!-- Empty -->
    <div
      v-else
      class="text-center py-12 text-surface-500 dark:text-surface-400 text-sm"
    >
      No models available.
    </div>
  </div>
</template>
