<template>
  <UTable
    v-model:sorting="sorting"
    :columns
    :data
    :loading
    sticky
    :ui="{
      root: 'overflow-clip',
      td: loading ? 'blur opacity-50 pointer-events-none' : '',
      thead: '-top-4 sm:-top-6'
    }"
  />
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => []
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
  }
})

const query = defineModel('query', {
  type: Object,
  default: () => ({ sort: [] })
})

// Sorting.
const sorting = computed({
  get() {
    return query.value.sort.map(sort => ({
      id: sort.property,
      desc: sort.direction === 'desc'
    }))
  },

  set(value) {
    query.value.sort = value.map(sort => ({
      property: sort.id,
      direction: sort.desc ? 'desc' : 'asc'
    }))
  }
})

// Columns.
const columns = computed(() => {
  const results = []
  const pinnedLeft = props.pinned?.left || []
  const pinnedRight = props.pinned?.right || []

  for (const key in props.properties) {
    const property = props.properties[key]

    let pinned = false

    if (pinnedLeft.includes(key)) {
      pinned = 'left'
    }
    else if (pinnedRight.includes(key)) {
      pinned = 'right'
    }

    results.push({
      accessorKey: key,
      header: ({ column }) => getHeader(column, property),
      ...(pinned && { pinned })
    })
  }

  return results
})

function getHeader(column, property) {
  const nodes = []

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

  return h('div', { class: 'flex items-center gap-2' }, nodes)
}
</script>
