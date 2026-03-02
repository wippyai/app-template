<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { useComponentProps, useComponentEvents, DEFAULT_REACTIONS } from '../constants'

const props = useComponentProps()
const emit = useComponentEvents()

const activeEmojis = ref<Set<string>>(new Set())

const reactions = computed(() => props.value.reactions ?? DEFAULT_REACTIONS)
const allowMultiple = computed(() => props.value.allowMultiple ?? false)

function getCount(emoji: string): number {
  return activeEmojis.value.has(emoji) ? 1 : 0
}

function toggle(emoji: string) {
  const isActive = activeEmojis.value.has(emoji)

  if (isActive) {
    activeEmojis.value.delete(emoji)
  } else {
    if (!allowMultiple.value) {
      activeEmojis.value.clear()
    }
    activeEmojis.value.add(emoji)
  }

  // Force reactivity
  activeEmojis.value = new Set(activeEmojis.value)

  emit('reaction', {
    emoji,
    count: getCount(emoji),
    active: !isActive,
  })
}
</script>

<template>
  <div
    class="flex items-center gap-2"
    role="group"
    aria-label="Reactions"
  >
    <Button
      v-for="emoji in reactions"
      :key="emoji"
      :severity="activeEmojis.has(emoji) ? undefined : 'secondary'"
      :outlined="!activeEmojis.has(emoji)"
      :aria-pressed="activeEmojis.has(emoji)"
      :aria-label="`React with ${emoji}`"
      size="small"
      rounded
      @click="toggle(emoji)"
    >
      <span
        class="text-lg"
        aria-hidden="true"
      >{{ emoji }}</span>
      <span
        v-if="activeEmojis.has(emoji)"
        class="text-xs font-medium ml-1"
        aria-hidden="true"
      >1</span>
    </Button>
  </div>
</template>
