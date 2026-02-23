<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <template v-if="isSkeleton">
      <UCard
        v-for="index in size"
        :key="index"
      >
        <template #header>
          <USkeleton class="h-5 w-3/4" />
        </template>

        <div class="space-y-3">
          <USkeleton class="h-4 w-3/5" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </UCard>
    </template>

    <UCard
      v-for="item in data"
      v-else
      :key="item.id"
      class="cursor-pointer transition-colors hover:bg-elevated/50"
      :ui="{ header: 'flex items-center gap-3' }"
      @click="navigateTo(getItemRoute(item))"
    >
      <template #header>
        <UCheckbox
          v-if="hasBatchActions"
          :model-value="isSelected(item.id)"
          @click.stop
          @update:model-value="toggleSelection(item.id)"
        />

        <h3 class="flex-1 truncate text-sm font-semibold text-highlighted">
          {{ getDisplayValue(item) }}
        </h3>

        <UDropdownMenu
          v-if="hasItemActions"
          :content="{ align: 'end' }"
          :items="buildItemActionsMenu(item)"
        >
          <UButton
            color="neutral"
            icon="i-tabler-dots-vertical"
            size="xs"
            variant="ghost"
            @click.stop
          />
        </UDropdownMenu>
      </template>

      <dl class="space-y-1">
        <div
          v-for="(property, key) in detailProperties"
          :key
          class="flex items-baseline gap-2 text-sm"
        >
          <dt class="shrink-0 text-dimmed">
            {{ property.label }}
          </dt>

          <dd class="truncate text-default">
            <component
              :is="resolveDisplay(property.displayConfig)"
              v-if="resolveDisplay(property.displayConfig)"
              :model-value="item[key]"
              v-bind="property.displayConfig?.props"
            />

            <span v-else>
              {{ item[key] ?? '–' }}
            </span>
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
</template>

<script setup>
const { resolve: resolveDisplay } = useDisplay()

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

  properties: {
    type: Object,
    default: () => ({})
  },

  size: {
    type: Number,
    default: 5
  }
})

const rowSelection = defineModel('rowSelection', {
  type: Object,
  default: () => ({})
})

const emit = defineEmits([
  'item-action'
])

const route = useRoute()

// Skeleton.
const isSkeleton = computed(() =>
  props.loading && props.data.length === 0
)

// Batch actions.
const hasBatchActions = computed(() =>
  props.batchActions?.length > 0
)

const hasItemActions = computed(() =>
  props.itemActions?.length > 0
)

function isSelected(id) {
  return !!rowSelection.value[id]
}

function toggleSelection(id) {
  const { [id]: selected, ...rest } = rowSelection.value

  rowSelection.value = selected
    ? rest
    : { ...rowSelection.value, [id]: true }
}

// Item actions.
function buildItemActionsMenu(item) {
  return props.itemActions.map(action => ({
    label: action.label,
    icon: action.icon,
    color: action.color,
    onSelect: () => emit('item-action', { action, item })
  }))
}

// Display property (title of the card).
const displayProperty = computed(() =>
  props.entity.display?.property || 'name'
)

// Detail properties (except the title).
const detailProperties = computed(() => {
  const result = {}
  const displayKey = displayProperty.value

  for (const key in props.properties) {
    if (key === displayKey) continue
    result[key] = props.properties[key]
  }

  return result
})

// Navigation.
function getDisplayValue(item) {
  return item[displayProperty.value] ?? ''
}

function getItemRoute(item) {
  return `/app/${route.params.entity}/${item.id}`
}
</script>
