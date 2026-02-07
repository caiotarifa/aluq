import { operators } from '~/registry/operators.js'
import { resolvePropertyType } from '~/registry/propertyTypes.js'

const entities = import.meta.glob('~/entities/*.js', { eager: true })

export function useEntity(name) {
  const { t } = useI18n()

  return computed(() => {
    const entityName = toValue(name)
    const path = `/entities/${entityName}.js`

    for (const key in entities) {
      if (!key.endsWith(path)) continue

      const entity = entities[key].default

      // Operators.
      for (const operatorKey in operators) {
        operators[operatorKey].label = t(`operators.${operators[operatorKey].value}`)
      }

      // Properties.
      for (const propKey in entity.properties) {
        const property = entity.properties[propKey]
        const propertyType = resolvePropertyType(property.type)

        property.label = t(`${entityName}.properties.${propKey}`)
        property.propertyType = propertyType

        for (const field in propertyType) {
          property[field] ??= propertyType[field]
        }
      }

      // Views.
      for (const viewKey in entity.views) {
        entity.views[viewKey].label = t(
          `${entityName}.views.${viewKey}`
        )
      }

      // Actions.
      if (entity.actions) {
        for (const group in entity.actions) {
          for (const actionKey in entity.actions[group]) {
            entity.actions[group][actionKey].label = t(
              `${entityName}.actions.${actionKey}`
            )
          }
        }
      }

      return entity
    }

    throw new Error(`Entity "${entityName}" not found`)
  })
}
