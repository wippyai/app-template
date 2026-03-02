<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

// Track events from components for display
const reactionEvents = ref<Array<{ emoji: string; active: boolean; time: string }>>([])
const modelEvents = ref<Array<{ name: string; provider: string; time: string }>>([])

function onReaction(e: Event) {
  const detail = (e as CustomEvent).detail
  reactionEvents.value.unshift({
    emoji: detail.emoji,
    active: detail.active,
    time: new Date().toLocaleTimeString(),
  })
  if (reactionEvents.value.length > 5) reactionEvents.value.pop()
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

const components = [
  {
    id: 'reaction-bar',
    title: 'Reaction Bar',
    tag: 'example-reaction-bar',
    icon: 'tabler:mood-smile',
    description: 'Emoji reaction buttons demonstrating event emission via useEvents(). Click to toggle reactions — events are captured and shown below.',
    capabilities: ['Event Emission', 'Tailwind CSS', 'useEvents()'],
  },
  {
    id: 'websocket-log',
    title: 'WebSocket Log',
    tag: 'example-websocket-log',
    icon: 'tabler:broadcast',
    description: 'Terminal-style log viewer that subscribes to WebSocket topics via on() from the proxy. Shows live messages as they arrive.',
    capabilities: ['WebSocket', 'on() Subscription', 'Auto-scroll'],
  },
  {
    id: 'chart-circle',
    title: 'Chart Circle',
    tag: 'example-chart-circle',
    icon: 'tabler:chart-donut',
    description: 'Doughnut chart powered by Chart.js (bundled, not externalized). Demonstrates including a third-party canvas library inside Shadow DOM.',
    capabilities: ['Chart.js', 'Canvas', 'Bundled Dep'],
  },
  {
    id: 'mermaid',
    title: 'Mermaid Diagram',
    tag: 'example-mermaid',
    icon: 'tabler:git-branch',
    description: 'Renders Mermaid diagrams using beautiful-mermaid with CSS variable theming. Shows both prop-based and children content approaches.',
    capabilities: ['beautiful-mermaid', 'CSS Variables', 'Children Content'],
  },
  {
    id: 'markdown',
    title: 'Markdown Viewer',
    tag: 'example-markdown',
    icon: 'tabler:markdown',
    description: 'Renders markdown using markdown-it with sanitize-html for security. Shows both prop-based content and children content via <template> tag.',
    capabilities: ['markdown-it', 'sanitize-html', 'Children Content'],
  },
  {
    id: 'model-gallery',
    title: 'Model Gallery',
    tag: 'example-model-gallery',
    icon: 'tabler:brain',
    description: 'Fetches AI models from the API via the proxy api.get() and displays them in a card grid using PrimeVue components (Button, Tag) in unstyled mode with Tailwind + PrimeUI.',
    capabilities: ['API Fetch', 'PrimeVue Components', 'proxy api.get()'],
  },
]

const activeSection = ref<string | null>(null)

function toggleSection(id: string) {
  activeSection.value = activeSection.value === id ? null : id
}
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">
        Web Components
      </h1>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        Interactive demos of all example web components. Each runs in its own Shadow DOM with isolated styles.
      </p>
    </div>

    <!-- Component Cards -->
    <div class="space-y-4">
      <div
        v-for="comp in components"
        :key="comp.id"
        class="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden bg-surface-0 dark:bg-surface-800"
      >
        <!-- Card Header (always visible) -->
        <button
          :id="`heading-${comp.id}`"
          class="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
          :aria-expanded="activeSection === comp.id"
          :aria-controls="`panel-${comp.id}`"
          @click="toggleSection(comp.id)"
        >
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <Icon :icon="comp.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-sm font-semibold text-surface-900 dark:text-surface-0">
                {{ comp.title }}
              </h2>
              <code class="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 font-mono whitespace-nowrap">
                &lt;{{ comp.tag }}&gt;
              </code>
            </div>
            <p class="text-xs text-surface-500 dark:text-surface-400 mb-2">
              {{ comp.description }}
            </p>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                v-for="cap in comp.capabilities"
                :key="cap"
                class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400"
              >
                {{ cap }}
              </span>
            </div>
          </div>
          <Icon
            icon="tabler:chevron-down"
            class="w-5 h-5 text-surface-400 transition-transform duration-200 shrink-0 mt-1"
            :class="{ 'rotate-180': activeSection === comp.id }"
          />
        </button>

        <!-- Expanded Panel -->
        <div
          v-show="activeSection === comp.id"
          :id="`panel-${comp.id}`"
          role="region"
          :aria-labelledby="`heading-${comp.id}`"
          class="border-t border-surface-200 dark:border-surface-700"
        >
          <div class="p-4">
            <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
              {{ comp.description }}
            </p>

            <!-- ═══ reaction-bar ═══ -->
            <template v-if="comp.id === 'reaction-bar'">
                <example-reaction-bar @reaction="onReaction"></example-reaction-bar>
              <div v-if="reactionEvents.length" class="space-y-1">
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
            </template>

            <!-- ═══ websocket-log ═══ -->
            <template v-if="comp.id === 'websocket-log'">
              <example-websocket-log
                topics='["@message","@system"]'
                max-entries="50"
              ></example-websocket-log>
              <p class="text-[11px] text-surface-400 mt-2">
                Listening on @message and @system topics. Send a WebSocket message to see it appear.
              </p>
            </template>

            <!-- ═══ chart-circle ═══ -->
            <template v-if="comp.id === 'chart-circle'">
              <example-chart-circle
                :labels="chartLabels"
                :values="chartValues"
                title="Frontend Framework Usage"
              ></example-chart-circle>
            </template>

            <!-- ═══ mermaid ═══ -->
            <template v-if="comp.id === 'mermaid'">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Via prop -->
                <div>
                  <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Via definition prop</div>
                    <example-mermaid :definition="mermaidDef"></example-mermaid>
                </div>
                <!-- Via children content (<template> renders as native element in Vue 3) -->
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
            </template>

            <!-- ═══ markdown ═══ -->
            <template v-if="comp.id === 'markdown'">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Source -->
                <div>
                  <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Markdown source (via content prop)</div>
                  <pre class="text-[11px] font-mono text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-900 rounded-lg p-3 overflow-auto max-h-80 border border-surface-200 dark:border-surface-700">{{ markdownContent }}</pre>
                </div>
                <!-- Rendered -->
                <div>
                  <div class="text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-2">Rendered output</div>
                    <example-markdown :content="markdownContent"></example-markdown>
                </div>
              </div>
            </template>

            <!-- ═══ model-gallery ═══ -->
            <template v-if="comp.id === 'model-gallery'">
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
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
