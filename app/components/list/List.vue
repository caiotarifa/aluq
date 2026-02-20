<template>
  <div class="relative space-y-4 sm:space-y-6">
    <header class="space-y-2 sm:space-y-4">
      <div class="flex w-full items-start justify-between gap-4">
        <div class="flex items-start gap-2">
          <InputSearch
            :model-value="queryModel.search"
            @update:model-value="updateQuery({ search: $event })"
          />

          <ListFilter
            :entity
            :model-value="queryModel.filter"
            @update:model-value="updateQuery({ filter: $event })"
          />
        </div>

        <div class="flex gap-2">
          <ListSort
            :entity
            :model-value="queryModel.sort"
            @update:model-value="updateQuery({ sort: $event })"
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
        :content="false"
        :items="viewItems"
        :model-value="queryModel.view"
        variant="link"
        @update:model-value="updateQuery({ view: $event, page: 1 })"
      />
    </header>

    <!-- Batch actions toolbar -->
    <Transition name="expand-height">
      <div v-if="hasSelection">
        <div class="flex items-center gap-3 rounded-lg border border-default/50 bg-elevated px-4 py-2">
          <UCheckbox
            :model-value="isAllSelected ? true : 'indeterminate'"
            @update:model-value="onToggleAll"
          />

          <span class="text-sm font-medium">
            {{ t('list.batchActions.selected', { count: selectedCount }) }}
          </span>

          <div class="ml-auto flex gap-2">
            <UButton
              v-for="action in resolvedBatchActions"
              :key="action.key"
              :color="action.color || 'neutral'"
              :icon="action.icon"
              :label="action.label"
              size="sm"
              variant="soft"
              @click="onBatchAction(action)"
            />

            <UButton
              color="neutral"
              icon="i-tabler-x"
              size="xs"
              variant="ghost"
              @click="clearSelection"
            />
          </div>
        </div>
      </div>
    </Transition>

    <slot>
      <ListEmptyState
        v-if="emptyStateType"
        :entity
        :search="queryModel.search"
        :type="emptyStateType"
        @clear="onClearFilters"
      />

      <ListCardView
        v-else-if="queryModel.type === 'cards'"
        v-model:row-selection="rowSelectionModel"
        :batch-actions="resolvedBatchActions"
        :data="flattenedItems"
        :entity
        :item-actions="resolvedItemActions"
        :loading
        :properties="viewProperties"
        :size="queryModel.size"
        @item-action="onItemAction"
      />

      <ListTableView
        v-else
        v-model:row-selection="rowSelectionModel"
        v-model:sort="queryModel.sort"
        :batch-actions="resolvedBatchActions"
        :data="flattenedItems"
        :entity
        :item-actions="resolvedItemActions"
        :loading
        :pinned="pinnedColumns"
        :properties="viewProperties"
        :size="queryModel.size"
        @item-action="onItemAction"
        @update:sort="updateQuery({ sort: $event })"
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
          :items="sizeOptions"
          :model-value="queryModel.size"
          size="sm"
          @update:model-value="onSizeChange"
        />
      </div>

      <UPagination
        active-variant="subtle"
        :items-per-page="queryModel.size"
        :page="queryModel.page"
        size="sm"
        :total="totalItems"
        @update:page="updateQuery({ page: $event })"
      />
    </footer>

    <ListImport
      v-model:open="isImportOpen"
      :entity
      @imported="emit('refetch')"
    />

    <ListExport
      v-model:open="isExportOpen"
      :entity
      :items
    />

    <ListEditView
      v-model:open="isEditViewOpen"
      :entity
      :query="queryModel"
      @update="onViewUpdate"
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
  },

  viewCounts: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'batch-action',
  'item-action',
  'refetch',
  'view-update'
])

const { t } = useI18n()

// Query.
const queryModel = defineModel('query', {
  type: Object,
  default: () => ({})
})

const rowSelectionModel = defineModel('rowSelection', {
  type: Object,
  default: () => ({})
})

// Selection.
const selectedIds = computed(() => {
  const ids = []

  for (const id in rowSelectionModel.value) {
    if (rowSelectionModel.value[id]) ids.push(id)
  }

  return ids
})

