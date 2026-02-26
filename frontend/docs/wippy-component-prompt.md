# Prompt for Building Wippy Web Components

> **CRITICAL: NOT STANDALONE**
>
> Wippy web components do **NOT** work outside the Wippy host application. They run within Wippy pages with host-injected configuration. The `@wippy-fe/proxy` module and host APIs only exist when loaded within Wippy.

## Task
Create a Wippy web component following the ESM Module pattern with Vue 3 and shadow DOM encapsulation.

## Component Requirements
**Component Name**: [SPECIFY COMPONENT NAME]
**Component Purpose**: [DESCRIBE WHAT THE COMPONENT DOES]
**Data Source**: [Props-controlled | URL fetch | Built-in smart fetching | WebSocket]
**Interactivity Level**: [Static display | User interactions | Real-time updates]
**Styling Approach**: [Inline styles | UnoCSS with shadow DOM | Custom CSS]

## Important Shadow DOM Considerations

### Styling in Shadow DOM
Since components use Shadow DOM, regular Tailwind CSS won't work. Choose one approach:

1. **Inline Styles** (as in the example):
   - Import styles as `stylesText from './styles.css?inline'`
   - Inject into shadow root via `<style>` element
   - Write regular CSS or PostCSS

2. **UnoCSS with Shadow DOM support** (when available as external):
   - Configure UnoCSS with Tailwind preset
   - Use shadow DOM mode for proper style injection
   - Allows utility classes within shadow boundaries

### Shadow DOM Compatibility
**CRITICAL**: Any dependencies used must be explicitly Shadow DOM compatible if the component uses Shadow DOM. Many libraries assume global DOM access and will fail inside shadow roots. Always verify library compatibility before use.

## Technical Specifications

### TypeScript Types
Add this to devDependencies for full @wippy-fe/proxy typing:
```json
"@wippy-fe/proxy": "^0.0.1"
```

Note: `@wippy-fe/proxy` is a virtual module that exists only in the import map at runtime. Never install it as a dependency.

### Must Follow This Structure:

1. **Package.json** - Use this template:

**NAMING CONVENTION (REQUIRED - names must be unique)**:
Package name format: `@<namespace>/widget-<description>`
Examples: `@anthropic/widget-data-table`, `@acme/widget-chart-pie`

```json
{
  "name": "@myorg/widget-[description]",
  "version": "1.0.0",
  "specification": "wippy-component-1.0",
  "title": "[Human Readable Title]",
  "description": "[Component description]",
  "browser": "dist/index.js",
  "files": ["dist/", "src/", "package.json"],
  "dependencies": {
    // Only add what's absolutely needed
  },
  "peerDependencies": {
    "@iconify/vue": "^5.0.0",
    "@wippy-fe/proxy": "*",
    "luxon": "^3.5.0",
    "pinia": "^2.1.0",
    "vue": "^3.5.0"
  },
  "wippy": {
    "tagName": "[component-tag-name]",
    "type": "widget",
    "props": {
      // JSON Schema for props
    },
    "events": {
      // JSON Schema for custom events (if component emits any)
    },
    "scripts": {
      "build": "build",
      "debug": "build:debug"
    }
  }
}
```

2. **File Structure**:
```
src/
  ├── index.ts          # Web component wrapper
  ├── constants.ts      # Injection keys and constants
  ├── styles.css        # Component styles (if needed)
  └── app/
      └── [component].vue  # Main Vue component
```

