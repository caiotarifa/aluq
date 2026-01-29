import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../zenstack/schema'

const client = useClientQueries(schema)

export function useRemote() {
  return { client }
}
