<template>
  <AppPage
    :actions="entity.actions"
    :title="t(`${entityName}.title`)"
    :ui="{ body: 'pb-0 sm:pb-0' }"
  >
    <List
      v-model:query="query"
      v-model:view="view"
      :entity="computedEntity"
      :items
      :loading="isLoading"
      :total
      @view-update="onViewUpdate"
    />
  </AppPage>
</template>

<script setup>
const { t } = useI18n()
const route = useRoute()

// Entity.
const entityName = computed(() =>
  camelCase(singularize(route.params.entity))
)

const entity = useEntity(entityName)

// Views configuration (local state for customization).
const viewsConfig = ref({})

function initializeViewsConfig() {
  const result = {}

  for (const key in entity.value.views) {
    result[key] = { ...entity.value.views[key] }
  }

  return result
}

watch(entity, () => {
  viewsConfig.value = initializeViewsConfig()
}, { immediate: true })

const computedEntity = computed(() => ({
  ...entity.value,
  views: {
    ...entity.value.views,
    ...viewsConfig.value
  }
}))

// Views.
const view = ref(
  route.query.view || entity.value.display.view
)

const currentViewConfig = computed(() =>
  viewsConfig.value[view.value] || entity.value.views?.[view.value] || {}
)

const isDisplayView = computed(() =>
  entity.value.display.view === view.value
)

// Select fields based on visible properties.
const selectFields = computed(() => {
  const properties = currentViewConfig.value.properties || []

  if (properties.length === 0) return null

  const fields = [...properties]

  if (!fields.includes('id')) {
    fields.unshift('id')
  }

  return fields
})

// Query.
const query = useRouteQuery({
  view: isDisplayView.value ? undefined : view.value,
  page: 1,
  size: 25
})

const remoteQuery = computed(() => ({
  ...currentViewConfig.value.query,
  ...query.value,
  select: selectFields.value
}))

// Fetch.
const {
  list: { data: items, isLoading, refetch },
  count: { data: total }
} = await useRemoteList(entityName, remoteQuery)

// View update handler.
function onViewUpdate({ view: viewName, config }) {
  viewsConfig.value = {
    ...viewsConfig.value,
    [viewName]: config
  }

  nextTick(() => refetch())
}
</script>