3. **index.ts Pattern** - Web component wrapper:
```typescript
import type { App, Ref } from 'vue'
import { addCollection } from '@iconify/vue'
import { addIcons, define, hostCss, loadCss } from '@wippy-fe/proxy'
import { createApp, ref } from 'vue'

import [ComponentName] from './app/[component-name].vue'
import { PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from './constants.ts'
import stylesText from './styles.css?inline'

export interface ComponentProps {
  // Define your props interface
}

class [ComponentName]Element extends HTMLElement {
  private vueApp: App<Element> | null = null
  private root: HTMLElement | null = null
  private props: Ref<ComponentProps> = ref({ /* defaults */ })
  private propsError: Ref<string | null> = ref(null)

  static get observedAttributes() {
    return [/* list of observed attributes */]
  }

  private parseProps(changedProp?: string, isSameValue = false) {
    // Parse and validate attributes to props
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    
    // Inject styles
    const styleEl = document.createElement('style')
    styleEl.textContent = stylesText
    shadow.appendChild(styleEl)

    // Load host styles if inheriting
    Promise.all([
      loadCss(hostCss.fontCssUrl),
      loadCss(hostCss.themeConfigUrl),
      loadCss(hostCss.primeVueCssUrl),
      loadCss(hostCss.markdownCssUrl),
    ]).then((cssChunks) => {
      cssChunks.forEach((css) => {
        const style = document.createElement('style')
        style.textContent = css
        style.role = '@wippy/host-css'
        shadow.appendChild(style)
      })
    })

    // Mount Vue app
    this.root = document.createElement('div')
    shadow.appendChild(this.root)
    
    this.vueApp = createApp([ComponentName])
    this.vueApp.provide(PROPS_PROVIDER, this.props)
    this.vueApp.provide(PROPS_ERROR_PROVIDER, this.propsError)
    this.vueApp.mount(this.root)
    
    addIcons(addCollection)
  }

  disconnectedCallback() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    this.parseProps(name, oldVal === newVal)
  }
}

export async function webComponent() {
  return [ComponentName]Element
}

define(import.meta.url, [ComponentName]Element)
```

### The `define()` Function

The `define()` function enables automatic web component registration when loaded dynamically:

```typescript
import { define } from '@wippy-fe/proxy'

class MyComponent extends HTMLElement { ... }

// If URL has ?declare-tag=my-component, registers automatically
define(import.meta.url, MyComponent)
```

**How it works:**
1. Parses `import.meta.url` as a URL object
2. Extracts the `declare-tag` query parameter
3. If present, calls `customElements.define(tagName, ComponentClass)`
4. Enables auto-registration when script is loaded with `?declare-tag=<tag-name>`

This is used by `loadWebComponent()` to dynamically load and register components:
```typescript
// In the host page:
await loadWebComponent('artifact-uuid', 'my-chart')
// Loads: /artifact/content?declare-tag=my-chart
// Component auto-registers as <my-chart>
```

4. **Vue Component Pattern**:
- Use Composition API with `<script setup>`
- Inject props and error providers
- Handle loading, error, and empty states
- Use Tailwind classes for styling when inheriting host styles
- Dispatch custom events for parent communication

### External Dependencies Available via Import Map

These libraries are provided by the host and should be marked as `peerDependencies` and `external` in bundler config:

**Core Libraries** (always available):
- `vue` - Vue 3 runtime
- `pinia` - Vue store management
- `luxon` - Date/time utilities
- `@wippy-fe/proxy` - Wippy platform integration (virtual module)
- `@iconify/vue` - Icon components

**Additional Libraries** (check availability):
- `unocss` - Utility CSS with shadow DOM support (planned)
- Other libraries may be added - check the host's import map configuration

Always declare these as peerDependencies and mark them as external in your bundler to avoid duplication.

1. **@wippy-fe/proxy Usage**:
   - Use `api` for authenticated backend calls
   - Use `host` for app-wide operations (toast, modals, navigation)
   - Use `on` for subscribing to WebSocket events:
     - `@history` - Host URL changes
     - `@visibility` - Iframe visibility changes (tab switch, hide/show)
     - `@message` - All WebSocket messages (wildcard)
     - `topic:*` patterns - Specific topic subscriptions with wildcard matching
   - Use `hostCss` and `loadCss` for Shadow DOM styling (see below)

2. **Event Communication**:
   - Declare custom events in `wippy.events` alongside `wippy.props` when the component emits custom events
   - Emit custom events with `bubbles: true, composed: true` for shadow DOM traversal
   - The `event.detail` payload should match the JSON Schema declared in `wippy.events`
   - Listen to Wippy events via `@wippy-fe/proxy` on() method

3. **Styling Guidelines**:
   - When inheriting: Use Tailwind utility classes and CSS variables like `var(--p-primary-500)`
   - Custom styles: Scope within shadow DOM
   - Always handle dark mode with `dark:` variants or CSS variables

4. **Error Handling**:
   - Validate props and show user-friendly error states
   - Log errors to console for debugging
   - Provide fallback UI when data fails to load

5. **Performance Considerations**:
   - Mark external dependencies in bundler config
   - Use dynamic imports for large optional features
   - Implement proper cleanup in disconnectedCallback

### Build Configuration:

**vite.config.ts**:
```typescript
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '[ComponentName]',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      external: [
        'vue',
        'pinia',
        '@iconify/vue',
        'nanoevents',
        'luxon',
        '@wippy-fe/proxy',
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
```

