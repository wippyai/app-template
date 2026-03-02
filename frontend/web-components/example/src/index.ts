import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import UploadsManager from './app/uploads-manager.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class UploadsManagerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['fontCssUrl', 'themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl'] as const,
      containerClasses: ['h-full'],
      inlineCss: stylesText,
      validateProps: (props) => {
        const errors: string[] = []
        if (Array.isArray(props.allowedTypes) && !props.allowedTypes.every((t) => typeof t === 'string')) {
          errors.push('allowed-types must be an array of strings')
        }
        if (typeof props.maxFileSize === 'number' && props.maxFileSize < 0) {
          errors.push('max-file-size must be a positive number')
        }
        return errors
      },
    }
  }

  static get vueConfig() {
    return {
      rootComponent: UploadsManager,
    }
  }
}

export async function webComponent() {
  return UploadsManagerElement
}

define(import.meta.url, UploadsManagerElement)
