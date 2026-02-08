import { isEqual } from 'es-toolkit'

const parseMap = {
  page: value => Math.max(1, Number(value) || 1),
  size: value => Math.max(1, Number(value) || 25),

  sort: value => value.split(',').map((segment) => {
    const [property, direction] = segment.split(':')
    return { property, direction }
  }),

  filter: value => JSON.parse(value),
  properties: value => value.split(',').filter(Boolean),
  pinned: value => JSON.parse(value)
}

const serializeMap = {
  sort: value => value.map(s => `${s.property}:${s.direction}`).join(','),
  filter: value => JSON.stringify(value),
  properties: value => value.join(','),
  pinned: value => JSON.stringify(value)
}

function parse(key, raw) {
  if (raw == null || raw === '') return undefined

  try {
    return parseMap[key] ? parseMap[key](raw) : raw
  }
  catch {
    return undefined
  }
}

function serialize(key, value) {
  if (value == null) return undefined
  if (Array.isArray(value) && value.length === 0) return undefined

  return serializeMap[key] ? serializeMap[key](value) : value
}

export function useRouteQuery(defaults) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      const result = { ...toValue(defaults) }

      for (const key in route.query) {
        const parsed = parse(key, route.query[key])
        if (parsed !== undefined) result[key] = parsed
      }

      return result
    },

    set(value) {
      const base = toValue(defaults)
      const params = {}

      for (const key in value) {
        if (isEqual(value[key], base[key])) continue

        const serialized = serialize(key, value[key])
        if (serialized != null) params[key] = serialized
      }

      router.replace({ query: params })
    }
  })
}
