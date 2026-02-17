<template>
  <USelectMenu
    v-model="model"
    v-model:search-term="searchTerm"
    by="id"
    :ignore-filter="true"
    :items="items || []"
    :label-key="displayProperty"
    :loading
    :placeholder="t('inputRelation.placeholder')"
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
    value-key="id"
  />
</template>

<script setup>
const props = defineProps({
  entity: {
    type: String,
    required: true
  }
})

const model = defineModel({
  type: [String, Array],
  default: null
})

const { t } = useI18n()

const entityConfig = useEntity(() => props.entity)

const displayProperty = computed(() =>
  entityConfig.value?.display?.property || 'name'
)

const searchFields = computed(() => {
  const fields = []

  for (const key in entityConfig.value?.properties || {}) {
    const property = entityConfig.value.properties[key]

    if (property.searchable) {
      fields.push(key)
    }
  }

  return fields.length > 0 ? fields : [displayProperty.value]
})

const searchTerm = ref('')

const { data: items, isLoading: loading } = useRemoteList(
  () => props.entity,

  computed(() => ({
    page: 1,
    size: 10,
    search: searchTerm.value
  })),

  computed(() => ({
    searchFields: searchFields.value
  }))
)
</script>
