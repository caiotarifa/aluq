import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../zenstack/schema'

const QUERY_DEFAULTS = {
  page: 1,
  size: 25,
  sort: [],
  select: null
}

const OPTIONS_DEFAULTS = {
  needsCount: true
}

export function useRemoteList(entity, query = {}, options = {}) {
  const client = useClientQueries(schema)
  const key = singularize(toValue(entity))

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  function queryHandler() {
    const { page, size: take, sort, select } = {
      ...QUERY_DEFAULTS,
      ...toValue(query)
    }

    const orderBy = sort.map(({ property, direction }) => (
      { [property]: direction }
    ))

    const result = {
      skip: (page - 1) * take,
      take,
      orderBy
    }

    if (select && Array.isArray(select) && select.length > 0) {
      result.select = select.reduce((acc, field) => {
        acc[field] = true
        return acc
      }, {})
    }

    return result
  }

  function optionsHandler() {
    return {
      ...OPTIONS_DEFAULTS,
      ...toValue(options)
    }
  }

  const list = client[key].useFindMany(
    queryHandler,
    optionsHandler
  )

  const count = client[key].useCount(
    () => ({}),
    () => {
      const countOptions = optionsHandler()

      return {
        ...optionsHandler(),
        enabled: countOptions.needsCount
      }
    }
  )

  return { list, count }
}
