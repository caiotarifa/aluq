import { merge } from 'es-toolkit'
import { useStorage } from '@vueuse/core'

export function useEntityList(entityName) {
  const entity = useEntity(entityName)
  const { activeOrganizationId } = useAuth()
  const route = useRoute()

  // Persistence.
  const storageKey = computed(() =>
    ['entity-list', activeOrganizationId.value, toValue(entityName)].join(':')
  )

  const persistedViews = useStorage(storageKey, {}, undefined, {
    initOnMounted: true
  })

  // Active view name from URL (avoids circular dependency with query).
  const viewName = computed(() =>
    route.query.view || entity.value?.display?.view || 'default'
  )

  // Merge entity view config with persisted overrides.
  const activeView = computed(() =>
    merge(
      {},
      entity.value?.views?.[viewName.value] || {},
      persistedViews.value?.[viewName.value] || {}
    )
  )

  // Query defaults for the active view.
  const defaults = computed(() => ({
    view: entity.value?.display?.view || 'default',
    type: activeView.value.type || 'table',
    properties: activeView.value.properties || [],
    sort: activeView.value.query?.sort || [],
    filter: activeView.value.query?.filter || [],
    pinned: { left: [], right: [], ...activeView.value.ui?.pinned },
    page: 1,
    size: 25,
    search: ''
  }))

  // Search fields derived from text and code properties.
  const searchFields = computed(() => {
    const fields = []

    for (const key in entity.value?.properties) {
      const { type } = entity.value.properties[key]
      if (type === 'text' || type === 'code') fields.push(key)
    }

    return fields
  })

  // Query synced with URL.
  const query = useRouteQuery(defaults)

  // Remote data.
  const {
    list: { data: items, isLoading, refetch },
    count: { data: total }
  } = useRemoteList(
    entityName,
    query,
    computed(() => ({ searchFields: searchFields.value }))
  )

  // View update: persist overrides + update query.
  function onViewUpdate({ view: updatedView, config }) {
    const pinned = config.ui?.pinned || { left: [], right: [] }

    query.value = {
      ...toRaw(query.value),

      ...({
        type: config.type || 'table',
        properties: config.properties || [],
        pinned
      })
    }

    const stored = persistedViews.value[updatedView] || {}

    Object.assign(stored, {
      type: config.type || 'table',
      properties: config.properties || []
    })

    Object.assign(stored.ui || (stored.ui = {}), { pinned })

    persistedViews.value[updatedView] = stored
  }

  return {
    entity,
    isLoading,
    items,
    query,
    refetch,
    total,

    onViewUpdate
  }
}