## Component Examples to Reference:

### Props-Controlled Component:
Like the bar chart example - receives all data via attributes, no fetching.

### Smart Fetching Component:
```vue
<script setup lang="ts">
import { api, host, on } from '@wippy-fe/proxy'
import { onMounted, onUnmounted, ref } from 'vue'

const data = ref(null)
const loading = ref(true)
let unsubscribeVisibility: (() => void) | null = null

onMounted(async () => {
  // Listen for visibility changes
  unsubscribeVisibility = on('@visibility', (visible: boolean) => {
    if (visible) refreshData()
  })

  await refreshData()
})

onUnmounted(() => {
  unsubscribeVisibility?.()
})

async function refreshData() {
  try {
    loading.value = true
    const response = await api.get('/endpoint')
    data.value = response.data
  } catch (error) {
    if (error.response?.status === 401) {
      host.handleError('auth-expired', error)
    } else {
      host.handleError('other', error)
      host.toast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data'
      })
    }
  } finally {
    loading.value = false
  }
}

// Host API methods available:
// host.startChat(token, { sidebar?: boolean })
// host.openSession(sessionUUID, { sidebar?: boolean })
// host.openArtifact(artifactUUID, { target: 'modal' | 'sidebar' })
// host.setContext(context, sessionUUID?, source?)
// host.navigate(url)
// host.confirm(options) → Promise<boolean>
// host.toast(options)
// host.handleError(code, error)
// host.formatUrl(relativeUrl)
// host.logout()
</script>
```

### WebSocket Real-time Component:
```vue
<script setup lang="ts">
import { on } from '@wippy-fe/proxy'
import { onMounted, onUnmounted, ref } from 'vue'

const messages = ref([])
const sessionData = ref(null)
const isVisible = ref(true)
let unsubscribeMessage: (() => void) | null = null
let unsubscribeSession: (() => void) | null = null
let unsubscribeVisibility: (() => void) | null = null

onMounted(() => {
  // Listen for all messages (wildcard)
  unsubscribeMessage = on('@message', (event) => {
    console.log('Received WebSocket message:', event)

    // Handle specific message types
    if (event.topic?.startsWith('session:')) {
      sessionData.value = event.data
    }
  })

  // Listen for artifact updates with pattern matching
  unsubscribeSession = on('artifact:*', (event) => {
    if (event.data?.status === 'completed') {
      messages.value.push(`Artifact ${event.data.uuid} completed`)
    }
  })

  // Listen for visibility changes (tab switch, iframe hide/show)
  unsubscribeVisibility = on('@visibility', (visible: boolean) => {
    isVisible.value = visible
    if (visible) {
      // Resume polling, refresh data
    } else {
      // Pause expensive operations
    }
  })

  // Listen for host URL changes
  on('@history', ({ path }) => {
    console.log('Host URL changed:', path)
  })
})

onUnmounted(() => {
  unsubscribeMessage?.()
  unsubscribeSession?.()
  unsubscribeVisibility?.()
})
</script>
```

## Host CSS Loading for Shadow DOM

Web components use Shadow DOM which requires explicit style loading. The `@wippy-fe/proxy` module provides `hostCss` URLs and `loadCss()` helper:

### Available Host CSS URLs

| URL | Purpose | When to Use |
|-----|---------|-------------|
| `hostCss.fontCssUrl` | Font definitions and typography | **Always** - ensures consistent typography |
| `hostCss.themeConfigUrl` | CSS variables (`--p-primary-500`, `--p-text-color`, etc.) | **Always** - required for theme integration |
| `hostCss.primeVueCssUrl` | PrimeVue component styles | When using PrimeVue components |
| `hostCss.markdownCssUrl` | Markdown rendering styles | When rendering markdown content |
| `hostCss.iframeCssUrl` | Iframe-specific layout styles | Rarely needed for web components |

### Recommended Default Loading

For most web components, load these three:

```typescript
Promise.all([
  loadCss(hostCss.fontCssUrl),      // Typography
  loadCss(hostCss.themeConfigUrl),  // Theme CSS variables
  loadCss(hostCss.primeVueCssUrl),  // PrimeVue styles (if using any PrimeVue)
]).then((cssChunks) => {
  cssChunks.forEach((css) => {
    const style = document.createElement('style')
    style.textContent = css
    style.role = '@wippy/host-css'
    shadow.appendChild(style)
  })
})
```

