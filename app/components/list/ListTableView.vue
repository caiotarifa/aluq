<template>
  <UTable
    v-model:sorting="sorting"
    :column-pinning="columnPinning"
    :columns
    :data="tableData"
    :loading
    sticky
    :ui="{ root: 'overflow-clip', thead: '-top-4 sm:-top-6', tbody: 'cursor-pointer' }"
    @hover="onHover"
    @select="onSelect"
  />
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },

  entity: {
    type: Object,
    default: () => ({})
  },

  loading: {
    type: Boolean,
    default: false
  },

  pinned: {
    type: Object,
    default: () => ({ left: [], right: [] })
  },

  properties: {
    type: Object,
    default: () => ({})
  },

  size: {
    type: Number,
    default: 5
  }
})

const sort = defineModel('sort', {
  type: Array,
  default: () => []
})

// Skeleton data.
const USkeleton = resolveComponent('USkeleton')

const skeletonData = computed(() => {
  if (!props.loading || props.data.length > 0) return null

  const keys = Object.keys(props.properties)

  return Array.from({ length: props.size }, () => {
    const row = { _skeleton: true }

    for (const key of keys) {
      row[key] = null
    }

    return row
  })
})

const tableData = computed(() =>
  skeletonData.value || props.data
)

// Sorting.
const sorting = computed({
  get() {
    return sort.value.map(item => ({
      id: item.property,
      desc: item.direction === 'desc'
    }))
  },

  set(value) {
    sort.value = value.map(item => ({
      property: item.id,
      direction: item.desc ? 'desc' : 'asc'
    }))
  }
})

// Columns.
const columns = computed(() => {
  const results = []

  for (const key in props.properties) {
    const property = props.properties[key]

    results.push({
      accessorKey: key,

      header: ({ column }) => getHeader(column, property),

      cell: ({ row }) => {
        if (row.original._skeleton) {
          return h(USkeleton, { class: 'h-4 w-full max-w-48' })
        }

        return row.getValue(key)
      }
    })
  }

  return results
})

const columnPinning = computed(() => ({
  left: props.pinned?.left || [],
  right: props.pinned?.right || []
}))

// Navigation.
const route = useRoute()
const hoveredRow = ref(null)

function onHover(_, row) {
  hoveredRow.value = row
}

function onSelect(_, row) {
  if (row.original._skeleton) return

  const id = row.original.id
  navigateTo(`/app/${route.params.entity}/${id}`)
}

function getHeader(column, property) {
  const nodes = []
  const isPinned = Boolean(column.getIsPinned())

  // Sort button.
  const isSorted = column.getIsSorted()
  const canSort = property.sortable !== false

  if (isSorted || canSort) {
    nodes.push(h(UButton, {
      class: '-ml-2',
      color: 'neutral',
      disabled: !canSort,
      icon: isSorted
        ? `i-tabler-sort-${isSorted}ending`
        : 'i-tabler-arrows-sort',
      size: 'xs',
      variant: 'ghost',
      onClick: () => {
        const currentDirection = column.getIsSorted()

        if (!currentDirection) {
          return column.toggleSorting(true, true)
        }

        if (currentDirection === 'desc') {
          return column.toggleSorting(false, true)
        }

        return column.clearSorting()
      }
    }))
  }

  nodes.push(h('span', {}, property.label))

  if (isPinned) {
    nodes.push(h(UIcon, {
      class: 'ml-auto size-4 text-primary',
      name: 'i-tabler-pinned-filled'
    }))
  }

  return h('div', { class: 'flex w-full items-center gap-2' }, nodes)
}
</script>
