import { operators } from '~/registry/operators.js'
import { resolvePropertyType } from '~/registry/propertyTypes.js'

const entities = import.meta.glob('~/entities/*.js', { eager: true })
const entitySources = {}

for (const path in entities) {
  const [, entityName] = path.match(/\/entities\/(.+)\.js$/) || []
  const source = entities[path]?.default

  if (!entityName || !source) continue
  entitySources[entityName] = source
}

function resolveOperators(t) {
  const resolvedOperators = {}

  for (const operatorKey in operators) {
    const operator = operators[operatorKey]

    resolvedOperators[operatorKey] = {
      ...operator,
      label: t(`operators.${operator.value}`)
    }
  }

  return resolvedOperators
}

function resolveProperties(properties, entityName, t, resolvedOperators) {
  const resolvedProperties = {}

  for (const propertyKey in properties || {}) {
    const property = properties[propertyKey]
    const propertyType = resolvePropertyType(property.type)

    const resolved = {
      ...propertyType,
      ...property,
      label: t(`${entityName}.properties.${propertyKey}`),
      propertyType
    }

    if (propertyType.operators) {
      resolved.operators = propertyType.operators.map(
        operator => resolvedOperators[operator.value] || operator
      )
    }

    resolvedProperties[propertyKey] = resolved
  }

  return resolvedProperties
}

function resolveViews(views, entityName, t) {
  const resolvedViews = {}

  for (const viewKey in views || {}) {
    resolvedViews[viewKey] = {
      ...views[viewKey],
      label: t(`${entityName}.views.${viewKey}`)
    }
  }

  return resolvedViews
}

function resolveActions(actions, entityName, t) {
  if (!actions) return undefined

  if (Array.isArray(actions)) {
    const resolvedActions = []

    for (const group of actions) {
      const resolvedGroup = {}

      for (const actionKey in group) {
        resolvedGroup[actionKey] = {
          ...group[actionKey],
          label: t(`${entityName}.actions.${actionKey}`)
        }
      }

      resolvedActions.push(resolvedGroup)
    }

    return resolvedActions
  }

  const resolvedActions = {}

  for (const groupName in actions) {
    const group = actions[groupName]
    const resolvedGroup = {}

    for (const actionKey in group || {}) {
      resolvedGroup[actionKey] = {
        ...group[actionKey],
        label: t(`${entityName}.actions.${actionKey}`)
      }
    }

    resolvedActions[groupName] = resolvedGroup
  }

  return resolvedActions
}

function resolveItemActions(itemActions, entityName, t) {
  if (!itemActions) return undefined

  const resolved = []

  for (const key in itemActions) {
    resolved.push({
      ...itemActions[key],
      key,
      label: t(`${entityName}.itemActions.${key}`)
    })
  }

  return resolved
}

function resolveBatchActions(batchActions, entityName, t) {
  if (!batchActions) return undefined

  const resolved = []

  for (const key in batchActions) {
    resolved.push({
      ...batchActions[key],
      key,
      label: t(`${entityName}.batchActions.${key}`)
    })
  }

  return resolved
}

export function useEntity(name) {
  const { t } = useI18n()

  return computed(() => {
    const entityName = toValue(name)
    const source = entitySources[entityName]

    if (!source) {
      throw new Error(`Entity "${entityName}" not found`)
    }

    const resolvedOperators = resolveOperators(t)

    return {
      ...source,
      operators: resolvedOperators,

      properties: resolveProperties(
        source.properties,
        entityName,
        t,
        resolvedOperators
      ),

      views: resolveViews(source.views, entityName, t),
      actions: resolveActions(source.actions, entityName, t),
      itemActions: resolveItemActions(source.itemActions, entityName, t),
      batchActions: resolveBatchActions(source.batchActions, entityName, t)
    }
  })
}
