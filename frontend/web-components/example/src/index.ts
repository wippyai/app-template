import type { App, Ref } from 'vue'
import type { Events } from './constants.ts'
import { addCollection } from '@iconify/vue'
import { addIcons, define, hostCss, loadCss } from '@wippy-fe/proxy'
import { createPinia } from 'pinia'
import { createApp, ref } from 'vue'

import UploadsManager from './app/uploads-manager.vue'
import { EVENT_PROVIDER, PROPS_ERROR_PROVIDER, PROPS_PROVIDER, DEFAULT_COMPONENT_PROPS } from './constants.ts'
import stylesText from './styles.css?inline'

// Component props interface - only configurable props
export interface ComponentProps {
  allowedTypes?: string[]
  maxFileSize?: number
}

class UploadsManagerElement extends HTMLElement {
  private vueApp: App<Element> | null = null
  private root: HTMLElement | null = null
  private props: Ref<ComponentProps> = ref({})
  private propsError: Ref<string | null> = ref(null)
  private internals!: ElementInternals

  static get observedAttributes() {
    return ['allowed-types', 'max-file-size']
  }

  constructor() {
    super()
    this.internals = this.attachInternals()
  }

  private emitEvent<K extends keyof Events>(eventName: K, detail: Events[K]) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail,
    }))
  }

  // Helper to extract current props from attributes
  private parseProps(changedProp: string | undefined = undefined, isSameValue: boolean = false) {
    if (!changedProp || !isSameValue) {
      try {
        // Parse allowed-types attribute
        const allowedTypesAttr = this.getAttribute('allowed-types')
        if (allowedTypesAttr !== null) {
          try {
            const allowedTypes = JSON.parse(allowedTypesAttr)
            if (!Array.isArray(allowedTypes) || !allowedTypes.every(item => typeof item === 'string')) {
              this.propsError.value = 'Invalid allowed-types: expected JSON array of strings'
              this.emitEvent('invalid', { message: this.propsError.value })
              return
            }
            this.props.value.allowedTypes = allowedTypes
          } catch {
            this.propsError.value = 'Failed to parse allowed-types: must be valid JSON array'
            this.emitEvent('invalid', { message: this.propsError.value })
            return
          }
        }

        // Parse max-file-size attribute
        const maxFileSizeAttr = this.getAttribute('max-file-size')
        if (maxFileSizeAttr !== null) {
          const maxFileSize = parseInt(maxFileSizeAttr, 10)
          if (isNaN(maxFileSize) || maxFileSize < 0) {
            this.propsError.value = 'Invalid max-file-size: must be a positive number'
            this.emitEvent('invalid', { message: this.propsError.value })
            return
          }
          this.props.value.maxFileSize = maxFileSize
        }

        // Clear any previous errors if all props are valid
        if (this.propsError.value) {
          this.propsError.value = null
        }

        console.debug('UploadsManagerElement props updated:', this.props.value)
      } catch (error) {
        this.propsError.value = 'Failed to parse component attributes'
        this.emitEvent('invalid', { message: this.propsError.value })
        console.error('Error parsing props:', error)
      }
    }
  }

  connectedCallback() {
    this.internals.states.add('loading')
    try {
      // Shadow DOM for style encapsulation
      const shadow = this.attachShadow({ mode: 'open' })

      // Inject component + host styles
      const styleEl = document.createElement('style')
      styleEl.textContent = `
      /** Component styles */
      ${stylesText}
    `
      shadow.appendChild(styleEl)

      Promise.all([
        loadCss(hostCss.fontCssUrl),
        loadCss(hostCss.themeConfigUrl),
        loadCss(hostCss.primeVueCssUrl),
        loadCss(hostCss.markdownCssUrl),
      ]).then((cssChunks) => {
        cssChunks.forEach((css) => {
          const style = document.createElement('style')
          style.textContent = css
          style.role = '@wippy/host-css'
          shadow.appendChild(style)
        })
      })

      // Container for Vue app
      this.root = document.createElement('div')
      this.root.classList.add('h-full')
      shadow.appendChild(this.root)

      // Mount Vue
      this.vueApp = createApp(UploadsManager)
      this.vueApp.use(createPinia())
      this.vueApp.provide(PROPS_PROVIDER, this.props)
      this.vueApp.provide(PROPS_ERROR_PROVIDER, this.propsError)
      this.vueApp.provide(EVENT_PROVIDER, this.emitEvent.bind(this))
      this.vueApp.mount(this.root)

      addIcons(addCollection)

      // Parse initial props after Vue is mounted
      this.parseProps()

      this.internals.states.delete('loading')
      this.internals.states.add('ready')

      this.emitEvent('load', undefined)
    }
    catch (error) {
      console.error('Failed to initialize UploadsManagerElement:', error)

      this.internals.states.delete('loading')
      this.internals.states.add('error')

      this.emitEvent('error', {
        message: error instanceof Error ? error.message : String(error),
        error,
      })
    }
  }

  disconnectedCallback() {
    if (this.vueApp) {
      this.vueApp.unmount()
      this.vueApp = null
    }
    this.emitEvent('unload', undefined)

    this.internals.states.clear()
  }

  attributeChangedCallback(name: string, _oldVal: string | null, _newVal: string | null) {
    this.parseProps(name, _oldVal === _newVal)
  }
}

export async function webComponent() {
  return UploadsManagerElement
}

// Utility that will imediately declate UploadsManagerElement if needed
define(import.meta.url, UploadsManagerElement)
