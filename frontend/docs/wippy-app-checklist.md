# Wippy App Generation Checklist

Use this checklist to verify that a generated Wippy app is complete and correctly configured.

---

## 1. Required Files

### Root Directory
- [ ] `package.json` - Package configuration with Wippy metadata
- [ ] `app.html` - HTML entry point
- [ ] `vite.config.ts` - Vite build configuration
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] Single `tsconfig.json` covers both src and vite config (no separate tsconfig.node.json needed)
- [ ] `tailwind.config.ts` - Tailwind CSS configuration
- [ ] `postcss.config.js` - **CRITICAL**: Required for Tailwind to work

### src/ Directory
- [ ] `src/app.ts` - Main entry point with Wippy initialization
- [ ] `src/constants.ts` - Injection keys (HOST_API, AXIOS_INSTANCE, WIPPY_INSTANCE)
- [ ] `src/types.ts` - TypeScript type definitions
- [ ] `src/styles.css` - Base styles
- [ ] `src/tailwind.css` - Tailwind directives (@tailwind base/components/utilities)
- [ ] `src/theme-config.css` - Theme variable placeholder (can be empty)
- [ ] `src/app/app.vue` - Root Vue component with `<router-view />`
- [ ] `src/router/index.ts` - Router with host communication

### Pages (at least one required)
- [ ] `src/pages/*.vue` - At least one page component exists
- [ ] All routes in router have corresponding page files

---

## 2. package.json Validation

### Required Fields
- [ ] `name` follows format `@<namespace>/app-<description>`
- [ ] `version` is set (e.g., "1.0.0")
- [ ] `specification` is exactly `"wippy-component-1.0"`
- [ ] `title` is set (human-readable name)
- [ ] `description` is set
- [ ] `files` includes `["dist/", "src/", "package.json"]`

### wippy Configuration Block
- [ ] `wippy.type` is `"page"`
- [ ] `wippy.title` matches package title
- [ ] `wippy.icon` uses tabler icon format (e.g., `"tabler:chart-bar"`)
- [ ] `wippy.path` is `"dist/app.html"`
- [ ] `wippy.scripts.build` is `"build"`
- [ ] `wippy.scripts.debug` is `"build:debug"`

### wippy.proxy Configuration
- [ ] `wippy.proxy.enabled` is `true`
- [ ] `wippy.proxy.injections.css.fonts` is `true`
- [ ] `wippy.proxy.injections.css.themeConfig` is `true`
- [ ] `wippy.proxy.injections.css.iframe` is `true`
- [ ] `wippy.proxy.injections.css.primevue` is `true`
- [ ] `wippy.proxy.injections.css.markdown` is `true`
- [ ] `wippy.proxy.injections.css.customCss` is `true`
- [ ] `wippy.proxy.injections.css.customVariables` is `true`
- [ ] `wippy.proxy.injections.tailwindConfig` is `false` (unless using CDN Tailwind)
- [ ] `wippy.proxy.injections.resizeObserver` is `false` (unless widget)
- [ ] `wippy.proxy.injections.preventLinkClicks` is `false` (unless no router)
- [ ] `wippy.proxy.injections.iconifyIcons` is `false` (unless using CDN Iconify)

### Dependencies Structure
- [ ] `devDependencies` includes `@wippy-fe/types-global-proxy`
- [ ] `devDependencies` includes `@vitejs/plugin-vue`
- [ ] `devDependencies` includes `autoprefixer`
- [ ] `devDependencies` includes `primevue`
- [ ] `devDependencies` includes `tailwindcss` (version 3)
- [ ] `devDependencies` includes `tailwindcss-primeui`
- [ ] `devDependencies` includes `typescript`
- [ ] `devDependencies` includes `vite`
- [ ] `devDependencies` includes `vue` (for build-time)
- [ ] `devDependencies` includes `vue-router` (for build-time)
- [ ] `devDependencies` includes `vue-tsc`

### Peer Dependencies (host-provided, NOT bundled)
- [ ] `peerDependencies` includes `@iconify/vue`
- [ ] `peerDependencies` includes `@wippy-fe/proxy: "*"`
- [ ] `peerDependencies` includes `luxon`
- [ ] `peerDependencies` includes `pinia`
- [ ] `peerDependencies` includes `vue`
- [ ] `peerDependencies` includes `vue-router`
- [ ] `peerDependencies` includes `primevue`

### Scripts
- [ ] `scripts.build` is `"vite build"`
- [ ] `scripts.build:debug` is `"vite build --mode development"`

---

## 3. vite.config.ts Validation

