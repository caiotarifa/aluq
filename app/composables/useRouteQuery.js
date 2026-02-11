import { isEqual } from 'es-toolkit'

import {
  isEmptyOperator,
  isArrayOperator,
  isRangeOperator
} from '~/registry/operators.js'

const filterKeyRegex = /^filter\[(.+)\$(.+)\]$/

const splitList = value => value.split(',').filter(Boolean)
const joinList = value => value.join(',')

const parseMap = {
  page: value => Math.max(1, Number(value) || 1),
  size: value => Math.max(1, Number(value) || 25),
  properties: splitList,
  pinned: splitList,

  sort: value => value.split(',').map((segment) => {
    const [property, direction] = segment.split(':')
    return { property, direction }
  })
}

const serializeMap = {
  properties: joinList,
  pinned: joinList,

  sort: value => value.map(item =>
    `${item.property}:${item.direction}`
  ).join(',')
}

function coerceValue(raw) {
  if (raw === 'true') return true
  if (raw === 'false') return false

  const number = Number(raw)
  return (raw !== '' && !Number.isNaN(number)) ? number : raw
}

function parseFilterValue(operator, raw) {
  if (isEmptyOperator(operator)) return null

  const values = Array.isArray(raw)
    ? raw.map(value => coerceValue(value ?? ''))
    : [coerceValue(raw ?? '')]

  return (isArrayOperator(operator) || isRangeOperator(operator))
    ? values
    : values[0]
}

function parseFilters(query) {
  if (query.filter != null && query.filter !== '') {
    try {
      return JSON.parse(query.filter)
    }
    catch {
      return undefined
    }
  }

  const filters = []

  for (const key in query) {
    const match = key.match(filterKeyRegex)
    if (!match) continue

    const [, property, operator] = match

    filters.push({
      property,
      operator,
      value: parseFilterValue(operator, query[key])
    })
  }

  return filters
}

function serializeFilters(filters) {
  const params = {}

  for (const { property, operator, value } of filters) {
    const key = `filter[${property}$${operator}]`

    if (isEmptyOperator(operator)) {
      params[key] = ''
    }
    else if (Array.isArray(value)) {
      params[key] = value
    }
    else {
      params[key] = String(value ?? '')
    }
  }

  return params
}

function parse(key, raw) {
  if (raw == null || raw === '') return undefined

  try {
    return parseMap[key]?.(raw) ?? raw
  }
  catch {
    return undefined
  }
}

function serialize(key, value) {
  if (value == null) return undefined
  if (Array.isArray(value) && value.length === 0) return undefined

  return serializeMap[key]?.(value) ?? value
}

export function useRouteQuery(defaults) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      const result = { ...toValue(defaults) }

      for (const key in route.query) {
        if (key === 'filter' || key.startsWith('filter['))
          continue

        const parsed = parse(key, route.query[key])

        if (parsed !== undefined) {
          result[key] = parsed
        }
      }

      const filters = parseFilters(route.query)

      if (filters?.length) {
        result.filter = filters
      }

      return result
    },

    set(value) {
      const base = toValue(defaults)
      const params = {}

      for (const key in value) {
        if (key === 'filter') continue
        if (isEqual(value[key], base[key])) continue

        const serialized = serialize(key, value[key])

        if (serialized != null) {
          params[key] = serialized
        }
      }

      if (value.filter?.length) {
        Object.assign(params, serializeFilters(value.filter))
      }

      router.replace({ query: params })
    }
  })
}
