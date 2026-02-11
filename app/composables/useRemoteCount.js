import { buildFilterWhere, mergeWhere, buildSearchWhere } from '~/utils/queryBuilder.js'

export function useRemoteCount(entity, query = {}, options = {}) {
  const { client } = useRemote()
  const key = singularize(toValue(entity))

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  const resolvedOptions = computed(() =>
    toValue(options) || {}
  )

  const resolvedQuery = computed(() => {
    const { search, filter } = toValue(query)

    const searchWhere = buildSearchWhere(
      search,
      resolvedOptions.value.searchFields
    )

    const filterWhere = buildFilterWhere(filter)
    const where = mergeWhere([searchWhere, filterWhere])

    return where ? { where } : {}
  })

  return client[key].useCount(
    () => resolvedQuery.value,
    () => resolvedOptions.value
  )
}