- [ ] `base` is set to `""` (empty string) - **CRITICAL**
- [ ] `plugins` includes `vue()`
- [ ] `build.target` is `"esnext"`
- [ ] `build.rollupOptions.input` uses object format with `resolve(__dirname, 'app.html')`
- [ ] `build.rollupOptions.external` includes ALL of:
  - `'vue'`
  - `'pinia'`
  - `'vue-router'`
  - `'@iconify/vue'`
  - `'nanoevents'`
  - `'luxon'`
  - `'@wippy-fe/proxy'`
- [ ] `build.sourcemap` is `true`

---

## 4. app.html Validation

- [ ] Has `<!DOCTYPE html>` declaration
- [ ] Has `<html lang="en">`
- [ ] Has `<meta charset="UTF-8">`
- [ ] Has `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] Has `<script type="text/javascript" data-role="@wippy/scripts">` placeholder - **CRITICAL**
- [ ] Has `<script type="importmap">` with host-provided dependencies
- [ ] Has `<div id="app"></div>` mount point
- [ ] Has `<script type="module" src="./src/app.ts"></script>` entry

---

## 5. src/app.ts Validation (Main Entry)

### Imports
- [ ] Imports `addCollection` from `@iconify/vue`
- [ ] Imports `createPinia` from `pinia`
- [ ] Imports `createApp` from `vue`
- [ ] Imports `PrimeVue` from `primevue/config`
- [ ] Imports root App component
- [ ] Imports constants (HOST_API, AXIOS_INSTANCE, WIPPY_INSTANCE)
- [ ] Imports `createAppRouter` from router
- [ ] Imports CSS files (styles.css, theme-config.css, tailwind.css)

### createMainApp Function
- [ ] Awaits `window.$W.config()`
- [ ] Awaits `window.$W.host()`
- [ ] Awaits `window.$W.api()`
- [ ] Awaits `window.$W.instance()`
- [ ] Extracts `startPath` from `config.path ?? ''`
- [ ] Handles custom icons from `config.customization?.icons`
- [ ] Calls `createApp(App)`
- [ ] Uses `app.use(createPinia())`
- [ ] Uses `app.use(PrimeVue, { theme: 'none' })`
- [ ] Provides `HOST_API` injection
- [ ] Provides `AXIOS_INSTANCE` injection
- [ ] Provides `WIPPY_INSTANCE` injection
- [ ] Creates router with `createAppRouter(hostApi, instance.on, startPath)`
- [ ] Uses `app.use(router)`
- [ ] Returns `app`

### Auto-mount
- [ ] Exports `mountApp` function
- [ ] Calls `mountApp()` at module level

---

## 6. src/router/index.ts Validation

### Router Creation
- [ ] Imports `createMemoryHistory` and `createRouter` from `vue-router`
- [ ] Imports `HostApi` type from `../types`
- [ ] Exports `createAppRouter(host: HostApi, on: OnSubscription | null, startPath?: string): Router`
- [ ] Uses `createMemoryHistory()` without args - **NOT** `createWebHistory`, do NOT pass startPath
- [ ] Defines routes array with at least one route
- [ ] Has catch-all route `/:pathMatch(.*)*` for 404 handling

### Host Communication (MANDATORY)
- [ ] Has `router.afterEach()` that calls `host.onRouteChanged(to.fullPath)`
- [ ] Defensive null check: `if (on) { on('@history', ...) }` for host navigation changes
- [ ] Guards `!path` inside `@history` handler
- [ ] Handles start path via `router.push(normalized)` after full router creation (not `history.replace`)
- [ ] Updates router when host path changes

---

## 7. src/constants.ts Validation

- [ ] Imports `InjectionKey` from `vue`
- [ ] Imports types from `./types.ts`
- [ ] Exports `HOST_API` as `Symbol('host_api') as InjectionKey<HostApi>`
- [ ] Exports `AXIOS_INSTANCE` as `Symbol('axios') as InjectionKey<ProxyApiInstance['api']>`
- [ ] Exports `WIPPY_INSTANCE` as `Symbol('proxy') as InjectionKey<ProxyApiInstance>`

---

## 8. src/types.ts Validation

- [ ] Exports `HostApi` type: `Awaited<ReturnType<typeof window.$W.host>>`
- [ ] Exports `ProxyApiInstance` type: `Awaited<ReturnType<typeof window.$W.instance>>`
- [ ] Additional app-specific types as needed

---

## 9. CSS Files Validation

### src/styles.css
- [ ] Sets `html, body { height: 100%; margin: 0; padding: 0; }`
- [ ] Applies background/text colors: `@apply bg-surface-100 dark:bg-surface-950 text-surface-900 dark:text-surface-100;`
- [ ] Sets `#app { height: 100vh; }`

