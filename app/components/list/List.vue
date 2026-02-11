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
        @update:model-value="queryModel = { view: $event }"
      />
    </header>

    <slot>
      <ListTableView
        :data="items"
        :loading
        :pinned="pinnedColumns"
        :properties="viewProperties"
        :size="queryModel.size"
        :sort="queryModel.sort"
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
  }
})

const emit = defineEmits([
  'refetch',
  'view-update'
])

const { t } = useI18n()

// Query.
const queryModel = defineModel('query', {
  type: Object,
  default: () => ({})
})

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

// Views.
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

function onViewUpdate(payload) {
  emit('view-update', payload)
}

// Properties.
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
</script>
