import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

// ── Base injection keys (untyped) ────────────────────────────

/** Injection key for the event emitter function. */
export const EVENT_PROVIDER = Symbol('wippy:emit') as InjectionKey<
  (event: string, detail?: unknown) => void
>

/** Injection key for the reactive props ref. */
export const PROPS_PROVIDER = Symbol('wippy:props') as InjectionKey<Ref<Record<string, unknown>>>

/** Injection key for the reactive props error ref. */
export const PROPS_ERROR_PROVIDER = Symbol('wippy:props_error') as InjectionKey<Ref<string[]>>

// ── Composables (typed) ──────────────────────────────────────

/**
 * Inject the reactive props ref, typed to your component's props interface.
 *
 * Must be called inside a Vue component's `setup()` that lives within a `WippyVueElement`.
 *
 * ```ts
 * const props = useProps<ComponentProps>()
 * // props is Ref<ComponentProps>
 * console.log(props.value.maxFileSize)
 * ```
 */
export function useProps<Props>(): Ref<Props> {
  const props = inject(PROPS_PROVIDER)
  if (!props) throw new Error('useProps() must be called inside a WippyVueElement')
  return props as unknown as Ref<Props>
}

/**
 * Inject the typed event emitter, constrained to your component's event map.
 *
 * Must be called inside a Vue component's `setup()` that lives within a `WippyVueElement`.
 *
 * ```ts
 * const emit = useEvents<Events>()
 * emit('upload-complete', { fileId: '123', status: 'done' }) // fully typed
 * ```
 */
export function useEvents<Events>(): <K extends keyof Events>(event: K, detail: Events[K]) => void {
  const emit = inject(EVENT_PROVIDER)
  if (!emit) throw new Error('useEvents() must be called inside a WippyVueElement')
  return emit as unknown as <K extends keyof Events>(event: K, detail: Events[K]) => void
}

/**
 * Inject the reactive prop validation errors ref.
 *
 * Must be called inside a Vue component's `setup()` that lives within a `WippyVueElement`.
 *
 * ```ts
 * const errors = usePropsErrors()
 * // errors is Ref<string[]>
 * ```
 */
export function usePropsErrors(): Ref<string[]> {
  const errors = inject(PROPS_ERROR_PROVIDER)
  if (!errors) throw new Error('usePropsErrors() must be called inside a WippyVueElement')
  return errors
}

// ── createProviders (typed injection keys) ───────────────────

/**
 * Typed provider keys for a specific component.
 */
export interface TypedProviders<Props, Events> {
  EVENT_PROVIDER: InjectionKey<<K extends keyof Events>(event: K, detail: Events[K]) => void>
  PROPS_PROVIDER: InjectionKey<Ref<Props>>
  PROPS_ERROR_PROVIDER: InjectionKey<Ref<string[]>>
}

/**
 * Creates typed provider injection keys for a specific component.
 *
 * Use this if you prefer raw `inject(KEY)` over the composable helpers.
 * Returns the same Symbol instances with narrowed types.
 *
 * ```ts
 * export const { EVENT_PROVIDER, PROPS_PROVIDER, PROPS_ERROR_PROVIDER } =
 *   createProviders<ComponentProps, Events>()
 * ```
 */
export function createProviders<Props, Events = Record<string, unknown>>(): TypedProviders<Props, Events> {
  return {
    EVENT_PROVIDER: EVENT_PROVIDER as unknown as TypedProviders<Props, Events>['EVENT_PROVIDER'],
    PROPS_PROVIDER: PROPS_PROVIDER as unknown as TypedProviders<Props, Events>['PROPS_PROVIDER'],
    PROPS_ERROR_PROVIDER,
  }
}
