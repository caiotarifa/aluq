<template>
  <div class="relative">
    <header class="flex justify-between">
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
          :fields="[
            {
              key: 'name',
              label: 'Name',
              icon: 'i-tabler-user',
              sortable: true
            },
            {
              key: 'taxId',
              label: 'Tax ID',
              icon: 'i-tabler-id',
              sortable: true
            }
          ]"
        />
      </div>
    </header>

    <div class="flex justify-between py-6">
      <div class="flex-1">
        <div>Items:</div>
        <pre>{{ items }}</pre>
      </div>

      <div>
        <div>Query:</div>
        <pre>{{ query }}</pre>
      </div>
    </div>

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
  columns: {
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

// const pageItems = computed(() => {
//   const start = (query.page - 1) * query.size
//   const end = start + query.size

//   return props.items.slice(start, end)
// })

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
