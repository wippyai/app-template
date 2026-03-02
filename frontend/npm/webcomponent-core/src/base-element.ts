import { addIcons, define } from '@wippy-fe/proxy'
import { addCollection } from '@iconify/vue'
import { loadHostCss, injectInlineCss } from './css-loader.ts'
import { parseProps } from './prop-parser.ts'
import type { WippyElementConfig } from './types.ts'

/**
 * Abstract base class for Wippy web components.
 *
 * Generic over `Props` — the parsed prop object type. This types `onMount`,
 * `onPropsChanged`, and `validateProps`. Defaults to `Record<string, unknown>`.
 *
 * Lifecycle order:
 *   1. shadow DOM attached
 *   2. `onInit(shadow)` — hook for early shadow DOM customization
 *   3. inline CSS injected
 *   4. host CSS loading started (async, non-blocking)
 *   5. container div created and appended
 *   6. icons registered
 *   7. props parsed from attributes + custom validation
 *   8. `onMount(shadow, container, props, errors)` — framework setup
 *   9. internals state → ready
 *  10. `onReady()` — post-mount hook
 *  11. `load` event emitted
 *
 * On error: `onError(error)` → internals state → error → `error` event
 * On disconnect: `onUnmount()` → `unload` event → internals cleared
 */
export abstract class WippyElement<Props = Record<string, unknown>> extends HTMLElement {
  private _internals!: ElementInternals
  private _contentObserver: MutationObserver | null = null

  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig(): WippyElementConfig {
    return { propsSchema: { properties: {} } }
  }

  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes(): string[] {
    const config = this.wippyConfig
    const schemaAttrs = Object.keys(config.propsSchema.properties)
    const extra = config.extraObservedAttributes ?? []
    return [...schemaAttrs, ...extra]
  }

  constructor() {
    super()
    this._internals = this.attachInternals()
  }

  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  protected emitEvent(eventName: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
    }))
  }

  // ── Lifecycle ──────────────────────────────────────────────

  connectedCallback(): void {
    this._internals.states.add('loading')
    try {
      const config = (this.constructor as typeof WippyElement).wippyConfig

      // 1. Shadow DOM (guard against reconnect — attachShadow throws if called twice)
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: config.shadowMode ?? 'open' })

      // 2. Early hook — customize shadow before CSS/container
      this.onInit(shadow)

      // 3. Inline CSS
      if (config.inlineCss) {
        injectInlineCss(shadow, config.inlineCss)
      }

      // 4. Host CSS (async, non-blocking)
      if (config.hostCssKeys === undefined || config.hostCssKeys.length > 0) {
        loadHostCss(shadow, config.hostCssKeys)
      }

      // 5. Container
      const container = document.createElement('div')
      const classes = config.containerClasses ?? []
      if (classes.length > 0) {
        container.classList.add(...classes)
      }
      shadow.appendChild(container)

      // 6. Icons
      addIcons(addCollection)

      // 7. Parse initial props + custom validation
      const { props, errors } = parseProps(this, config.propsSchema)
      if (config.validateProps) {
        errors.push(...config.validateProps(props))
      }
      const typedProps = props as Props

      // 7b. Extract children content (if contentTemplate configured)
      let initialContent: string | null = null
      if (config.contentTemplate) {
        initialContent = this._extractContent(config.contentTemplate)
        this._contentObserver = new MutationObserver(() => {
          const content = this._extractContent(config.contentTemplate!)
          this.onContentChanged(content)
        })
        this._contentObserver.observe(this, {
          childList: true,
          characterData: true,
          subtree: true,
        })
      }

      // 8. Framework mount
      this.onMount(shadow, container, typedProps, errors, initialContent)

      // 9. Ready
      this._internals.states.delete('loading')
      this._internals.states.add('ready')

      // 10. Post-mount hook
      this.onReady()

      // 11. Emit load
      this.emitEvent('load')
    } catch (error) {
      this.onError(error)
      this._internals.states.delete('loading')
      this._internals.states.add('error')
      this.emitEvent('error', {
        message: error instanceof Error ? error.message : String(error),
        error,
      })
    }
  }

  disconnectedCallback(): void {
    if (this._contentObserver) {
      this._contentObserver.disconnect()
      this._contentObserver = null
    }
    this.onUnmount()
    this.emitEvent('unload')
    this._internals.states.clear()
  }

  attributeChangedCallback(_name: string, oldVal: string | null, newVal: string | null): void {
    if (oldVal === newVal) return
    const config = (this.constructor as typeof WippyElement).wippyConfig
    const { props, errors } = parseProps(this, config.propsSchema)
    if (config.validateProps) {
      errors.push(...config.validateProps(props))
    }
    this.onPropsChanged(props as Props, errors)
  }

  // ── Hooks ──────────────────────────────────────────────────

  /** Called right after shadow DOM is attached, before CSS or container. */
  protected onInit(_shadow: ShadowRoot): void {}

  /** Called once after shadow DOM, CSS, and container are ready. Mount your framework here. */
  protected abstract onMount(
    shadow: ShadowRoot,
    container: HTMLElement,
    initialProps: Props,
    initialErrors: string[],
    initialContent?: string | null,
  ): void

  /** Called after internals state is set to ready, before the `load` event. */
  protected onReady(): void {}

  /** Called when connectedCallback throws. Default logs to console. */
  protected onError(error: unknown): void {
    console.error(`${this.constructor.name} initialization failed:`, error)
  }

  /** Called during disconnectedCallback — clean up framework resources. */
  protected abstract onUnmount(): void

  /** Called when observed attributes change. Override to update framework state. */
  protected onPropsChanged(_props: Props, _errors: string[]): void {}

  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  private _extractContent(dataType: string): string | null {
    const tpl = this.querySelector(`template[data-type="${dataType}"]`) as HTMLTemplateElement | null
    return tpl?.content.textContent?.trim() ?? null
  }

  /** Called when child `<template>` content changes. Override to update framework state. */
  protected onContentChanged(_content: string | null): void {}
}

export { define }
