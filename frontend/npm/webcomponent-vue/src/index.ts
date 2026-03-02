// Vue layer
export { WippyVueElement } from './vue-element.ts'
export type { WippyVueElementConfig } from './vue-element.ts'

// Providers: base symbols, composables, and createProviders utility
export {
  EVENT_PROVIDER, PROPS_PROVIDER, PROPS_ERROR_PROVIDER,
  useProps, useEvents, usePropsErrors,
  createProviders,
} from './providers.ts'
export type { TypedProviders } from './providers.ts'

// Re-export core for convenience
export { WippyElement, define } from '@wippy-fe/webcomponent-core'
export type {
  WippyElementConfig,
  WippyPropsSchema,
  WippyPropDefinition,
  HostCssKey,
  ParseResult,
} from '@wippy-fe/webcomponent-core'
