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
            :properties="{
              name: {
                label: 'Name',
                type: 'text'
              },

              taxId: {
                label: 'Tax ID',
                type: 'text'
              }
            }"
          />
        </div>
      </div>

      <UTabs
        v-model="viewModel"
        :content="false"
        :items="views"
        variant="link"
      />
    </header>

    <slot>
      <ListTableView
        v-model:query="query"
        :data="items"
        :loading
      />
    </slot>

    <footer
      v-if="hasItems"
      class="sticky bottom-0 z-1 flex justify-between bg-(--ui-bg)/75 px-4 py-3 backdrop-blur-sm"
    >
      <div class="flex items-center gap-x-2">
        <span class="hidden text-sm md:inline">
          {{ t('remoteList.perPage') }}
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
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  },

  properties: {
    type: Object,
    default: () => ({})
  },

  sizeOptions: {
    default: () => [5, 10, 25, 50, 100],
    type: Array
  },

  total: {
    type: Number,
    default: 0
  },

  views: {
    type: Object,
    default: () => ({})
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
