<template>
  <!-- TODO: Ver sobre a prop UI. -->
  <AppPage
    :actions="entity.actions"
    :title="t(`${entityName}.title`)"
    :ui="{ body: 'pb-0 sm:pb-0' }"
  >
    <List
      v-model:query="query"
      v-model:view="view"
      :items
      :loading="isLoading"
      :total
      :views
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

// Views.
const views = computed(() =>
  entity.value.views || {}
)

const view = ref(
  route.query.view || entity.value.display.view
)

const viewOptions = computed(() =>
  views.value[view.value] || {}
)

const isDisplayView = computed(() =>
  entity.value.display.view === view.value
)

// Query.
const query = useRouteQuery({
  view: isDisplayView.value ? undefined : view.value,
  page: 1,
  size: 25
})

const remoteQuery = computed(() => ({
  ...viewOptions.value.query,
  ...query.value
}))

// Fetch.
const {
  list: { data: items, isLoading },
  count: { data: total }
} = await useRemoteList(entityName, remoteQuery)
</script>
