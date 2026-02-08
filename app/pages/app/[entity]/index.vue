<template>
  <AppPage
    :actions="entity.actions"
    :title="t(`${entityName}.title`)"
    :ui="{ body: 'pb-0 sm:pb-0' }"
  >
    <List
      v-model:query="query"
      :entity="entity"
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

const entityName = computed(() =>
  camelCase(singularize(route.params.entity))
)

const {
  entity,
  isLoading,
  items,
  onViewUpdate,
  query,
  total
} = useEntityList(entityName)
</script>