function clearSelection() {
  rowSelectionModel.value = {}
}

function updateQuery(patch) {
  queryModel.value = { ...queryModel.value, ...patch }
}

function onSizeChange(newSize) {
  const { page, size: oldSize } = queryModel.value
  const firstVisible = (page - 1) * oldSize + 1
  const maxPage = Math.ceil(totalItems.value / newSize) || 1

  updateQuery({
    size: newSize,
    page: Math.min(Math.ceil(firstVisible / newSize), maxPage)
  })
}

// Items.
const hasItems = computed(() =>
  props.items.length > 0
)

const totalItems = computed(() =>
  props.total || props.items.length
)

// Item actions.
const resolvedItemActions = computed(() =>
  props.entity.itemActions || undefined
)

// Batch actions.
const resolvedBatchActions = computed(() =>
  props.entity.batchActions || undefined
)

const selectedCount = computed(() =>
  selectedIds.value.length
)

const hasSelection = computed(() =>
  selectedCount.value > 0
)

const isAllSelected = computed(() =>
  props.items.length > 0 && selectedIds.value.length >= props.items.length
)

function onToggleAll(value) {
  if (value) {
    const next = {}

    for (const item of props.items) {
      next[item.id] = true
    }

    rowSelectionModel.value = next
    return
  }

  clearSelection()
}

function onItemAction({ action, item }) {
  emit('item-action', { action, item })
}

async function onBatchAction(action) {
  await emit('batch-action', { action, ids: selectedIds.value })
  clearSelection()
}

// Views.
const viewItems = computed(() => {
  const result = []

  for (const key in props.entity.views) {
    const count = props.viewCounts[key]

    result.push({
      value: key,
      label: props.entity.views[key].label || key,
      badge: count != null ? String(count) : undefined
    })
  }

  return result
})

function onViewUpdate(payload) {
  emit('view-update', payload)
}

// Properties.
const nestedKeys = computed(() => {
  const keys = []

  for (const key of queryModel.value.properties || []) {
    if (key.includes('.')) {
      keys.push(key)
    }
  }

  return keys
})

const viewProperties = computed(() => {
  const result = {}
  const propertyKeys = queryModel.value.properties || []

  for (const key of propertyKeys) {
    if (props.entity.properties?.[key]) {
      result[key] = props.entity.properties[key]
    }
  }

  return result
})

// Flatten nested data for child views.
const flattenedItems = computed(() => {
  const keys = nestedKeys.value

  if (keys.length === 0) {
    return props.items
  }

  const result = []

  for (const item of props.items) {
    const flat = { ...item }

    for (const key of keys) {
      const [relation, property] = key.split('.')
      const value = item[relation]

      if (Array.isArray(value)) {
        flat[key] = value.map(v => v?.[property]).filter(Boolean).join(', ')
      }
      else {
        flat[key] = value?.[property] ?? null
      }
    }

    result.push(flat)
  }

  return result
})

const pinnedColumns = computed(() => {
  const view = queryModel.value.view

  return {
    left: queryModel.value.pinned || [],
    right: props.entity.views?.[view]?.ui?.pinned?.right || []
  }
})

// Import modal.
const isImportOpen = ref(false)

// Export modal.
const isExportOpen = ref(false)

// Edit view slideover.
const isEditViewOpen = ref(false)

// Adjustments menu.
const adjustmentsMenu = computed(() => [
  {
    label: t('list.importData'),
    icon: 'i-tabler-file-import',
    onSelect: () => isImportOpen.value = true
  },
  {
    label: t('list.exportData'),
    icon: 'i-tabler-file-export',
    onSelect: () => isExportOpen.value = true
  },
  {
    type: 'separator'
  },
  {
    label: t('list.editView'),
    icon: 'i-tabler-database-cog',
    onSelect: () => isEditViewOpen.value = true
  }
])

// Empty state.
const emptyStateType = computed(() => {
  if (props.loading || hasItems.value) return null

  if (queryModel.value.search || queryModel.value.filter?.length > 0) {
    return 'no-results'
  }

  return 'no-records'
})

function onClearFilters() {
  updateQuery({
    search: '',
    filter: []
  })
}
</script>
