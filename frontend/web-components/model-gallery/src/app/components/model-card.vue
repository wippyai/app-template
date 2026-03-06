<script setup lang="ts">
import Tag from 'primevue/tag'
import type { Model } from '../../types'

defineProps<{
  model: Model
  showDetails: boolean
}>()

defineEmits<{
  select: [model: Model]
}>()

function getProviderSeverity(provider: string): string | undefined {
  const map: Record<string, string> = {
    anthropic: 'warn',
    openai: 'success',
    google: 'info',
  }
  return map[provider.toLowerCase()]
}
</script>

<template>
  <div
    role="listitem"
  >
    <div
      class="border border-surface-200 dark:border-surface-600 rounded-lg p-4 cursor-pointer
             hover:border-primary-500 hover:shadow-md transition-all duration-150
             bg-surface-0 dark:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
      role="button"
      tabindex="0"
      :aria-label="`Select model ${model.name} by ${model.provider}`"
      @click="$emit('select', model)"
      @keydown.enter="$emit('select', model)"
      @keydown.space.prevent="$emit('select', model)"
    >
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
          {{ model.name }}
        </h3>
        <Tag
          :value="model.provider"
          :severity="getProviderSeverity(model.provider)"
          class="flex-shrink-0 ml-2"
        />
      </div>

      <template v-if="showDetails">
        <p
          v-if="model.description"
          class="text-xs text-surface-500 dark:text-surface-400 mb-3 line-clamp-2"
        >
          {{ model.description }}
        </p>

        <div
          v-if="model.capabilities?.length"
          class="flex flex-wrap gap-1"
        >
          <Tag
            v-for="cap in model.capabilities"
            :key="cap"
            :value="cap"
            severity="secondary"
          />
        </div>
      </template>
    </div>
  </div>
</template>
