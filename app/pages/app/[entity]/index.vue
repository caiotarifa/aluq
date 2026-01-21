<template>
  <!-- TODO: Ver sobre UI. -->
  <AppPage
    :actions
    :title="t(`${entity}.title`)"
    :ui="{ body: 'pb-0 sm:pb-0' }"
  >
    Total: {{ total }}

    <List
      v-model:query="query"
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

const entity = computed(() =>
  camelCase(route.params.entity)
)

const views = useViews(entity.value, {
  all: { type: 'table' }
})

const actions = computed(() => [[
  {
    label: t(`${entity.value}.actions.create`),
    icon: 'i-tabler-plus',
    to: `/${entity.value}/new`
  }
]])

const query = useRouteQuery({
  page: 1,
  size: 25
})

// Fetch.
const {
  list: { data: items, isLoading },
  count: { data: total }
} = await useRemoteList(entity, query)
</script>
