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

  // Active view name from URL.
  const viewName = computed(() =>
    route.query.view || entity.value?.display?.view || 'default'
  )

  // Merge entity view config with persisted overrides.
  const activeView = computed(() => {
    const base = entity.value?.views?.[viewName.value] || {}
    const persisted = persistedViews.value?.[viewName.value] || {}

    return {
      ...base,
      ...persisted,

      ui: {
        ...base.ui,
        ...persisted.ui,

        pinned: {
          ...base.ui?.pinned,
          ...persisted.ui?.pinned
        }
      }
    }
  })

  // Query defaults for the active view.
  const defaults = computed(() => ({
    view: entity.value?.display?.view || 'default',
    type: activeView.value.type || 'table',
    properties: activeView.value.properties || [],
    pinned: activeView.value.ui?.pinned?.left || [],
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

  // Remote query: merges user query with view defaults.
  const remoteQuery = computed(() => ({
    ...query.value,

    sort: query.value.sort?.length
      ? query.value.sort
      : activeView.value.query?.sort || [],

    filter: [
      ...(activeView.value.query?.filter || []),
      ...(query.value.filter || [])
    ]
  }))

  // Remote data.
  const { data: items, isLoading, refetch } = useRemoteList(
    entityName,
    remoteQuery,
    computed(() => ({ searchFields: searchFields.value }))
  )

  // View counts.
  const counts = {}

  for (const key in entity.value?.views || {}) {
    const view = entity.value.views[key]
    const viewFilter = view.query?.filter || []

    counts[key] = useRemoteCount(
      entityName,

      computed(() => ({
        filter: [...viewFilter, ...(query.value.filter || [])],
        search: query.value.search
      })),

      computed(() => ({ searchFields: searchFields.value }))
    )
  }

  const viewCounts = computed(() => {
    const result = {}

    for (const key in counts) {
      result[key] = counts[key].data?.value ?? 0
    }

    return result
  })

  // Total for active view.
  const total = computed(() =>
    viewCounts.value[viewName.value] ?? 0
  )

  // Reset pagination when switching tabs.
  watch(viewName, () => {
    query.value = { ...query.value, page: 1, size: 25 }
  })

  // View update: persist overrides + update query.
  function onViewUpdate({ view: updatedView, config }) {
    const pinnedLeft = config.ui?.pinned?.left || []

    query.value = {
      ...toRaw(query.value),
      type: config.type || 'table',
      properties: config.properties || [],
      pinned: pinnedLeft
    }

    const stored = persistedViews.value[updatedView] || {}

    Object.assign(stored, {
      type: config.type || 'table',
      properties: config.properties || []
    })

    Object.assign(
      stored.ui || (stored.ui = {}),
      { pinned: { left: pinnedLeft } }
    )

    persistedViews.value[updatedView] = stored
  }

  return {
    entity,
    isLoading,
    items,
    query,
    refetch,
    total,
    viewCounts,

    onViewUpdate
  }
}
