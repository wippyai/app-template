<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import Chip from 'primevue/chip'

// Track events from components for display
const reactionEvents = ref<Array<{ emoji: string; active: boolean; time: string }>>([])
const modelEvents = ref<Array<{ name: string; provider: string; time: string }>>([])
const counterEvents = ref<Array<{ count: number; time: string }>>([])

function onReaction(e: Event) {
  const detail = (e as CustomEvent).detail
  reactionEvents.value.unshift({
    emoji: detail.emoji,
    active: detail.active,
    time: new Date().toLocaleTimeString(),
  })
  if (reactionEvents.value.length > 5) reactionEvents.value.pop()
}

function onCountChanged(e: Event) {
  const detail = (e as CustomEvent).detail
  counterEvents.value.unshift({
    count: detail.count,
    time: new Date().toLocaleTimeString(),
  })
  if (counterEvents.value.length > 5) counterEvents.value.pop()
}

function onModelSelected(e: Event) {
  const detail = (e as CustomEvent).detail
  modelEvents.value.unshift({
    name: detail.name,
    provider: detail.provider,
    time: new Date().toLocaleTimeString(),
  })
  if (modelEvents.value.length > 5) modelEvents.value.pop()
}

// Demo data for chart
const chartLabels = '["Vue","React","Svelte","Angular"]'
const chartValues = '[40,30,20,10]'

// Demo mermaid definition (via prop)
const mermaidDef = `graph LR
    A[User] --> B[Facade]
    B --> C[View Page]
    B --> D[View Component]
    D --> E[Shadow DOM]
    E --> F[Vue App]`

// Demo markdown
const markdownContent = `# Web Components

Build **reusable** UI widgets with the Wippy component system.

## Features

- Shadow DOM isolation
- Reactive props via \`useProps()\`
- Typed events via \`useEvents()\`
- Host CSS inheritance

\`\`\`ts
const props = useComponentProps()
const emit = useComponentEvents()
\`\`\`

> Components are self-contained ES modules that register custom elements.

| Feature | Support |
|---------|---------|
| Vue 3 | Yes |
| Tailwind | Optional |
| PrimeVue | Optional |
`
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1">
        Web Components
      </h1>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        Interactive demos of example web components, each running in its own Shadow DOM.
      </p>
    </div>

    <!-- Component Cards -->
    <div class="flex flex-col gap-4">

      <!-- Reaction Bar -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:mood-smile" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Reaction Bar</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-reaction-bar&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="Event Emission" class="text-[10px]" />
            <Chip label="useEvents()" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Emoji reaction buttons with event emission via useEvents(). Click to toggle reactions — events are captured below.
        </p>
        <example-reaction-bar @reaction="onReaction"></example-reaction-bar>
        <div v-if="reactionEvents.length" class="mt-3 space-y-1">
          <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">Recent Events</div>
          <div
            v-for="(ev, i) in reactionEvents"
            :key="i"
            class="text-xs font-mono text-surface-600 dark:text-surface-400"
          >
            <span class="text-surface-400">{{ ev.time }}</span>
            &nbsp;{{ ev.emoji }} &rarr; {{ ev.active ? 'active' : 'inactive' }}
          </div>
        </div>
      </div>

      <!-- Counter Persist -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:database" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Counter Persist</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-counter-persist&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="State Persist" class="text-[10px]" />
            <Chip label="Pinia" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Counter with Pinia state persistence via @wippy-fe/pinia-persist. State survives iframe reloads. Two instances with different persist-key props maintain separate state.
        </p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Instance A (persist-key="a")</div>
            <example-counter-persist persist-key="a" @count-changed="onCountChanged"></example-counter-persist>
          </div>
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Instance B (persist-key="b")</div>
            <example-counter-persist persist-key="b" @count-changed="onCountChanged"></example-counter-persist>
          </div>
        </div>
        <div v-if="counterEvents.length" class="mt-3 space-y-1">
          <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">Recent Events</div>
          <div
            v-for="(ev, i) in counterEvents"
            :key="i"
            class="text-xs font-mono text-surface-600 dark:text-surface-400"
          >
            <span class="text-surface-400">{{ ev.time }}</span>
            &nbsp;count &rarr; {{ ev.count }}
          </div>
        </div>
      </div>

      <!-- WebSocket Log -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:broadcast" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">WebSocket Log</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-websocket-log&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="WebSocket" class="text-[10px]" />
            <Chip label="on()" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Terminal-style log viewer subscribing to WebSocket topics via on(). Shows live messages as they arrive.
        </p>
        <example-websocket-log
          topics='["@message","@system"]'
          max-entries="50"
        ></example-websocket-log>
      </div>

      <!-- Chart Circle -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:chart-donut" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Chart Circle</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-chart-circle&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="Chart.js" class="text-[10px]" />
            <Chip label="Canvas" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Doughnut chart powered by Chart.js bundled inside Shadow DOM.
        </p>
        <example-chart-circle
          :labels="chartLabels"
          :values="chartValues"
          title="Frontend Framework Usage"
        ></example-chart-circle>
      </div>

      <!-- Mermaid Diagram -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:git-branch" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Mermaid Diagram</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-mermaid&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="beautiful-mermaid" class="text-[10px]" />
            <Chip label="Children Content" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Mermaid diagrams with CSS variable theming. Shows both prop-based and children content approaches.
        </p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Via definition prop</div>
            <example-mermaid :definition="mermaidDef"></example-mermaid>
          </div>
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">
              Via children content
              <code class="text-[10px] ml-1 text-surface-400">&lt;template data-type="..."&gt;</code>
            </div>
            <example-mermaid>
              <template data-type="text/vnd.mermaid">
                sequenceDiagram
                  participant H as Host
                  participant C as Component
                  participant S as Shadow DOM
                  H->>C: Register tag
                  C->>S: Attach shadow
                  S->>S: Load CSS
                  S->>C: Mount Vue app
              </template>
            </example-mermaid>
          </div>
        </div>
      </div>

      <!-- Markdown Viewer -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:markdown" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Markdown Viewer</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-markdown&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="markdown-it" class="text-[10px]" />
            <Chip label="sanitize-html" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Markdown rendering with sanitize-html and children content support.
        </p>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Markdown source (via content prop)</div>
            <pre class="text-[11px] font-mono text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-900 rounded-lg p-3 overflow-auto max-h-60 border border-surface-200 dark:border-surface-700">{{ markdownContent }}</pre>
          </div>
          <div>
            <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Rendered output</div>
            <example-markdown :content="markdownContent"></example-markdown>
          </div>
        </div>
      </div>

      <!-- Model Gallery -->
      <div class="p-card p-component rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <Icon icon="tabler:brain" class="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">Model Gallery</h2>
            <code class="text-[10px] text-surface-400 font-mono">&lt;example-model-gallery&gt;</code>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <Chip label="API Fetch" class="text-[10px]" />
            <Chip label="PrimeVue" class="text-[10px]" />
            <Chip label="api.get()" class="text-[10px]" />
          </div>
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          Fetches AI models via proxy api.get() and displays with PrimeVue components.
        </p>
        <example-model-gallery
          show-details="true"
          @model-selected="onModelSelected"
        ></example-model-gallery>
        <div v-if="modelEvents.length" class="mt-3 space-y-1">
          <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">Selected Models</div>
          <div
            v-for="(ev, i) in modelEvents"
            :key="i"
            class="text-xs font-mono text-surface-600 dark:text-surface-400"
          >
            <span class="text-surface-400">{{ ev.time }}</span>
            &nbsp;{{ ev.name }} ({{ ev.provider }})
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
