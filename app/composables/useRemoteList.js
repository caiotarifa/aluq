import {
  buildFilterWhere,
  buildSearchWhere,
  buildSelect,
  mergeWhere
} from '~/utils/queryBuilder.js'

export function useRemoteList(entity, query = {}, options = {}) {
  const { client } = useRemote()
  const key = singularize(toValue(entity))

  const defaultQuery = {
    page: 1,
    size: 25,
    sort: [],
    search: '',
    filter: [],
    properties: []
  }

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

    const { page, size, sort, search, filter, properties } = Object.assign(
      {},
      defaultQuery,
      toValue(query)
    )

    const safePage = Number.isFinite(page) ? Math.max(1, page) : 1
    const safeSize = Number.isFinite(size) ? Math.max(1, size) : 25

    const orderBy = sort.map(item => ({
      [item.property]: item.direction
    }))

    const searchWhere = buildSearchWhere(
      search,
      resolvedOptions.value.searchFields
    )

    const filterWhere = buildFilterWhere(filter)
    const where = mergeWhere([searchWhere, filterWhere])
    const select = buildSelect(properties)

    const result = {
      skip: (safePage - 1) * safeSize,
      take: safeSize,
      orderBy
    }

    if (where) {
      result.where = where
    }

    if (select) {
      result.select = select
    }

    return result
  })

  return client[key].useFindMany(
    () => resolvedQuery.value,
    () => resolvedOptions.value
  )
}
