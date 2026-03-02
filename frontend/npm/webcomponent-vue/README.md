# @wippy-fe/webcomponent-vue

Vue 3 integration layer for Wippy web components. Extends `@wippy-fe/webcomponent-core` with reactive props, Pinia state management, and Vue provider injection.

## What it does

- **Vue app lifecycle** — creates and mounts a Vue 3 app inside the shadow DOM container
- **Reactive props** — attribute changes flow through a Vue `ref()` that components can `inject()`
- **Pinia** — automatically installed on every Vue app instance
- **Provider injection** — exposes props, errors, and an event emitter via Vue's `provide`/`inject`
- **Plugin support** — install additional Vue plugins via `vueConfig.plugins`
- **Custom providers** — hook into the Vue app before mount via `vueConfig.providers`

## What it does NOT do

- DOM setup, CSS loading, or prop parsing — that's handled by `@wippy-fe/webcomponent-core` (see its README for CSS guide)
- Component registration — use `define(import.meta.url, YourElement)` (re-exported from core)
- Any React/Svelte/etc. integration — this package is Vue-only

## Quick Start

```ts
import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import MyApp from './app/my-app.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class MyElement extends WippyVueElement {
  static get wippyConfig() {
    return {
      propsSchema: pkg.wippy.props,
      hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl'],
      containerClasses: ['h-full'],
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      rootComponent: MyApp,
    }
  }
}

export async function webComponent() {
  return MyElement
}

define(import.meta.url, MyElement)
```

## API Reference

### `WippyVueElement` (abstract class)

Extends `WippyElement` from `@wippy-fe/webcomponent-core`.

#### Static getters to override

```ts
static get wippyConfig(): WippyElementConfig  // from core — see core README for full options
static get vueConfig(): WippyVueElementConfig
```

#### `WippyVueElementConfig`

```ts
interface WippyVueElementConfig {
  /** The root Vue component to mount. */
  rootComponent: Component

  /** Additional Vue plugins to install (beyond Pinia). */
  plugins?: Array<{ install: (app: App) => void }>

  /** Extra providers to inject. Called after standard providers are set up. */
  providers?: (app: App, element: WippyVueElement) => void
}
```

#### Lifecycle hooks

`WippyVueElement` implements `onMount`, `onUnmount`, and `onPropsChanged` from the base class. You can still override the other hooks from `WippyElement`:

| Hook | Available? | Notes |
|------|-----------|-------|
| `onInit(shadow)` | Override freely | Runs before CSS/container |
| `onMount(...)` | Implemented by WippyVueElement | Do not override — use `vueConfig` instead |
| `onReady()` | Override freely | Runs after Vue app is mounted and state is `ready` |
| `onError(error)` | Override freely | Custom error handling |
| `onUnmount()` | Implemented by WippyVueElement | Do not override |
| `onPropsChanged(...)` | Implemented by WippyVueElement | Updates reactive refs automatically |

### Provider Symbols

Import these in your Vue components to access injected values:

```ts
import { EVENT_PROVIDER, PROPS_PROVIDER, PROPS_ERROR_PROVIDER } from '@wippy-fe/webcomponent-vue'

// In setup()
const props = inject(PROPS_PROVIDER)!        // Ref<Record<string, unknown>>
const errors = inject(PROPS_ERROR_PROVIDER)!  // Ref<string[]>
const emit = inject(EVENT_PROVIDER)!          // (event: string, detail?) => void
```

| Symbol | Type | Description |
|--------|------|-------------|
| `EVENT_PROVIDER` | `(event: string, detail?) => void` | Emits CustomEvents from the host element |
| `PROPS_PROVIDER` | `Ref<Record<string, unknown>>` | Reactive parsed props from attributes |
| `PROPS_ERROR_PROVIDER` | `Ref<string[]>` | Reactive list of prop parsing errors |

### Re-exports from core

For convenience, this package re-exports everything from `@wippy-fe/webcomponent-core`:

- `WippyElement`, `define`
- `WippyElementConfig`, `WippyPropsSchema`, `WippyPropDefinition`, `HostCssKey`, `ParseResult`

## Adding Plugins

```ts
static get vueConfig() {
  return {
    rootComponent: MyApp,
    plugins: [createI18n({ /* ... */ })],
  }
}
```

## Custom Providers

```ts
import { MY_SERVICE } from './services'

static get vueConfig() {
  return {
    rootComponent: MyApp,
    providers(app, element) {
      app.provide(MY_SERVICE, new MyService(element))
    },
  }
}
```

## Migration from monolithic pattern

**Before** — every component duplicates ~170 lines:
```ts
class MyElement extends HTMLElement {
  private vueApp: App | null = null
  private props: Ref<...> = ref({})
  // ... shadow DOM, CSS loading, prop parsing, Vue setup, events ...
}
```

**After** — ~20 lines:
```ts
class MyElement extends WippyVueElement {
  static get wippyConfig() {
    return {
      propsSchema: pkg.wippy.props,
      hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl'],
      containerClasses: ['h-full'],
      inlineCss: stylesText,
    }
  }
  static get vueConfig() {
    return { rootComponent: MyApp }
  }
}
```

All the boilerplate (shadow DOM, CSS, prop parsing, Vue lifecycle, Pinia, providers) is handled by the base classes.