### Minimal Loading (No PrimeVue)

If not using PrimeVue components:

```typescript
Promise.all([
  loadCss(hostCss.fontCssUrl),
  loadCss(hostCss.themeConfigUrl),
]).then(/* ... */)
```

---

## Complete Working Skeleton

This section provides a **complete, tested working skeleton** for a Wippy web component. Copy these files exactly to create a new component.

### File Structure

```
my-widget/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── index.ts              # Web component wrapper
    ├── constants.ts          # Injection keys and types
    ├── styles.css            # Component styles
    └── app/
        └── my-widget.vue     # Main Vue component
```

### package.json

**NAMING CONVENTION (REQUIRED - names must be unique)**:
Package name format: `@<namespace>/widget-<description>`
Examples: `@anthropic/widget-data-table`, `@acme/widget-chart-pie`

```json
{
  "name": "@example/widget-my-widget",
  "version": "1.0.0",
  "specification": "wippy-component-1.0",
  "title": "My Widget",
  "description": "Description of what the widget does",
  "browser": "dist/index.js",
  "files": ["dist/", "src/", "package.json"],
  "dependencies": {},
  "devDependencies": {
    "@wippy-fe/proxy": "^0.0.1",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  },
  "peerDependencies": {
    "@iconify/vue": "^5.0.0",
    "@wippy-fe/proxy": "*",
    "luxon": "^3.5.0",
    "pinia": "^2.1.0",
    "vue": "^3.5.0"
  },
  "wippy": {
    "tagName": "my-widget",
    "type": "widget",
    "props": {
      "type": "object",
      "properties": {
        "data": {
          "type": "array",
          "items": { "type": "string" },
          "default": [],
          "description": "Array of data items"
        }
      },
      "required": []
    },
    "scripts": {
      "build": "build",
      "debug": "build:debug"
    }
  },
  "scripts": {
    "build": "vite build",
    "build:debug": "vite build --mode development",
    "dev": "vite build --watch",
    "type-check": "vue-tsc --build --force"
  }
}
```

### vite.config.ts

```typescript
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyWidget',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      external: [
        'vue',
        'pinia',
        '@iconify/vue',
        'nanoevents',
        'luxon',
        '@wippy-fe/proxy',
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    sourcemap: true,
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "@wippy-fe/proxy"],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

### src/constants.ts

```typescript
import type { InjectionKey, Ref } from 'vue'
import type { ComponentProps } from './index.ts'

export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  rendered: undefined
}

export type EventEmitter = <K extends keyof Events>(event: K, details: Events[K]) => void

export const EVENT_PROVIDER = Symbol('emit') as InjectionKey<EventEmitter>
export const PROPS_PROVIDER = Symbol('props') as InjectionKey<Ref<ComponentProps>>
export const PROPS_ERROR_PROVIDER = Symbol('props_error') as InjectionKey<Ref<string | null>>
```

### src/index.ts

```typescript
import type { App, Ref } from 'vue'
import type { Events } from './constants.ts'
import { addCollection } from '@iconify/vue'
import { addIcons, define, hostCss, loadCss } from '@wippy-fe/proxy'
import { createApp, ref } from 'vue'

import MyWidget from './app/my-widget.vue'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from './constants.ts'
import stylesText from './styles.css?inline'

// Component props interface
export interface ComponentProps {
  data?: string[]
}

class MyWidgetElement extends HTMLElement {
  private vueApp: App<Element> | null = null
  private root: HTMLElement | null = null
  private props: Ref<ComponentProps> = ref({ data: [] })
  private propsError: Ref<string | null> = ref(null)
  private internals!: ElementInternals

  static get observedAttributes() {
    return ['data']
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
  }

