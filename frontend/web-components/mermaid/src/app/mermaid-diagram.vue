<script setup lang="ts">
import { computed } from 'vue'
import { renderMermaidSVG } from 'beautiful-mermaid'
import { useContent } from '@wippy-fe/webcomponent-vue'
import { useComponentProps, DEFAULT_DEFINITION } from '../constants'

const props = useComponentProps()
const content = useContent()

const definition = computed(() =>
  props.value.definition || content.value || DEFAULT_DEFINITION
)

const svgHtml = computed(() => {
  try {
    return renderMermaidSVG(definition.value, {
      bg: 'var(--p-content-background)',
      fg: 'var(--p-text-color)',
      accent: 'var(--p-primary-500)',
      line: 'var(--p-surface-400)',
      muted: 'var(--p-text-muted-color)',
      surface: 'var(--p-content-background)',
      border: 'var(--p-content-border-color)',
      transparent: props.value.transparent ?? true,
    })
  } catch {
    return null
  }
})

const error = computed(() => {
  if (svgHtml.value === null) {
    return 'Failed to render diagram. Check the Mermaid syntax.'
  }
  return null
})
</script>

<template>
  <div
    v-if="error"
    class="mermaid-error"
    role="alert"
  >
    {{ error }}
  </div>
  <div
    v-else
    class="mermaid-container"
    role="img"
    aria-label="Mermaid diagram"
    v-html="svgHtml"
  />
</template>
