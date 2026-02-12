<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <template v-if="isSkeleton">
      <UCard
        v-for="index in size"
        :key="index"
      >
        <div class="space-y-3">
          <USkeleton class="h-5 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </UCard>
    </template>

    <UCard
      v-for="item in data"
      v-else
      :key="item.id"
      class="cursor-pointer transition-shadow hover:shadow-md"
      @click="navigateTo(getItemRoute(item))"
    >
      <template #header>
        <h3 class="truncate text-sm font-semibold text-highlighted">
          {{ getDisplayValue(item) }}
        </h3>
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
            {{ item[key] }}
          </dd>
        </div>
      </dl>
    </UCard>
  </div>
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

  properties: {
    type: Object,
    default: () => ({})
  },

  size: {
    type: Number,
    default: 5
  }
})

const route = useRoute()

// Skeleton.
const isSkeleton = computed(() =>
  props.loading && props.data.length === 0
)

// Display property (title of the card).
const displayProperty = computed(() =>
  props.entity.display?.property || 'name'
)

// Detail properties (all properties except the title).
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
