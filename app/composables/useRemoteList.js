import { isEmptyOperator, operators } from '~/registry/operators.js'

function isEmptyFilterValue(value) {
  if (value == null || value === '') return true
  if (!Array.isArray(value)) return false
  return value.length === 0 || value.every(item => item == null || item === '')
}

function buildFilterWhere(filter) {
  if (!Array.isArray(filter) || filter.length === 0) return undefined

  const conditions = []

  for (const { property, operator, value } of filter) {
    const handler = operators[operator]
    if (!handler?.where) continue
    if (!isEmptyOperator(operator) && isEmptyFilterValue(value)) continue

    const condition = handler.where(property, value)
    if (condition) conditions.push(condition)
  }

  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]

  return { AND: conditions }
}

function buildSearchWhere(search, fields = []) {
  if (!search || !Array.isArray(fields) || fields.length === 0) {
    return undefined
  }

  const conditions = []

  for (const field of fields) {
    conditions.push({
      [field]: { contains: search }
    })
  }

  if (conditions.length === 0) return undefined

  return { OR: conditions }
}

function buildSelect(properties) {
  if (!Array.isArray(properties) || properties.length === 0) return undefined

  const result = {}

  for (const field of properties) {
    result[field] = true
  }

  return result
}

function mergeWhere(conditions = []) {
  const valid = conditions.filter(Boolean)
  if (valid.length === 0) return undefined
  if (valid.length === 1) return valid[0]
  return { AND: valid }
}

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

  const list = client[key].useFindMany(
    () => resolvedQuery.value,
    () => resolvedOptions.value
  )

  const count = client[key].useCount(
    () => {
      const { where } = resolvedQuery.value
      return where ? { where } : {}
    },

    () => {
      const resolved = resolvedOptions.value

      return Object.assign({}, resolved, {
        enabled: resolved?.needsCount !== false
      })
    }
  )

  return { list, count }
}