  private emitEvent<K extends keyof Events>(eventName: K, detail: Events[K]) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
    }))
  }

  // Non-string props (array, object, number, boolean) are passed as serialized JSON
  // in HTML attributes. The component must JSON.parse() each non-string attribute.
  // For custom formats (e.g. comma-separated numbers), declare as "type": "string"
  // in the JSON Schema and parse manually.
  private parseProps(changedProp: string | undefined = undefined, isSameValue: boolean = false) {
    if (!changedProp || (changedProp === 'data' && !isSameValue)) {
      const dataAttr = this.getAttribute('data')
      let data: string[] = []

      if (dataAttr) {
        try {
          data = JSON.parse(dataAttr)
          if (!Array.isArray(data)) {
            this.propsError.value = 'Invalid data format: expected an array.'
            this.emitEvent('invalid', { message: this.propsError.value })
          } else {
            this.propsError.value = null
            this.props.value.data = data
          }
        } catch {
          this.propsError.value = 'Failed to parse data attribute. Ensure it is valid JSON.'
          this.emitEvent('invalid', { message: this.propsError.value })
        }
      }
    }
    console.debug('MyWidgetElement props updated:', this.props.value)
  }

  connectedCallback() {
    this.internals.states.add('loading')
    try {
      // Shadow DOM for style encapsulation
      const shadow = this.attachShadow({ mode: 'open' })

      // Inject component styles
      const styleEl = document.createElement('style')
      styleEl.textContent = stylesText
      shadow.appendChild(styleEl)

      // Load host CSS (fonts + theme required, PrimeVue if using PrimeVue components)
      Promise.all([
        loadCss(hostCss.fontCssUrl),
        loadCss(hostCss.themeConfigUrl),
        loadCss(hostCss.primeVueCssUrl),
      ]).then((cssChunks) => {
        cssChunks.forEach((css) => {
          const style = document.createElement('style')
          style.textContent = css
          style.role = '@wippy/host-css'
          shadow.appendChild(style)
        })
      })

      // Container for Vue app
      this.root = document.createElement('div')
      shadow.appendChild(this.root)

      // Mount Vue
      this.vueApp = createApp(MyWidget)
      this.vueApp.provide(PROPS_PROVIDER, this.props)
      this.vueApp.provide(PROPS_ERROR_PROVIDER, this.propsError)
      this.vueApp.provide(EVENT_PROVIDER, this.emitEvent.bind(this))
      this.vueApp.mount(this.root)

      // Parse initial props
      this.parseProps()

      addIcons(addCollection)

      this.internals.states.delete('loading')
      this.internals.states.add('ready')

      this.emitEvent('load', undefined)
    } catch (error) {
      console.error('Failed to initialize MyWidgetElement:', error)

      this.internals.states.delete('loading')
      this.internals.states.add('error')

      this.emitEvent('error', {
        message: error instanceof Error ? error.message : String(error),
        error,
      })
    }
  }

  disconnectedCallback() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
    this.emitEvent('unload', undefined)

    this.internals.states.clear()
  }

  attributeChangedCallback(name: string, _oldVal: string | null, _newVal: string | null) {
    this.parseProps(name, _oldVal === _newVal)
  }
}

export async function webComponent() {
  return MyWidgetElement
}

// Auto-register if loaded with ?declare-tag=<tag-name>
define(import.meta.url, MyWidgetElement)
```

### src/app/my-widget.vue

```vue
<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER } from '../constants.ts'

const props = inject(PROPS_PROVIDER)!
const propsError = inject(PROPS_ERROR_PROVIDER)!
const emit = inject(EVENT_PROVIDER)!

const isLoading = ref(true)

const isValidData = computed(() => {
  return !propsError?.value && props?.value
})

const hasData = computed(() => {
  return isValidData.value && (props?.value.data?.length ?? 0) > 0
})

function initialize() {
  isLoading.value = false
  emit('rendered', undefined)
}

onMounted(() => {
  initialize()
})

watch([props, propsError], () => {
  // Re-render when props change
}, { deep: true })
</script>

