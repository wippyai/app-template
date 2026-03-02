/**
 * JSON-Schema-style property descriptor used for attribute→prop parsing.
 */
export interface WippyPropDefinition {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  default?: unknown
  description?: string
  items?: { type: string }
}

/**
 * JSON-Schema-style props block — matches the `wippy.props` field in package.json.
 *
 * Example:
 * ```json
 * {
 *   "type": "object",
 *   "properties": {
 *     "allowed-types": { "type": "array", "items": { "type": "string" } },
 *     "max-file-size": { "type": "number", "default": 104857600 }
 *   }
 * }
 * ```
 */
export interface WippyPropsSchema {
  type?: string
  properties: Record<string, WippyPropDefinition>
}

/**
 * Keys that map to CSS URLs exposed by `@wippy-fe/proxy`'s `hostCss` object.
 * Pass a subset to `hostCssKeys` in config to load only what you need.
 */
export type HostCssKey = 'fontCssUrl' | 'themeConfigUrl' | 'primeVueCssUrl' | 'markdownCssUrl' | 'iframeCssUrl'

/**
 * Configuration object returned by `static get wippyConfig()`.
 *
 * Generic over `Props` so that `validateProps` receives the typed prop object.
 * Use `WippyElementConfig<MyProps>` as the return type of your static getter
 * to get typed validation:
 *
 * ```ts
 * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
 * ```
 */
export interface WippyElementConfig<Props = Record<string, unknown>> {
  /** JSON-schema props block (usually from package.json `wippy.props`). */
  propsSchema: WippyPropsSchema
  /** Shadow DOM mode. Defaults to `'open'`. */
  shadowMode?: 'open' | 'closed'
  /**
   * Host CSS to inherit from the Wippy platform into this component's shadow DOM.
   *
   * Shadow DOM blocks style inheritance, so platform styles (theme variables, fonts,
   * UI framework classes, etc.) must be explicitly loaded into each component's shadow root.
   * The host app provides these CSS assets at runtime via `@wippy-fe/proxy`.
   *
   * Available keys:
   * - `fontCssUrl` — Platform font definitions. Include unless using fully custom fonts.
   * - `themeConfigUrl` — CSS custom properties (color scales, spacing, etc.) matching the
   *    host theme. **Recommended for all components** — gives your component the same look
   *    as the host app. At dev time, a local copy (`theme-config.css`) provides fallback
   *    values; at runtime, the host injects the real theme.
   * - `primeVueCssUrl` — PrimeVue component classes (p-button, p-input, etc.) in unstyled
   *    mode, matching the host's appearance. **Include if using any PrimeVue components**
   *    (buttons, forms, tables, etc.). Skip only for fully custom UI with no PrimeVue.
   * - `markdownCssUrl` — Styles for rendered markdown blocks. **Include only if your
   *    component renders markdown content.**
   * - `iframeCssUrl` — Scrollbar styling and iframe-related styles. **Recommended for all
   *    components** so scrollbars look identical to the host app.
   *
   * Pass `[]` to skip host CSS entirely (fully self-styled component).
   * Defaults to `['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'markdownCssUrl', 'iframeCssUrl']`.
   */
  hostCssKeys?: HostCssKey[]
  /**
   * Component-specific CSS text to inject into the shadow root (synchronous).
   *
   * Typically from a Vite `?inline` import of your component's stylesheet.
   * This is your component's own styling — Tailwind utilities, custom classes, etc.
   * Unlike `hostCssKeys` which loads platform CSS at runtime, this is bundled at build time.
   */
  inlineCss?: string
  /**
   * Custom prop validation that runs after type parsing.
   *
   * Receives the already type-coerced props from the schema parser.
   * Return an array of error messages for any invalid values, or an empty array if all valid.
   * Errors are merged with any type-parsing errors and emitted as `invalid` events.
   *
   * Use this for domain-specific checks the JSON schema can't express:
   * - Value ranges (`max-file-size` must be positive)
   * - Array item types (`allowed-types` must be an array of strings)
   * - Cross-prop constraints (if X is set, Y must also be set)
   *
   * Example:
   * ```ts
   * validateProps: (props) => {
   *   const errors: string[] = []
   *   if (typeof props.maxFileSize === 'number' && props.maxFileSize < 0) {
   *     errors.push('max-file-size must be a positive number')
   *   }
   *   return errors
   * }
   * ```
   */
  validateProps?: (props: Props) => string[]
  /** CSS classes to add to the container div. Defaults to none. */
  containerClasses?: string[]
  /** Additional attribute names to observe beyond those in the props schema. */
  extraObservedAttributes?: string[]
}
