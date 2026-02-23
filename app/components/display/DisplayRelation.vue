<template>
  <NuxtLink
    v-if="link && model"
    :to="`/app/${entity}/${model}`"
  >
    <UBadge
      color="neutral"
      variant="subtle"
    >
      {{ displayLabel }}
    </UBadge>
  </NuxtLink>

  <UBadge
    v-else-if="model"
    color="neutral"
    variant="subtle"
  >
    {{ displayLabel }}
  </UBadge>

  <span v-else>
    –
  </span>
</template>

<script setup>
const { entity, link = true } = defineProps({
  entity: {
    type: String,
    required: true
  },

  link: {
    type: Boolean,
    default: true
  }
})

const model = defineModel({
  type: String,
  default: null
})

const entityConfig = useEntity(() => entity)

const displayProperty = computed(() =>
  entityConfig.value?.display?.property || 'name'
)

const selectProperties = computed(() =>
  ['id', displayProperty.value]
)

const { data: record } = useRemoteItem(
  () => entity,

  computed(() => ({
    id: model.value,
    properties: selectProperties.value
  })),

  computed(() => ({
    enabled: !!model.value
  }))
)

const displayLabel = computed(() =>
  record.value?.[displayProperty.value] ?? model.value ?? '–'
)
</script>
