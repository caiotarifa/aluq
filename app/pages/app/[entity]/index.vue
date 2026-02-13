<template>
  <AppPage
    :actions="entity.actions"
    :title="t(`${entityName}.title`, 2)"
    :ui="{ body: 'pb-0 sm:pb-0' }"
  >
    <List
      v-model:query="query"
      :entity="entity"
      :items
      :loading="isLoading"
      :total
      :view-counts
      @batch-action="onBatchAction"
      @item-action="onItemAction"
      @view-update="onViewUpdate"
    />
  </AppPage>
</template>

<script setup>
import { camelCase } from 'es-toolkit/string'

const { t } = useI18n()
const route = useRoute()

const entityName = computed(() =>
  camelCase(singularize(route.params.entity))
)

const {
  entity,
  isLoading,
  items,
  query,
  total,
  viewCounts,

  onBatchAction,
  onItemAction,
  onViewUpdate
} = useEntityList(entityName)
</script>
