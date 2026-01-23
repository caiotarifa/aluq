import * as v from 'valibot'

// Pagination.
const positiveNumber = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform(Number),
  v.integer(),
  v.minValue(1)
)

// Sorting.
const sortItem = v.object({
  property: v.string(),

  direction: v.union([
    v.literal('asc'),
    v.literal('desc')
  ])
})

function sortTransform(input) {
  const items = input.split(',')

  return items.map((item) => {
    const [property, direction] = item.split(':')
    return { property, direction }
  })
}

function sortSerialize(items) {
  if (!items || !Array.isArray(items) || items.length === 0) return undefined
  return items.map(item => `${item.property}:${item.direction}`).join(',')
}

// Parsing.
const parseSchema = v.object({
  page: v.optional(positiveNumber),
  size: v.optional(positiveNumber),
  sort: v.optional(v.pipe(
    v.string(),
    v.transform(sortTransform),
    v.array(sortItem)
  ))
})

function parseQuery(query) {
  const result = v.safeParse(parseSchema, query)
  if (!result.success) return {}

  const filtered = {}

  for (const key in result.output) {
    if (result.output[key] != null) filtered[key] = result.output[key]
  }

  return filtered
}

// Serialization.
const serializeSchema = v.object({
  page: v.optional(positiveNumber),
  size: v.optional(positiveNumber),
  sort: v.optional(v.array(sortItem))
})

function serializeQuery(query, defaults = {}) {
  const result = v.safeParse(serializeSchema, query)
  if (!result.success) return {}

  const filtered = {}

  for (const key in result.output) {
    const value = result.output[key]

    if (value == null || value === defaults[key]) {
      filtered[key] = undefined
    }
    else {
      filtered[key] = key === 'sort' ? sortSerialize(value) : value
    }
  }

  return filtered
}

export function useRouteQuery(defaults = {}) {
  const route = useRoute()
  const router = useRouter()

  const query = computed({
    get() {
      return { ...defaults, ...parseQuery(route.query) }
    },

    set(value) {
      router.replace({
        query: { ...route.query, ...serializeQuery(value, defaults) }
      })
    }
  })

  return query
}
