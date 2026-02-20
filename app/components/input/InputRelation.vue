<template>
  <USelectMenu
    ref="selectMenu"
    v-model="model"
    v-model:open="isOpen"
    v-model:search-term="searchTerm"
    :items="sortedItems"
    :label-key="displayProperty"
    :loading
    :placeholder="t('inputRelation.placeholder')"
    :ui="{ content: 'min-w-fit' }"
    value-key="id"
  />
</template>

<script setup>
import { refDebounced, useInfiniteScroll } from '@vueuse/core'

const props = defineProps({
  entity: {
    type: String,
    required: true
  },

  localItems: {
    type: Array,
    default: () => []
  }
})

const model = defineModel({
  type: [String, Array],
  default: ''
})

// Composables.
const { t } = useI18n()

// Entity config and properties.
const entityConfig = useEntity(() => props.entity)

const displayProperty = computed(() =>
  entityConfig.value?.display?.property || 'name'
)

const searchableProperties = computed(() => {
  const properties = []
  const entityProperties = entityConfig.value?.properties || {}

  for (const propertyKey in entityProperties) {
    if (entityProperties[propertyKey].searchable) {
      properties.push(propertyKey)
    }
  }

  return properties.length > 0 ? properties : [displayProperty.value]
})

const selectProperties = computed(() =>
  ['id', displayProperty.value, ...searchableProperties.value]
)

// State.
const isOpen = ref(false)

// Items.
const items = reactive([])

function addItem(item) {
  if (!items.some(i => i.id === item.id)) {
    items.push(item)
  }
}

function addItems(newItems) {
  for (const item of newItems) {
    addItem(item)
  }
}

addItems(props.localItems)

// Search.
const page = ref(1)
const searchTerm = ref('')
const debouncedSearch = refDebounced(searchTerm, 500)

const pageSize = 10

const { data: list, isLoading: listLoading } = useRemoteList(
  () => props.entity,

  computed(() => ({
    page: page.value,
    properties: selectProperties.value,
    size: pageSize,
    search: debouncedSearch.value,
    sort: debouncedSearch.value
      ? []
      : [{ property: displayProperty.value, direction: 'asc' }]
  })),

  computed(() => ({
    enabled: isOpen.value,
    searchFields: searchableProperties.value,

    select: data => addItems(data)
  }))
)

const { data: count, isLoading: countLoading } = useRemoteCount(
  () => props.entity,

  computed(() => ({
    search: debouncedSearch.value
  })),

  computed(() => ({
    enabled: isOpen.value,
    searchFields: searchableProperties.value
  }))
)

const { isLoading: itemLoading, suspense: itemSuspense } = useRemoteItem(
  () => props.entity,

  computed(() => ({
    id: model.value,
    properties: selectProperties.value
  })),

  computed(() => ({
    enabled: !items.value?.some(item =>
      item.id === model.value && item[displayProperty.value] !== undefined
    ),

    select: item => addItem(item)
  }))
)

const sortedItems = computed(() => {
  const display = displayProperty.value

  return [...items].sort((a, b) =>
    String(a[display] ?? '').localeCompare(String(b[display] ?? ''))
  )
})

// Loading.
const loading = computed(() =>
  listLoading.value || countLoading.value || itemLoading.value
)

// Prefetch selected item.
onServerPrefetch(async () => {
  await itemSuspense()
})

// Infinite scroll.
const selectMenuRef = useTemplateRef('selectMenu')

const canLoadMore = computed(() => {
  if (listLoading.value || countLoading.value) return false

  if (debouncedSearch.value) {
    return list.value?.length < count.value
  }

  return items.length < count.value
})

onMounted(() => useInfiniteScroll(
  () => selectMenuRef.value?.viewportRef,
  () => { page.value++ },
  { canLoadMore: () => canLoadMore.value, distance: 100 }
))
</script>
