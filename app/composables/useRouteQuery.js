import { z } from 'zod'

// Pagination.
const positiveNumber = z.union([z.string(), z.number()])
  .transform(Number)
  .pipe(z.int().min(1))

// Sorting.
const sortItem = z.object({
  property: z.string(),
  direction: z.union([z.literal('asc'), z.literal('desc')])
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
const parseSchema = z.object({
  page: positiveNumber.optional(),
  size: positiveNumber.optional(),
  sort: z.string().transform(sortTransform).pipe(z.array(sortItem)).optional()
})

function parseQuery(query) {
  const result = parseSchema.safeParse(query)
  if (!result.success) return {}

  const filtered = {}

  for (const key in result.data) {
    if (result.data[key] != null) filtered[key] = result.data[key]
  }

  return filtered
}

// Serialization.
const serializeSchema = z.object({
  page: positiveNumber.optional(),
  size: positiveNumber.optional(),
  sort: z.array(sortItem).optional()
})

function serializeQuery(query, defaults = {}) {
  const result = serializeSchema.safeParse(query)
  if (!result.success) return {}

  const filtered = {}

  for (const key in result.data) {
    const value = result.data[key]

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
