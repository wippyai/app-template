# @wippy-fe/webcomponent-core

Framework-agnostic base class for building Wippy web components. Handles the boilerplate every component needs — shadow DOM, CSS loading, schema-driven prop parsing, ElementInternals state, and lifecycle events — so your subclass only deals with framework-specific mounting.

## What it does

- **Shadow DOM setup** with configurable mode (`open`/`closed`) and container `<div>`
- **Host CSS inheritance** — loads Wippy platform CSS into the shadow root so the component matches the host theme
- **Inline CSS injection** — injects component-specific styles from `?inline` imports
- **Schema-driven prop parsing** — reads `wippy.props` from package.json and auto-converts attributes to typed JS values
- **ElementInternals** — manages `loading` → `ready` / `error` states
- **Lifecycle hooks** — `onInit`, `onMount`, `onReady`, `onError`, `onUnmount`, `onPropsChanged`
- **Lifecycle events** — emits `load`, `unload`, `error` as CustomEvents that cross shadow boundaries
- **Icon registration** — calls `addIcons(addCollection)` from `@wippy-fe/proxy`

## What it does NOT do

- Any framework setup (Vue, React, Svelte, etc.) — that's for framework-specific packages like `@wippy-fe/webcomponent-vue`
- Component registration — use `define(import.meta.url, YourElement)` from this package
- State management — the base class is stateless; your framework layer manages state

## CSS: How Styling Works in Shadow DOM

Shadow DOM blocks style inheritance from the host page. A web component must explicitly bring in any styles it needs. There are two mechanisms:

### Inline CSS (`inlineCss`)

Your component's **own** styles — Tailwind utilities, custom classes, layout rules. Bundled at build time via Vite's `?inline` import and injected **synchronously** into the shadow root before mount.

```ts
import stylesText from './styles.css?inline'

static get wippyConfig() {
  return {
    propsSchema: pkg.wippy.props,
    inlineCss: stylesText,  // your component's CSS, injected immediately
  }
}
```

Every component with its own stylesheet needs this.

### Host CSS Inheritance (`hostCssKeys`)

Shared **platform CSS** loaded at runtime from the Wippy host into the shadow root. This is how your component inherits the host app's look-and-feel. Loaded **asynchronously** (non-blocking — the component becomes interactive before CSS finishes loading).

| Key | What it provides | When to include |
|-----|-----------------|-----------------|
| `fontCssUrl` | Platform font definitions | Almost always — skip only if using fully custom fonts |
| `themeConfigUrl` | CSS custom properties (color scales, spacing, radii, etc.) matching the host theme | **Recommended for all components.** This is what makes your component look consistent with the host. At dev time, a local `theme-config.css` provides fallback values; at runtime the host injects the real theme. |
| `primeVueCssUrl` | PrimeVue component classes (`p-button`, `p-input`, etc.) in unstyled mode, styled to match the host | **Include if using any PrimeVue components** (buttons, forms, tables, etc.). Skip only for fully custom UI with zero PrimeVue usage. |
| `markdownCssUrl` | Styles for rendered markdown blocks | **Include only if rendering markdown.** |
| `iframeCssUrl` | Scrollbar styling and iframe-related styles | **Recommended for all components** so scrollbars match the host. |

**Choose what your component actually uses:**

```ts
// Standard component using PrimeVue UI (most common)
hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl']

// Also renders markdown content
hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'markdownCssUrl', 'iframeCssUrl']

// Minimal: just theme variables, no PrimeVue
hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'iframeCssUrl']

// Fully self-styled, no host inheritance
hostCssKeys: []
```

Default (when omitted): all five keys.

> **Note on dev-time duplication:** Your component's `styles.css` may import `theme-config.css` for local dev (so Tailwind/PostCSS can resolve theme variables). At runtime, the host provides the real theme via `themeConfigUrl`. This duplication is a known trade-off — the host's runtime values take precedence.

## API Reference

### `WippyElement` (abstract class)

