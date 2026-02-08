import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../zenstack/schema'
import { isEmptyOperator, operators } from '~/registry/operators.js'

function isEmptyFilterValue(value) {
  if (value == null || value === '') return true
  if (!Array.isArray(value)) return false
  return value.length === 0 || value.every(item => item == null || item === '')
}

function buildFilterWhere(filter) {
  if (!Array.isArray(filter) || filter.length === 0) return null

  const conditions = []

  for (const { property, operator, value } of filter) {
    const handler = operators[operator]
    if (!handler?.where) continue
    if (!isEmptyOperator(operator) && isEmptyFilterValue(value)) continue

    const condition = handler.where(property, value)
    if (condition) conditions.push(condition)
  }

  if (conditions.length === 0) return null
  if (conditions.length === 1) return conditions[0]

  return { AND: conditions }
}

function buildSearchWhere(search, fields = []) {
  if (!search || !Array.isArray(fields) || fields.length === 0) return null

  const conditions = []

  for (const field of fields) {
    conditions.push({
      [field]: {
        contains: search,
        mode: 'insensitive'
      }
    })
  }

  if (conditions.length === 0) return null

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
  const client = useClientQueries(schema)
  const key = singularize(toValue(entity))

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  function resolvedQuery() {
    const { page, size, sort, search, filter, properties } = Object.assign(
      { page: 1, size: 25, sort: [], search: '', filter: [], properties: [] },
      toValue(query)
    )

    const orderBy = sort.map(({ property, direction }) => ({ [property]: direction }))
    const searchWhere = buildSearchWhere(search, toValue(options)?.searchFields)
    const filterWhere = buildFilterWhere(filter)
    const where = mergeWhere([searchWhere, filterWhere])
    const select = buildSelect(properties)

    const result = {
      skip: (page - 1) * size,
      take: size,
      orderBy
    }

    if (where) result.where = where
    if (select) result.select = select

    return result
  }

  const list = client[key].useFindMany(
    () => resolvedQuery(),
    () => toValue(options)
  )

  const count = client[key].useCount(
    () => {
      const { where } = resolvedQuery()
      return where ? { where } : {}
    },
    () => {
      const resolved = toValue(options)

      return Object.assign({}, resolved, {
        enabled: resolved?.needsCount !== false
      })
    }
  )

  return { list, count }
}
