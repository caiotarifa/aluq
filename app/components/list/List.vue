<template>
  <div class="relative space-y-4 sm:space-y-6">
    <header class="space-y-2 sm:space-y-4">
      <div class="flex w-full justify-between">
        <div class="flex gap-2">
          <USkeleton
            v-if="loading"
            class="h-8 w-61.25"
          />

          <InputSearch
            v-else
            v-model="query.search"
          />
        </div>

        <div class="flex gap-2">
          <ListSort
            v-model="query.sort"
            :properties="sortableProperties"
          />

          <UDropdownMenu
            :content="{ align: 'end' }"
            :items="adjustmentsMenu"
          >
            <UButton
              class="bg-elevated/50 text-dimmed hover:bg-elevated"
              color="neutral"
              icon="i-tabler-adjustments-horizontal"
              variant="soft"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTabs
        v-if="viewItems.length > 1"
        v-model="viewModel"
        :content="false"
        :items="viewItems"
        variant="link"
      />
    </header>

    <slot>
      <ListTableView
        v-model:query="query"
        :data="items"
        :loading
        :properties="viewProperties"
      />
    </slot>

    <footer
      v-if="hasItems"
      class="sticky bottom-0 z-1 flex justify-between bg-(--ui-bg)/75 px-4 py-3 backdrop-blur-sm"
    >
      <div class="flex items-center gap-x-2">
        <span class="hidden text-sm md:inline">
          {{ t('list.perPage') }}
        </span>

        <USelect
          v-model="query.size"
          :items="sizeOptions"
          size="sm"
        />
      </div>

      <UPagination
        v-model:page="query.page"
        active-variant="subtle"
        :items-per-page="query.size"
        size="sm"
        :total="totalItems"
      />
    </footer>

    <ListImport
      v-model:open="isImportOpen"
      :entity
    />
  </div>
</template>

<script setup>
const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  },

  items: {
    type: Array,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  },

  sizeOptions: {
    default: () => [5, 10, 25, 50, 100],
    type: Array
  },

  total: {
    type: Number,
    default: 0
  }
})

const { t } = useI18n()

// Items.
const hasItems = computed(() =>
  props.items.length > 0
)

const totalItems = computed(() =>
  props.total || props.items.length
)

// Views.
const viewModel = defineModel('view', {
  type: String,
  default: ''
})

const viewItems = computed(() => {
  const result = []

  for (const key in props.entity.views) {
    result.push({
      value: key,
      label: props.entity.views[key].label || key
    })
  }

  return result
})

const viewConfig = computed(() =>
  props.entity.views?.[viewModel.value] || {}
)

// Properties.
const viewProperties = computed(() => {
  const result = {}
  const propertyKeys = viewConfig.value.properties || []

  for (const key of propertyKeys) {
    if (props.entity.properties?.[key]) {
      result[key] = props.entity.properties[key]
    }
  }

  return result
})

const sortableProperties = computed(() => {
  const result = {}

  for (const key in viewProperties.value) {
    const property = viewProperties.value[key]

    if (property.sortable !== false) {
      result[key] = property
    }
  }

  return result
})

// Import modal.
const isImportOpen = ref(false)

// Adjustments menu.
const adjustmentsMenu = computed(() => [
  {
    label: t('list.importData'),
    icon: 'i-tabler-file-import',
    onSelect: () => isImportOpen.value = true
  },
  {
    label: t('list.exportData'),
    icon: 'i-tabler-file-export'
  },
  {
    type: 'separator'
  },
  {
    label: t('list.editView'),
    icon: 'i-tabler-database-cog'
  }
])

// Query.
const queryModel = defineModel('query', {
  type: Object,
  default: () => ({})
})

const query = reactive(Object.assign({
  page: 1,
  size: 25,
  sort: [],
  search: '',
  filters: []
}, queryModel.value))

// Adjust page when size changes to keep the first visible item.
watch(() => query.size, (newSize, oldSize) => {
  const firstVisibleItem = (query.page - 1) * oldSize + 1
  const newPage = Math.ceil(firstVisibleItem / newSize)
  const maxPage = Math.ceil(totalItems.value / newSize) || 1

  query.page = Math.min(newPage, maxPage)
})

// Sync query model.
watch(query, () => {
  queryModel.value = toRaw(query)
}, { deep: true, flush: 'post' })
</script>
