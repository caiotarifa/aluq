import { propertyTypes } from '~/registry/propertyTypes.js'

const resolvedCache = {}

function resolvePropertyType(typeName) {
  if (resolvedCache[typeName]) {
    return resolvedCache[typeName]
  }

  const definition = propertyTypes[typeName]

  if (!definition) {
    return resolvePropertyType('text')
  }

  if (!definition.extends) {
    resolvedCache[typeName] = definition
    return definition
  }

  const resolved = {
    ...resolvePropertyType(definition.extends),
    ...definition
  }

  delete resolved.extends

  resolvedCache[typeName] = resolved
  return resolved
}

export { resolvePropertyType }

export function usePropertyType(typeName) {
  return computed(() =>
    resolvePropertyType(toValue(typeName))
  )
}
