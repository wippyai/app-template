import { hostCss, loadCss } from '@wippy-fe/proxy'
import type { HostCssKey } from './types.ts'

const DEFAULT_HOST_CSS_KEYS: HostCssKey[] = [
  'fontCssUrl',
  'themeConfigUrl',
  'primeVueCssUrl',
  'markdownCssUrl',
  'iframeCssUrl',
]

/**
 * Loads host CSS URLs into the shadow root as `<style>` elements.
 * Non-blocking — returns a promise but the component doesn't need to await it.
 */
export function loadHostCss(shadow: ShadowRoot, keys?: HostCssKey[]): Promise<void> {
  const cssKeys = keys ?? DEFAULT_HOST_CSS_KEYS
  return Promise.all(
    cssKeys.map((key) => loadCss(hostCss[key])),
  ).then((cssChunks) => {
    for (const css of cssChunks) {
      const style = document.createElement('style')
      style.textContent = css
      style.setAttribute('role', '@wippy/host-css')
      shadow.appendChild(style)
    }
  }).catch((err) => {
    console.warn('Failed to load host CSS:', err)
  })
}

/**
 * Injects inline CSS text into the shadow root.
 */
export function injectInlineCss(shadow: ShadowRoot, text: string): void {
  const style = document.createElement('style')
  style.textContent = text
  shadow.appendChild(style)
}
