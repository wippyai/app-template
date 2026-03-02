# Wippy Application Template

A starter Wippy application with user management, AI assistant, and admin frontend.

## Prerequisites

- [Wippy CLI](https://wippy.ai)
- Node.js 18+

## Quick Start

```bash
cp .env.example .env
make build
wippy run -c
```

Open `http://localhost:8080`. Default admin: `admin@wippy.local` / `admin123`.

## Development

```bash
# Build main app
cd frontend/applications/main && npm install && npm run build -- --outDir ../../../static/app/main --emptyOutDir

# Build a web component
cd frontend/web-components/reaction-bar && npm install && npm run build -- --outDir ../../../static/wc/reaction-bar --emptyOutDir

# Frontend watch mode (main app)
cd frontend/applications/main && npm run dev

# Server (separate terminal)
wippy run -c
```

## Configuration

All runtime configuration is driven by environment variables and the facade dependency parameters in `src/app/deps/_index.yaml`.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_URL` | Public-facing API URL | `http://localhost:8080` |
| `ENCRYPTION_KEY` | Data encryption key (hex) | Auto-generated on first boot |
| `ANTHROPIC_API_KEY` | Claude API key for AI assistant | - |

### Facade Parameters

The `wippy/facade` dependency controls the frontend shell:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app_title` | Sidebar title | `Wippy` |
| `app_name` | Full app name | `Wippy AI` |
| `app_icon` | Iconify icon reference | `wippy:logo` |
| `show_admin` | Show admin controls | `true` |
| `hide_nav_bar` | Hide left sidebar | `false` |
| `start_nav_open` | Nav open on load | `false` |
| `allow_select_model` | User model selection | `false` |
| `disable_right_panel` | Disable right sidebar | `false` |
| `session_type` | `non-persistent` or `cookie` | `non-persistent` |
| `history_mode` | `hash` or `history` | `hash` |
| `login_path` | Unauthenticated redirect | `/login.html` |
| `custom_css` | CSS injected into frontend | Poppins font import |
| `css_variables` | JSON object of CSS custom properties | `{}` |
| `icons` | JSON object of custom Iconify icons | `{}` |

CSS variables use PrimeVue naming: `p-primary`, `p-primary-500`, `p-surface-0`, `p-text-color`, etc.

## Structure

```
src/app/                          Backend (Wippy Lua)
  api/                            HTTP endpoints
  agents/                         AI agent definitions
  users/                          User management
  security/                       Access control
  models/                         LLM model config
  views/                          Frontend page registration
  deps/                           Module dependencies
  env/                            Environment storage

frontend/
  applications/main/              Vue 3 admin panel (view.page)
  npm/
    webcomponent-core/            Base WippyElement class (Shadow DOM, CSS loading, prop parsing)
    webcomponent-vue/             WippyVueElement (Vue 3 integration, reactive props, Pinia)
  web-components/
    reaction-bar/                 Emoji reaction buttons (example-reaction-bar)
    websocket-log/                WebSocket message log (example-websocket-log)
    chart-circle/                 Chart.js doughnut chart (example-chart-circle)
    mermaid/                      Mermaid diagram renderer (example-mermaid)
    markdown/                     Markdown renderer (example-markdown)
    model-gallery/                AI model card grid (example-model-gallery)

static/                           Static assets (login page)
  app/main/                       Built main app (generated)
  wc/*/                           Built web components (generated)
```

## Web Component Examples

The project includes 6 web component examples demonstrating different capabilities of the Wippy web component architecture.

### Architecture

Components are built on a two-layer base class system:

- **`WippyElement`** (`@wippy-fe/webcomponent-core`) — Shadow DOM, host CSS loading, prop parsing from HTML attributes, event emission
- **`WippyVueElement`** (`@wippy-fe/webcomponent-vue`) — Vue 3 app mounting, reactive props via `useComponentProps()`, typed events via `useComponentEvents()`, Pinia store support, children content via `useContent()`

Each component is a self-contained ES module that registers a custom element tag. The host platform loads them dynamically and provides CSS assets (theme, fonts, PrimeVue) into each component's Shadow DOM.

### Components

| Component | Tag | Key Demo |
|-----------|-----|----------|
| **reaction-bar** | `example-reaction-bar` | Event emission (`useComponentEvents()`), PrimeVue Button, Tailwind CSS |
| **websocket-log** | `example-websocket-log` | WebSocket subscription via `on()` from proxy, theme-aware CSS |
| **chart-circle** | `example-chart-circle` | Bundled 3rd-party lib (Chart.js), canvas rendering |
| **mermaid** | `example-mermaid` | Bundled lib (beautiful-mermaid), CSS variable theming, children content |
| **markdown** | `example-markdown` | markdown-it + sanitize-html, children content, `markdownCssUrl` |
| **model-gallery** | `example-model-gallery` | Proxy API fetch (`api.get()`), PrimeVue Components (Button, Tag), Tailwind + PrimeUI |

### Children Content Pattern

Components can read content from child `<template data-type="...">` elements. Enable via `contentTemplate` in the component config:

```html
<example-mermaid>
  <template data-type="text/vnd.mermaid">
    graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Do it]
      B -->|No| D[Skip it]
  </template>
</example-mermaid>

<example-markdown>
  <template data-type="text/markdown">
    # Hello World
    This is **bold** and [a link](https://example.com).
  </template>
</example-markdown>
```

Uses `<template>` instead of `<script>` because Vue templates strip script tags. The native `<template>` element is inert (not rendered) and works in both raw HTML and Vue SFC templates. Content is extracted via `.content.textContent` on mount and updated via `MutationObserver`. Props always take priority over children content. In Vue components, access via `useContent()`.

### Best Practices

- **No root-level padding or margin.** Components must not add padding or margin to their outermost element. The consumer (host page, layout container, or parent component) controls all edge spacing.
- **Inline styles for Shadow DOM.** Tailwind classes work because they're compiled at build time into an inline CSS string injected as a `<style>` element. Host CSS (fonts, theme, PrimeVue) is loaded asynchronously via `hostCssKeys`.
- **PrimeVue unstyled mode.** Components that use PrimeVue must install it with `{ theme: 'none' }` via `vueConfig.plugins` and bundle it (not externalize). The `tailwindcss-primeui` Tailwind plugin generates the component class styles. Request `primeVueCssUrl` in `hostCssKeys` for host-provided styles.
- **Theme-aware colors.** Use semantic CSS variables (`--p-content-background`, `--p-text-color`, `--p-content-border-color`, `--p-text-muted-color`) for colors. Never use numbered surface variables (`--p-surface-0`, `--p-surface-100`) for theme-dependent colors — they are a fixed light-to-dark scale that does not flip with dark mode. For derived shades, use `color-mix()`: `color-mix(in srgb, var(--p-content-background) 85%, var(--p-text-color) 15%)`.
- **Vite externals.** Always externalize: `vue`, `pinia`, `@iconify/vue`, `@wippy-fe/proxy` (provided by host import maps). Bundle everything else (chart.js, primevue, markdown-it, etc.).
- **ESLint.** Each package has its own `.eslintrc.cjs` with `vue-eslint-parser`, `@typescript-eslint/strict`, and `plugin:vue/vue3-recommended`. Run `npm run lint` per package.

### Building

```bash
# Build all (main app + all web components)
# See Makefile for individual targets

# Build individual component
cd frontend/web-components/reaction-bar && npm install && npm run build -- --outDir ../../../static/wc/reaction-bar --emptyOutDir

# Lint individual component
cd frontend/web-components/reaction-bar && npm run lint
```

## Testing

```bash
wippy run test users
```

## Documentation

- [wippy.ai](https://wippy.ai) - Full documentation
- [wippy.ai/llms.txt](https://wippy.ai/llms.txt) - LLM-friendly docs

### Development Guidelines

See [`frontend/docs/README.md`](frontend/docs/README.md) for the full documentation index. Key guides:

- [`component-guide.md`](frontend/docs/component-guide.md) — Web component development (WippyVueElement, props, events, Shadow DOM, PrimeVue)
- [`app-guide.md`](frontend/docs/app-guide.md) — Web app development (routing, Vite config, proxy API)
- [`best-practices.md`](frontend/docs/best-practices.md) — Vue 3, Tailwind CSS, accessibility, code quality
- [`proxy-api.md`](frontend/docs/proxy-api.md) — Wippy Proxy API reference
- [`host-spec.md`](frontend/docs/host-spec.md) — Host contract specification
