<template>
  <UTable
    v-model:sorting="sorting"
    :column-pinning="columnPinning"
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

const sort = defineModel('sort', {
  type: Array,
  default: () => []
})

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
      header: ({ column }) => getHeader(column, property)
    })
  }

  return results
})

const columnPinning = computed(() => ({
  left: props.pinned?.left || [],
  right: props.pinned?.right || []
}))

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