Extend this class and implement the hooks you need.

#### Static getters to override

```ts
static get wippyConfig(): WippyElementConfig
```

Returns the component configuration. **Must be overridden** — the default returns an empty schema.

```ts
static get observedAttributes(): string[]
```

Automatically derived from `wippyConfig.propsSchema.properties` + `extraObservedAttributes`. You rarely need to override this.

#### Lifecycle hooks

All hooks are optional except `onMount` and `onUnmount` (abstract).

| Hook | When it runs | Use case |
|------|-------------|----------|
| `onInit(shadow)` | After shadow DOM attached, before CSS/container | Add extra DOM elements, configure shadow root |
| `onMount(shadow, container, props, errors)` | After CSS, container, icons, and props are ready | **Abstract.** Mount your framework here |
| `onReady()` | After internals state → `ready`, before `load` event | Post-mount logic, telemetry, deferred setup |
| `onError(error)` | When `connectedCallback` throws | Custom error reporting (default: `console.error`) |
| `onUnmount()` | During `disconnectedCallback` | **Abstract.** Tear down framework |
| `onPropsChanged(props, errors)` | When observed attributes change | Push new values into framework reactivity |

**Full lifecycle order:**
1. Shadow DOM attached (`open` or `closed`)
2. `onInit(shadow)`
3. Inline CSS injected (sync)
4. Host CSS loading started (async, non-blocking)
5. Container `<div>` created and appended
6. Icons registered
7. Props parsed from attributes
8. `onMount(shadow, container, props, errors)`
9. Internals state → `ready`
10. `onReady()`
11. `load` event emitted

On error: `onError(error)` → state → `error` → `error` event
On disconnect: `onUnmount()` → `unload` event → states cleared

#### Utility

```ts
protected emitEvent(eventName: string, detail?: unknown): void
```

Dispatches a `CustomEvent` with `bubbles: true, composed: true`.

### `define(importMetaUrl, ComponentClass)`

Re-exported from `@wippy-fe/proxy`. Registers the custom element if the import URL contains a `declare-tag` parameter.

### `parseProps(element, schema)`

Parses all attributes on an element according to a `WippyPropsSchema`. Returns `{ props, errors }`.

### `loadHostCss(shadow, keys?)`

Loads host CSS URLs into a shadow root. Non-blocking (returns a Promise).

### `injectInlineCss(shadow, text)`

Injects a `<style>` element with the given CSS text into the shadow root. Synchronous.

### `attrToCamel(attr)`

Converts kebab-case (`allowed-types`) to camelCase (`allowedTypes`).

## Types

```ts
interface WippyElementConfig {
  propsSchema: WippyPropsSchema
  shadowMode?: 'open' | 'closed'          // default: 'open'
  hostCssKeys?: HostCssKey[]               // default: font + theme + primeVue + markdown
  inlineCss?: string
  containerClasses?: string[]              // default: none
  extraObservedAttributes?: string[]
}

interface WippyPropsSchema {
  type?: string
  properties: Record<string, WippyPropDefinition>
}

interface WippyPropDefinition {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  default?: unknown
  description?: string
  items?: { type: string }
}

type HostCssKey = 'fontCssUrl' | 'themeConfigUrl' | 'primeVueCssUrl' | 'markdownCssUrl' | 'iframeCssUrl'
```

## Migration from monolithic pattern

**Before** — 170+ lines of boilerplate in every component:
```ts
class MyElement extends HTMLElement {
  // Manual shadow DOM, CSS loading, prop parsing, Vue setup, ...
}
```

**After** — extend `WippyElement` (or `WippyVueElement` for Vue components):
```ts
class MyElement extends WippyElement {
  static get wippyConfig() {
    return {
      propsSchema: pkg.wippy.props,
      hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl'],
      containerClasses: ['h-full'],
      inlineCss: stylesText,
    }
  }
  onMount(shadow, container, props, errors) { /* framework setup */ }
  onUnmount() { /* cleanup */ }
}
```
