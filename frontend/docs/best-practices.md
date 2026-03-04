# Frontend Best Practices

> Vue 3, Tailwind CSS, and general frontend guidelines for Wippy applications.
>
> For building web components, see [component-guide.md](component-guide.md).
> For building web apps, see [app-guide.md](app-guide.md).

---

## Vue 3

### Composition API
- **Always use the Composition API** with `<script setup>` syntax
- **TypeScript first**: Define interfaces for props and use `withDefaults` for default values
- **Script block at top**: Place `<script setup lang="ts">` before `<template>`
- **Prefer `ref` over `reactive`**
- **Use computed properties** for derived state instead of methods

### Standard Imports
```ts
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
```

### Component Structure
```vue
<script setup lang="ts">
interface Props {
  title: string
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

### State Management (Pinia)
```ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (credentials: LoginCredentials) => {
    // Implementation
  }

  const logout = () => {
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
})
```

### Composables
- Name files with `use` prefix: `useToggle.ts`, `useAuth.ts`
- Return reactive references and functions
- Use `readonly()` for state that shouldn't be mutated from outside
- Keep composables focused on a single concern

```ts
import { ref, readonly } from 'vue'

export const useToggle = (initialValue = false) => {
  const state = ref(initialValue)
  const toggle = () => { state.value = !state.value }
  return { state: readonly(state), toggle }
}
```

### Performance
- Use `shallowRef` for large objects that don't need deep reactivity
- Use `v-once` for static content that never changes
- Lazy load components with `defineAsyncComponent`
- Use code splitting with dynamic imports

---

## Tailwind CSS

### Rules
- **Web apps**: Prefer Tailwind utility classes for all styling
- **Web components**: Use `styles.css?inline` imports — can include both Tailwind and custom CSS inside Shadow DOM
- Apply responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Use Tailwind's spacing scale consistently
- Leverage `@apply` sparingly, only for highly reused utility combinations

### Theming with PrimeVue Variables
The shared Tailwind preset from `@wippy-fe/theme/tailwind.config` includes `tailwindcss-primeui`, which maps Tailwind classes to PrimeVue CSS variables. See `@wippy-fe/theme/THEMING.md` for the full reference on available CSS variables, utility classes, and dark mode behavior.
- `bg-primary`, `bg-primary-500`, `text-primary` → `--p-primary-*`
- `bg-surface-0`, `text-surface-700` → `--p-surface-*`
- `bg-secondary-500`, `text-secondary-300` → `--p-secondary-*`
- `bg-danger-500`, `text-success-700`, `border-warn-200` → severity palettes

### Semantic Severity Colors (MANDATORY)

**When a color conveys meaning (error, success, warning, info, help), always use the semantic severity palette — never raw Tailwind color names.** Semantics first, decorative later.

| Use this | NOT this | When |
|----------|----------|------|
| `text-danger-500` | `text-red-500` | Errors, destructive actions, validation failures |
| `bg-success-100` | `bg-green-100` | Success states, confirmations |
| `border-warn-200` | `border-orange-200` | Warnings, caution states |
| `text-info-600` | `text-sky-600` | Informational messages |
| `bg-help-50` | `bg-purple-50` | Help text, hints |
| `text-accent-500` | `text-teal-500` | Highlights, special callouts |

Raw Tailwind colors (`red-*`, `green-*`, `orange-*`, `sky-*`, `purple-*`, `teal-*`) are only appropriate for purely decorative use where no semantic meaning is attached.

In inline styles and `v-html`, use the CSS variables directly: `var(--p-danger-500)`, `var(--p-success-700)`, etc.

Example:
```vue
<template>
  <div class="flex flex-col gap-4 p-6 bg-surface-0 rounded-lg shadow-sm">
    <h2 class="text-xl font-semibold text-surface-900">{{ title }}</h2>
    <p class="text-sm text-surface-500 leading-relaxed">{{ description }}</p>
  </div>
</template>
```

### Theme-Aware CSS Variables
When writing custom CSS (e.g., in web component `styles.css`), use semantic variables that adapt to dark mode:

| Variable | Purpose |
|----------|---------|
| `--p-content-background` | Content area background |
| `--p-text-color` | Primary text |
| `--p-text-muted-color` | Secondary/muted text |
| `--p-content-border-color` | Borders and dividers |

**Never** use `--p-surface-0`, `--p-surface-200`, etc. for theme-dependent colors — they are a fixed scale that does not flip with dark mode.

For derived shades, use `color-mix()`:
```css
background: color-mix(in srgb, var(--p-content-background) 85%, var(--p-text-color) 15%);
```

---

## PrimeVue

- **Unstyled mode**: PrimeVue 4 installed via `PrimeVuePlugin` from `@wippy-fe/theme/primevue-plugin` — styled via `tailwindcss-primeui`
- **Web components**: Bundle PrimeVue (add to `dependencies`, not externals). Request `primeVueCssUrl` in `hostCssKeys`
- **Web apps**: Externalize PrimeVue and add `primevue/*` subpath entries to the app's own import map in `app.html`

---

## Data Fetching

All API access in Wippy goes through the proxy layer. The access pattern differs by context:

### Web Apps
```ts
const api = await window.$W.api()
const users = await api.get('/api/v1/users')
```

### Web Components
```ts
import { api } from '@wippy-fe/proxy'
const users = await api.get('/api/v1/users')
```

### TanStack Query (Web Apps)
Optional for complex scenarios (caching, deduplication, pagination):
```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const api = await window.$W.api()

const { data: users, isLoading, isError } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/api/v1/users'),
})
</script>
```

---

## Icons

- Use **Iconify** via `@iconify/vue`: `<Icon icon="tabler:settings" />`
- Prefer **Tabler icons** (`tabler:icon-name`)
- Never use inline SVGs for standard icons
- Use `aria-hidden="true"` for decorative icons, `aria-label` for meaningful ones

---

## Accessibility

- Use semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`, `<article>`
- Include proper ARIA roles and attributes on interactive elements
- Ensure keyboard navigation: `tabindex`, `@keydown.enter`, `@keydown.space`
- Add descriptive `aria-label` for screen readers
- Maintain color contrast ratios (4.5:1 minimum for text)
- Ensure focus states are visible: `focus:ring-2 focus:outline-none`

---

## Code Quality

- Use TypeScript with proper type definitions — never use `any`
- Use early returns to reduce nesting
- Prefix event handlers with `handle` (e.g., `handleClick`, `handleSubmit`)
- Write COMPLETE code — never leave TODOs or placeholders
- Handle all states: loading, error, empty, success
- Use kebab-case for file names (e.g., `user-card.vue`, `login-form.ts`)

---

## File Structure

### Web Apps
```
src/
├── components/
│   ├── ui/           # Reusable UI primitives
│   ├── features/     # Feature-specific components
│   └── layout/       # Layout components
├── composables/      # Vue composables
├── views/            # Page/route components
├── stores/           # Pinia stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Web Components
See [component-guide.md](component-guide.md) for web component file structure.
