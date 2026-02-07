const operators = {
  equals: {
    value: 'equals',
    mask: (k, v) => `${k} = ${v}`
  },

  notEquals: {
    value: 'notEquals',
    mask: (k, v) => `${k} ≠ ${v}`
  },

  in: {
    value: 'in',
    mask: (k, v) => `${k} ∈ [${v}]`
  },

  notIn: {
    value: 'notIn',
    mask: (k, v) => `${k} ∉ [${v}]`
  },

  contains: {
    value: 'contains',
    mask: (k, v) => `${k}: ${v}`
  },

  notContains: {
    value: 'notContains',
    mask: (k, v) => `${k}: ~~${v}~~`
  },

  startsWith: {
    value: 'startsWith',
    mask: (k, v) => `${k}: ${v}…`
  },

  notStartsWith: {
    value: 'notStartsWith',
    mask: (k, v) => `${k}: ~~${v}~~…`
  },

  endsWith: {
    value: 'endsWith',
    mask: (k, v) => `${k}: …${v}`
  },

  notEndsWith: {
    value: 'notEndsWith',
    mask: (k, v) => `${k}: …~~${v}~~`
  },

  lessThan: {
    value: 'lessThan',
    mask: (k, v) => `${k} < ${v}`
  },

  lessThanOrEqual: {
    value: 'lessThanOrEqual',
    mask: (k, v) => `${k} ≤ ${v}`
  },

  greaterThan: {
    value: 'greaterThan',
    mask: (k, v) => `${k} > ${v}`
  },

  greaterThanOrEqual: {
    value: 'greaterThanOrEqual',
    mask: (k, v) => `${k} ≥ ${v}`
  },

  between: {
    value: 'between',

    mask: (k, v) => {
      if (!v?.[0] && !v?.[1]) return k

      if (v?.[0] && v?.[1]) {
        return `${k}: ${v[0]} – ${v[1]}`
      }

      return v?.[0]
        ? `${k} ≥ ${v[0]}`
        : `${k} ≤ ${v[1]}`
    }
  },

  isEmpty: {
    value: 'isEmpty',
    mask: k => `${k} ∅`
  },

  isNotEmpty: {
    value: 'isNotEmpty',
    mask: k => `${k} ≠ ∅`
  },

  some: {
    value: 'some',
    mask: (k, v) => `${k}: ${v}`
  },

  every: {
    value: 'every',
    mask: (k, v) => `${k}: ${v}`
  },

  none: {
    value: 'none',
    mask: (k, v) => `${k}: ${v}`
  },

  is: {
    value: 'is',
    mask: (k, v) => `${k}: ${v}`
  }
}

// Operator groups.
const operatorGroups = {
  equality: [
    operators.equals,
    operators.notEquals
  ],

  array: [
    operators.in,
    operators.notIn
  ],

  text: [
    operators.contains,
    operators.notContains,
    operators.startsWith,
    operators.notStartsWith,
    operators.endsWith,
    operators.notEndsWith
  ],

  comparison: [
    operators.lessThan,
    operators.lessThanOrEqual,
    operators.greaterThan,
    operators.greaterThanOrEqual
  ],

  range: [
    operators.between
  ],

  empty: [
    operators.isEmpty,
    operators.isNotEmpty
  ],

  relation: [
    operators.some,
    operators.every,
    operators.none
  ]
}

// Category lookup.
const operatorCategoryMap = {}

for (const [groupName, operatorList] of Object.entries(operatorGroups)) {
  for (const operator of operatorList) {
    operatorCategoryMap[operator.value] = groupName
  }
}

// Utils.
function isEmptyOperator(operatorKey) {
  return operatorCategoryMap[operatorKey] === 'empty'
}

function isArrayOperator(operatorKey) {
  return operatorCategoryMap[operatorKey] === 'array'
}

function isRangeOperator(operatorKey) {
  return operatorCategoryMap[operatorKey] === 'range'
}

function getOperatorCategory(operatorKey) {
  return operatorCategoryMap[operatorKey] || null
}

function getDefaultValue(typeDefaultValue, operatorKey) {
  if (isEmptyOperator(operatorKey)) return null
  if (isArrayOperator(operatorKey)) return []
  if (isRangeOperator(operatorKey)) return [null, null]

  return typeDefaultValue
}

export {
  operators,
  operatorGroups,

  isEmptyOperator,
  isArrayOperator,
  isRangeOperator,

  getOperatorCategory,
  getDefaultValue
}
