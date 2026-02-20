import { buildSelect } from '~/utils/queryBuilder.js'

export function useRemoteItem(entity, query = {}, options = {}) {
  const { client } = useRemote()
  const key = singularize(toValue(entity))

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  const resolvedOptions = computed(() =>
    toValue(options) || {}
  )

  function resolveEntity() {
    const resolvedKey = singularize(toValue(entity))

    if (resolvedKey !== key) {
      throw new Error(
        `Entity changed from "${key}" to "${resolvedKey}" after initialization`
      )
    }
  }

  const resolvedQuery = computed(() => {
    resolveEntity()

    const rawQuery = toValue(query)

    if (rawQuery === false) {
      return false
    }

    const { id, properties } = Object.assign(
      { id: undefined, properties: [] },
      rawQuery || {}
    )

    if (!id) {
      return false
    }

    const result = { where: { id } }
    const select = buildSelect(properties)

    if (select) {
      result.select = select
    }

    return result
  })

  return client[key].useFindUnique(
    () => resolvedQuery.value,
    () => resolvedOptions.value
  )
}