<template>
  <div class="my-widget">
    <!-- Loading State -->
    <div v-if="isLoading" class="state-message">
      Loading...
    </div>

    <!-- Error State -->
    <div v-else-if="propsError" class="state-message error">
      {{ propsError }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasData" class="state-message">
      No data to display
    </div>

    <!-- Content -->
    <div v-else class="content">
      <ul>
        <li v-for="(item, index) in props.data" :key="index">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

### src/styles.css

```css
/* Component wrapper */
.my-widget {
  font-family: inherit;
  color: var(--p-text-color);
  width: 100%;
  height: 100%;
  min-height: 100px;
}

/* State messages (loading, error, empty) */
.my-widget .state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  color: var(--p-text-muted-color, #6b7280);
  font-size: 0.875rem;
}

.my-widget .state-message.error {
  color: var(--p-red-500, #ef4444);
}

/* Main content area */
.my-widget .content {
  padding: 1rem;
}

.my-widget ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.my-widget li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-surface-200, #e5e7eb);
}

.my-widget li:last-child {
  border-bottom: none;
}

/* Dark mode support via CSS variables */
@media (prefers-color-scheme: dark) {
  .my-widget li {
    border-bottom-color: var(--p-surface-700, #374151);
  }
}
```

---

## Complete Working Example - Bar Chart Component

Here's a fully functional bar chart component that demonstrates all the patterns:

### package.json
```json
{
  "name": "@myorg/widget-bar-chart",
  "version": "1.0.0",
  "specification": "wippy-component-1.0",
  "title": "Simple Bar Chart",
  "description": "A bar chart component using Chart.js",
  "browser": "dist/index.js",
  "files": ["dist/", "src/", "package.json"],
  "dependencies": {
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0"
  },
  "devDependencies": {
    "@wippy-fe/proxy": "^0.0.1",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vue-tsc": "^2.0.0"
  },
  "peerDependencies": {
    "@iconify/vue": "^5.0.0",
    "@wippy-fe/proxy": "*",
    "luxon": "^3.5.0",
    "pinia": "^2.1.0",
    "vue": "^3.5.0"
  },
  "wippy": {
    "tagName": "bar-chart",
    "type": "widget",
    "props": {
      "type": "object",
      "properties": {
        "data": {
          "type": "array",
          "items": { "type": "number" },
          "default": [],
          "description": "Array of numbers to display"
        }
      },
      "required": ["data"]
    },
    "scripts": {
      "build": "build",
      "debug": "build:debug"
    }
  },
  "scripts": {
    "build": "vite build",
    "build:debug": "vite build --mode development"
  }
}
```

### src/index.ts
```typescript
import type { App, Ref } from 'vue'
import type { Events } from './constants.ts'
import { addCollection } from '@iconify/vue'
import { addIcons, define, hostCss, loadCss } from '@wippy-fe/proxy'
import { createApp, ref } from 'vue'

import BarChart from './app/bar-chart.vue'
import { PROPS_ERROR_PROVIDER, PROPS_PROVIDER, EVENT_PROVIDER } from './constants.ts'
import stylesText from './styles.css?inline'

export interface ComponentProps {
  data?: number[]
}

class BarChartElement extends HTMLElement {
  private vueApp: App<Element> | null = null
  private root: HTMLElement | null = null
  private props: Ref<ComponentProps> = ref({ data: [] })
  private propsError: Ref<string | null> = ref(null)
  private internals!: ElementInternals

  static get observedAttributes() {
    return ['data']
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
  }

  private emitEvent<K extends keyof Events>(eventName: K, detail: Events[K]) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
    }))
  }

  private parseProps(changedProp?: string, isSameValue = false) {
    if (!changedProp || (changedProp === 'data' && !isSameValue)) {
      const dataAttr = this.getAttribute('data')
      let data: number[] = []

      if (dataAttr) {
        try {
          data = JSON.parse(dataAttr)
          if (!Array.isArray(data) || !data.every(item => typeof item === 'number')) {
            this.propsError.value = 'Invalid data format: expected array of numbers.'
            this.emitEvent('invalid', { message: this.propsError.value })
          } else {
            this.propsError.value = null
            this.props.value.data = data
          }
        } catch {
          this.propsError.value = 'Failed to parse data attribute.'
          this.emitEvent('invalid', { message: this.propsError.value })
        }
      }
    }
    console.debug('BarChartElement props updated:', this.props.value)
  }

  connectedCallback() {
    this.internals.states.add('loading')
    try {
      const shadow = this.attachShadow({ mode: 'open' })

      // Inject component styles
      const styleEl = document.createElement('style')
      styleEl.textContent = stylesText
      shadow.appendChild(styleEl)

      // Load host CSS (fonts + theme + PrimeVue)
      Promise.all([
        loadCss(hostCss.fontCssUrl),
        loadCss(hostCss.themeConfigUrl),
        loadCss(hostCss.primeVueCssUrl),
      ]).then((cssChunks) => {
        cssChunks.forEach((css) => {
          const style = document.createElement('style')
          style.textContent = css
          style.role = '@wippy/host-css'
          shadow.appendChild(style)
        })
      })

      // Create and mount Vue app
      this.root = document.createElement('div')
      shadow.appendChild(this.root)

      this.vueApp = createApp(BarChart)
      this.vueApp.provide(PROPS_PROVIDER, this.props)
      this.vueApp.provide(PROPS_ERROR_PROVIDER, this.propsError)
      this.vueApp.provide(EVENT_PROVIDER, this.emitEvent.bind(this))
      this.vueApp.mount(this.root)

      // Parse initial props
      this.parseProps()

      addIcons(addCollection)

      this.internals.states.delete('loading')
      this.internals.states.add('ready')

      this.emitEvent('load', undefined)
    } catch (error) {
      console.error('Failed to initialize BarChartElement:', error)

      this.internals.states.delete('loading')
      this.internals.states.add('error')

      this.emitEvent('error', {
        message: error instanceof Error ? error.message : String(error),
        error,
      })
    }
  }

  disconnectedCallback() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
    this.emitEvent('unload', undefined)

    this.internals.states.clear()
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    this.parseProps(name, oldVal === newVal)
  }
}

export async function webComponent() {
  return BarChartElement
}

define(import.meta.url, BarChartElement)
```

### src/constants.ts
```typescript
import type { InjectionKey, Ref } from 'vue'
import type { ComponentProps } from './index.ts'

export const PROPS_PROVIDER = Symbol('props') as InjectionKey<Ref<ComponentProps>>
export const PROPS_ERROR_PROVIDER = Symbol('props_error') as InjectionKey<Ref<string | null>>

// Event system types
export interface Events {
  load: undefined
  unload: undefined
  error: { message: string, error: unknown }
  invalid: { message: string }
  rendered: undefined
}

export type EventEmitter = <K extends keyof Events>(event: K, details: Events[K]) => void
export const EVENT_PROVIDER = Symbol('emit') as InjectionKey<EventEmitter>
```

### src/app/bar-chart.vue
```vue
<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { computed, inject, onMounted, ref, watch, nextTick } from 'vue'
import { PROPS_ERROR_PROVIDER, PROPS_PROVIDER, EVENT_PROVIDER } from '../constants.ts'

const props = inject(PROPS_PROVIDER)!
const propsError = inject(PROPS_ERROR_PROVIDER)!
const emit = inject(EVENT_PROVIDER)!

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartData = ref<any>(null)
const chartOptions = ref<any>(null)

const isValidData = computed(() => {
  return !propsError?.value && props?.value?.data?.length > 0
})

function initializeChart() {
  if (!isValidData.value) return

  const data = props?.value.data || []
  const labels = Array.from({ length: data.length }, (_, i) => `Item ${i + 1}`)

  chartData.value = {
    labels,
    datasets: [{
      label: 'Data',
      data,
      backgroundColor: 'rgba(0, 95, 178, 0.8)',
      borderColor: 'rgb(0, 95, 178)',
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  chartOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
  
  // Emit rendered event after chart is initialized
  nextTick(() => {
    emit('rendered', undefined)
  })
}

onMounted(() => initializeChart())
watch([props, propsError], () => initializeChart(), { deep: true })
</script>

<template>
  <div class="bar-chart-component">
    <div v-if="propsError" class="error-message">
      {{ propsError }}
    </div>
    <div v-else-if="!isValidData" class="empty-message">
      No data to display
    </div>
    <Bar v-else :data="chartData" :options="chartOptions" class="chart-container" />
  </div>
</template>
```

### src/styles.css
```css
.bar-chart-component {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.bar-chart-component .error-message {
  color: var(--p-error-color, #ef4444);
  padding: 1rem;
  font-size: 0.875rem;
}

.bar-chart-component .empty-message {
  color: var(--p-text-muted-color, #6b7280);
  padding: 1rem;
  font-size: 0.875rem;
}

.bar-chart-component .chart-container {
  width: 100%;
  height: 100%;
}
```

## Deliverables:
1. Complete file structure with all necessary files
2. Fully functional Vue component with proper state management
3. Web component wrapper with shadow DOM
4. Props validation and error handling
5. Build configuration files
6. TypeScript interfaces and types
7. Basic styling (Tailwind or custom CSS)
8. Clear inline documentation

## Additional Notes:
- Prefer Vue 3 Composition API unless vanilla JS is more appropriate
- Always use TypeScript for type safety
- Include proper loading and error states
- Make components accessible (ARIA labels, keyboard navigation)
- Consider mobile responsiveness
- Add console.debug statements for development
- Follow the patterns from the complete example above
- For full @wippy-fe/proxy API documentation, refer to the TypeScript definitions in `@wippy-fe/proxy`