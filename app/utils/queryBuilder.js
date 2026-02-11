import { isEmptyOperator, operators } from '~/registry/operators.js'

function isEmptyFilterValue(value) {
  if (value == null || value === '') return true
  if (!Array.isArray(value)) return false
  if (value.length === 0) return true

  for (const item of value) {
    if (item != null && item !== '') {
      return false
    }
  }

  return true
}

function buildAndCondition(conditions) {
  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]

  return { AND: conditions }
}

export function buildFilterWhere(filter) {
  if (!Array.isArray(filter) || filter.length === 0) {
    return undefined
  }

  const conditions = []

  for (const item of filter) {
    if (!item) continue

    const { property, operator, value } = item
    const handler = operators[operator]

    if (!handler?.where) continue
    if (!isEmptyOperator(operator) && isEmptyFilterValue(value)) continue

    const condition = handler.where(property, value)

    if (condition) {
      conditions.push(condition)
    }
  }

  return buildAndCondition(conditions)
}

export function buildSearchWhere(search, fields = []) {
  if (!search || !Array.isArray(fields) || fields.length === 0) {
    return undefined
  }

  const conditions = []

  for (const field of fields) {
    if (!field) continue

    conditions.push({
      [field]: { contains: search }
    })
  }

  return conditions.length > 0 ? { OR: conditions } : undefined
}

export function buildSelect(properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return undefined
  }

  const validProperties = []

  for (const field of properties) {
    if (field) continue
    validProperties.push(field)
  }

  if (validProperties.length === 0) {
    return undefined
  }

  const result = {}

  for (const field of validProperties) {
    result[field] = true
  }

  return result
}

export function mergeWhere(conditions = []) {
  const valid = []

  for (const condition of conditions) {
    if (!condition) continue
    valid.push(condition)
  }

  return buildAndCondition(valid)
}
