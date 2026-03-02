import type { WippyPropsSchema, WippyPropDefinition } from './types.ts'

export interface ParseResult {
  props: Record<string, unknown>
  errors: string[]
}

/**
 * Converts a kebab-case attribute name to camelCase.
 * `allowed-types` → `allowedTypes`
 */
export function attrToCamel(attr: string): string {
  return attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/**
 * Parses a single attribute value according to its schema definition.
 */
function parseValue(attr: string, raw: string, def: WippyPropDefinition): { value: unknown; error?: string } {
  switch (def.type) {
    case 'string':
      return { value: raw }

    case 'number': {
      const n = parseFloat(raw)
      if (isNaN(n)) return { value: undefined, error: `Invalid ${attr}: expected a number` }
      return { value: n }
    }

    case 'integer': {
      const n = parseInt(raw, 10)
      if (isNaN(n)) return { value: undefined, error: `Invalid ${attr}: expected an integer` }
      return { value: n }
    }

    case 'boolean':
      // Presence of the attribute means true (HTML convention), explicit "false" means false
      return { value: raw !== 'false' }

    case 'array':
    case 'object': {
      try {
        const parsed = JSON.parse(raw)
        if (def.type === 'array' && !Array.isArray(parsed)) {
          return { value: undefined, error: `Invalid ${attr}: expected a JSON array` }
        }
        return { value: parsed }
      } catch {
        return { value: undefined, error: `Invalid ${attr}: must be valid JSON` }
      }
    }

    default:
      return { value: raw }
  }
}

/**
 * Parses all attributes on an element according to its props schema.
 * Returns `{ props, errors }` where errors is an array of human-readable messages.
 */
export function parseProps(element: HTMLElement, schema: WippyPropsSchema): ParseResult {
  const props: Record<string, unknown> = {}
  const errors: string[] = []

  for (const [attr, def] of Object.entries(schema.properties)) {
    const raw = element.getAttribute(attr)
    const camel = attrToCamel(attr)

    if (raw === null) {
      // Attribute not set — use default if available
      if (def.default !== undefined) {
        props[camel] = def.default
      }
      continue
    }

    const result = parseValue(attr, raw, def)
    if (result.error) {
      errors.push(result.error)
    } else {
      props[camel] = result.value
    }
  }

  return { props, errors }
}
