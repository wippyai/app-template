import type { App, Component, Ref } from 'vue'
import { WippyElement } from '@wippy-fe/webcomponent-core'
import { createPinia } from 'pinia'
import { createApp, ref } from 'vue'
import { EVENT_PROVIDER, PROPS_PROVIDER, PROPS_ERROR_PROVIDER } from './providers.ts'

/**
 * Vue-specific configuration returned by `static get vueConfig()`.
 */
export interface WippyVueElementConfig {
  /** The root Vue component to mount. */
  rootComponent: Component
  /** Additional Vue plugins to install (beyond Pinia which is always installed). */
  plugins?: Array<{ install: (app: App) => void }>
  /** Extra providers to inject into the Vue app. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providers?: (app: App, element: WippyVueElement<any, any>) => void
}

/**
 * Vue 3 integration for Wippy web components.
 *
 * Generic over `Props` (parsed prop object type) and `Events` (event map).
 * These flow through to typed hooks, reactive refs, and composable helpers.
 *
 * Usage:
 * ```ts
 * class MyElement extends WippyVueElement<MyProps, MyEvents> {
 *   static get wippyConfig(): WippyElementConfig<MyProps> {
 *     return { propsSchema: pkg.wippy.props, inlineCss: stylesText }
 *   }
 *   static get vueConfig() {
 *     return { rootComponent: MyApp }
 *   }
 * }
 * ```
 *
 * In Vue components, use the typed composable helpers:
 * ```ts
 * const props = useProps<MyProps>()
 * const emit = useEvents<MyEvents>()
 * const errors = usePropsErrors()
 * ```
 */
export abstract class WippyVueElement<
  Props = Record<string, unknown>,
  Events = Record<string, unknown>,
> extends WippyElement<Props> {
  private _vueApp: App<Element> | null = null
  private _propsRef: Ref<Props> = ref({}) as Ref<Props>
  private _errorsRef: Ref<string[]> = ref([])

  /** @internal Phantom field to retain the Events type parameter. */
  declare readonly _events: Events

  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig(): WippyVueElementConfig {
    throw new Error('WippyVueElement subclass must override static get vueConfig()')
  }

  protected onMount(
    _shadow: ShadowRoot,
    container: HTMLElement,
    initialProps: Props,
    initialErrors: string[],
  ): void {
    const vueConfig = (this.constructor as typeof WippyVueElement).vueConfig

    // 1. Set reactive state
    this._propsRef.value = initialProps
    this._errorsRef.value = initialErrors

    // Emit initial errors as invalid events
    for (const error of initialErrors) {
      this.emitEvent('invalid', { message: error })
    }

    // 2. Create Vue app
    this._vueApp = createApp(vueConfig.rootComponent)
    this._vueApp.use(createPinia())

    // 3. Install extra plugins
    if (vueConfig.plugins) {
      for (const plugin of vueConfig.plugins) {
        this._vueApp.use(plugin)
      }
    }

    // 4. Provide standard injection keys
    this._vueApp.provide(PROPS_PROVIDER, this._propsRef as Ref<Record<string, unknown>>)
    this._vueApp.provide(PROPS_ERROR_PROVIDER, this._errorsRef)
    this._vueApp.provide(EVENT_PROVIDER, this.emitEvent.bind(this))

    // 5. Custom providers
    if (vueConfig.providers) {
      vueConfig.providers(this._vueApp, this)
    }

    // 6. Mount
    this._vueApp.mount(container)
  }

  protected onUnmount(): void {
    if (this._vueApp) {
      this._vueApp.unmount()
      this._vueApp = null
    }
  }

  protected onPropsChanged(props: Props, errors: string[]): void {
    this._propsRef.value = props
    this._errorsRef.value = errors

    for (const error of errors) {
      this.emitEvent('invalid', { message: error })
    }
  }
}
