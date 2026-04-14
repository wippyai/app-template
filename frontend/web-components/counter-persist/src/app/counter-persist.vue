<script setup lang="ts">
import { watch } from 'vue'
import { Icon } from '@iconify/vue'
import Button from 'primevue/button'
import { useComponentProps, useComponentEvents } from '../constants'
import { useCounterStore } from '../stores/counter'

const props = useComponentProps()
const emit = useComponentEvents()

const store = useCounterStore(props.value.persistKey)

watch(() => store.count, (count) => {
  emit('count-changed', { count })
})
</script>

<template>
  <div class="flex flex-col gap-3 p-4">
    <div class="text-2xl font-bold text-center text-surface-900 dark:text-surface-0">
      {{ store.count }}
    </div>
    <div class="flex gap-2 justify-center">
      <Button
        severity="primary"
        size="small"
        @click="store.decrement"
      >
        <template #icon>
          <Icon
            icon="tabler:minus"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </template>
      </Button>
      <Button
        severity="primary"
        size="small"
        @click="store.increment"
      >
        <template #icon>
          <Icon
            icon="tabler:plus"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </template>
      </Button>
      <Button
        severity="secondary"
        size="small"
        label="Reset"
        @click="store.reset"
      >
        <template #icon>
          <Icon
            icon="tabler:refresh"
            class="w-4 h-4"
            aria-hidden="true"
          />
        </template>
      </Button>
    </div>
    <div class="text-sm text-muted-color text-center">
      History: {{ store.history.join(', ') || 'none' }}
    </div>
    <div
      v-if="props.persistKey"
      class="text-xs text-muted-color text-center"
    >
      <Icon
        icon="tabler:database"
        class="w-3 h-3 inline-block"
        aria-hidden="true"
      />
      persist-key: {{ props.persistKey }}
    </div>
  </div>
</template>
