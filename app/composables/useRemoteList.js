import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../zenstack/schema'

const QUERY_DEFAULTS = {
  page: 1,
  size: 25,
  sort: []
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
    const { page, size: take, sort } = {
      ...QUERY_DEFAULTS,
      ...toValue(query)
    }

    const orderBy = sort.map(({ property, direction }) => (
      { [property]: direction }
    ))

    return {
      skip: (page - 1) * take,
      take,
      orderBy
    }
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
