<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { on } from '@wippy-fe/proxy'
import { useComponentProps, DEFAULT_TOPICS, DEFAULT_MAX_ENTRIES } from '../constants'
import type { LogEntry } from '../types'

const props = useComponentProps()

const entries = ref<LogEntry[]>([])
const logContainer = ref<HTMLElement | null>(null)
const unsubscribers: Array<() => void> = []
let nextId = 0

const topics = computed(() => props.value.topics ?? DEFAULT_TOPICS)
const maxEntries = computed(() => props.value.maxEntries ?? DEFAULT_MAX_ENTRIES)
const entryCount = computed(() => entries.value.length)

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function formatData(data: unknown): string {
  if (typeof data === 'string') return data
  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

function addEntry(topic: string, data: unknown) {
  entries.value.push({
    id: nextId++,
    timestamp: new Date().toISOString(),
    topic,
    data,
  })

  // Trim to max entries
  if (entries.value.length > maxEntries.value) {
    entries.value = entries.value.slice(-maxEntries.value)
  }

  // Auto-scroll only if user is near the bottom
  nextTick(() => {
    if (logContainer.value) {
      const el = logContainer.value
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight
      }
    }
  })
}

function subscribe() {
  // Clean up old subscriptions
  unsubscribers.forEach(unsub => unsub())
  unsubscribers.length = 0

  for (const topic of topics.value) {
    const unsub = on(topic, (data: unknown) => {
      addEntry(topic, data)
    })
    unsubscribers.push(unsub)
  }
}

watch(topics, () => {
  subscribe()
}, { deep: true })

onMounted(() => {
  subscribe()
})

onUnmounted(() => {
  unsubscribers.forEach(unsub => unsub())
  unsubscribers.length = 0
})
</script>

<template>
  <div class="ws-log-container">
    <div class="ws-log-header">
      <div class="status">
        <span
          class="dot"
          aria-hidden="true"
        />
        <span>Listening on {{ topics.length }} topic(s)</span>
      </div>
      <span>{{ entryCount }} entries</span>
    </div>
    <div
      ref="logContainer"
      class="ws-log-entries"
      role="log"
      aria-live="polite"
      aria-label="WebSocket messages"
    >
      <div
        v-if="entries.length === 0"
        class="ws-log-empty"
      >
        Waiting for messages...
      </div>
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="ws-log-entry"
      >
        <time
          class="time"
          :datetime="entry.timestamp"
        >{{ formatTime(entry.timestamp) }}</time>
        <span class="topic">{{ entry.topic }}</span>
        <span class="data">{{ formatData(entry.data) }}</span>
      </div>
    </div>
  </div>
</template>
