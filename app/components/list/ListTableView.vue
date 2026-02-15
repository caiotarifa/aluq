<template>
  <UTable
    v-model:row-selection="rowSelection"
    v-model:sorting="sorting"
    :column-pinning="columnPinning"
    :columns
    :data="tableData"
    :get-row-id
    :loading
    sticky
    :ui="{
      root: 'overflow-clip',
      thead: '-top-4 sm:-top-6',
      tbody: 'cursor-pointer'
    }"
    @hover="onHover"
    @select="onSelect"
  />
</template>

<script setup>
const props = defineProps({
  batchActions: {
    type: Array,
    default: undefined
  },

  data: {
    type: Array,
    default: () => []
  },

  entity: {
    type: Object,
    default: () => ({})
  },

  itemActions: {
    type: Array,
    default: undefined
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

// Models.
const sort = defineModel('sort', {
  type: Array,
  default: () => []
})

const rowSelection = defineModel('rowSelection', {
  type: Object,
  default: () => ({})
})

// Emits.
const emit = defineEmits([
  'item-action'
])

// Row ID.
function getRowId(row) {
  return row.id
}

// Skeleton data.
const USkeleton = resolveComponent('USkeleton')

const skeletonData = computed(() => {
  if (!props.loading || props.data.length > 0) return null

  const keys = Object.keys(props.properties)

  return Array.from({ length: props.size }, (_, index) => {
    const id = `skeleton-${index + 1}`
    const row = { _skeleton: true, id }

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
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const hasBatchActions = computed(() =>
  props.batchActions?.length > 0
)

const hasItemActions = computed(() =>
  props.itemActions?.length > 0
)

const columns = computed(() => {
  const results = []

  // Batch actions column.
  if (hasBatchActions.value) {
    results.push({
      id: '_select',
      size: 32,

      header: ({ table }) => h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),

        'onUpdate:modelValue': value =>
          table.toggleAllPageRowsSelected(!!value)
      }),

      cell: ({ row }) => {
        if (row.original._skeleton) return null

        return h(UCheckbox, {
          'modelValue': row.getIsSelected(),
          'onUpdate:modelValue': value => row.toggleSelected(!!value),
          'onClick': event => event.stopPropagation()
        })
      }
    })
  }

  // Data columns.
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

  // Item actions column.
  if (hasItemActions.value) {
    results.push({
      id: '_itemActions',
      size: 40,

      header: () => null,

      meta: {
        class: { td: 'text-right' }
      },

      cell: ({ row }) => {
        if (row.original._skeleton) return null

        return h(UDropdownMenu, {
          content: { align: 'end' },
          items: buildItemActionsMenu(row.original)
        }, () => h(UButton, {
          color: 'neutral',
          icon: 'i-tabler-dots-vertical',
          size: 'xs',
          variant: 'ghost',
          onClick: event => event.stopPropagation()
        }))
      }
    })
  }

  return results
})

function buildItemActionsMenu(item) {
  return props.itemActions.map(action => ({
    color: action.color,
    icon: action.icon,
    label: action.label,
    onSelect: () => emit('item-action', { action, item })
  }))
}

const columnPinning = computed(() => {
  const left = [...(props.pinned?.left || [])]
  const right = [...(props.pinned?.right || [])]

  if (hasBatchActions.value) {
    left.unshift('_select')
  }

  if (hasItemActions.value) {
    right.push('_itemActions')
  }

  return { left, right }
})

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
        const direction = column.getIsSorted()

        if (!direction) {
          return column.toggleSorting(true, true)
        }

        if (direction === 'desc') {
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