### src/tailwind.css
- [ ] Contains `@tailwind base;`
- [ ] Contains `@tailwind components;`
- [ ] Contains `@tailwind utilities;`

### src/theme-config.css
- [ ] File exists (can be empty or have placeholder comment)

---

## 10. tailwind.config.ts Validation

- [ ] Imports `TailwindScrollbar` from `tailwind-scrollbar`
- [ ] Imports `PrimeUI` from `tailwindcss-primeui`
- [ ] `content` includes `'./src/**/*.{vue,ts}'`
- [ ] `theme.extend.colors.secondary` uses CSS variables (`var(--p-secondary-*)`)
- [ ] `plugins` includes `PrimeUI`
- [ ] `plugins` includes `TailwindScrollbar` with `nocompatible: true`

---

## 11. postcss.config.js Validation

- [ ] File exists - **CRITICAL** (Tailwind won't work without it)
- [ ] Exports object with `plugins.tailwindcss: {}`
- [ ] Exports object with `plugins.autoprefixer: {}`

---

## 12. tsconfig.json Validation

- [ ] `compilerOptions.target` is `"ES2020"`
- [ ] `compilerOptions.module` is `"ESNext"`
- [ ] `compilerOptions.moduleResolution` is `"bundler"`
- [ ] `compilerOptions.strict` is `true`
- [ ] `compilerOptions.types` includes `"vite/client"` and `"@wippy-fe/types-global-proxy"`
- [ ] `include` covers `"src/**/*.ts"`, `"src/**/*.vue"`, and `"vite.config.ts"`

---

## 13. Vue Component Best Practices

### All .vue Files
- [ ] Use `<script setup lang="ts">` syntax
- [ ] Use Composition API (no Options API)
- [ ] File names use kebab-case (e.g., `user-profile.vue`)
- [ ] Component names in templates use PascalCase (e.g., `<UserProfile />`)

### Root app.vue
- [ ] Has `<router-view />` in template
- [ ] Has appropriate layout wrapper (e.g., `<main>` with padding)

### Page Components
- [ ] Each route has corresponding page file in `src/pages/`
- [ ] Pages use lazy loading in router: `() => import('../pages/xyz.vue')`

### Styling
- [ ] Uses Tailwind utility classes
- [ ] Uses PrimeVue components where appropriate
- [ ] Includes dark mode variants (`dark:` prefix)
- [ ] Uses CSS variables for theme colors (`var(--p-*)`)

### Icons
- [ ] Uses `<Icon icon="tabler:*">` component from `@iconify/vue`
- [ ] Does NOT use button icon props

### Host Services
- [ ] Uses `host.toast()` for notifications (not PrimeVue ToastService)
- [ ] Uses `host.confirm()` for confirmations (not PrimeVue ConfirmationService)

---

## 14. Common Errors to Check

- [ ] `base` in vite.config.ts is NOT missing or set to `'/'`
- [ ] `postcss.config.js` exists (Tailwind won't process without it)
- [ ] `theme-config.css` file exists (even if empty)
- [ ] `@wippy/scripts` placeholder exists in app.html
- [ ] Router uses `createMemoryHistory`, NOT `createWebHistory`
- [ ] Router has `onRouteChanged` in `afterEach`
- [ ] Router listens to `@history` event
- [ ] All external dependencies are in `build.rollupOptions.external`
- [ ] PrimeVue is initialized with `{ theme: 'none' }`

---

## Quick Validation Commands

After generation, run these to verify:

```bash
# Check all required files exist
ls -la package.json app.html vite.config.ts tsconfig.json postcss.config.js tailwind.config.ts
ls -la src/app.ts src/constants.ts src/types.ts src/styles.css src/tailwind.css src/theme-config.css
ls -la src/app/app.vue src/router/index.ts

# Verify package.json has required fields
grep -q '"specification": "wippy-component-1.0"' package.json && echo "OK: specification" || echo "MISSING: specification"
grep -q '"wippy"' package.json && echo "OK: wippy block" || echo "MISSING: wippy block"

# Verify critical vite config
grep -q 'base: ""' vite.config.ts && echo "OK: base empty" || echo "MISSING: base must be empty string"

# Verify postcss exists
test -f postcss.config.js && echo "OK: postcss.config.js exists" || echo "CRITICAL: postcss.config.js missing"

# Verify router uses memory history
grep -q 'createMemoryHistory' src/router/index.ts && echo "OK: memory history" || echo "ERROR: must use createMemoryHistory"

# Verify host communication in router
grep -q 'onRouteChanged' src/router/index.ts && echo "OK: onRouteChanged" || echo "MISSING: onRouteChanged in router"
grep -q "@history" src/router/index.ts && echo "OK: @history listener" || echo "MISSING: @history listener in router"
```
