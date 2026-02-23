<template>
  <UBadge
    v-if="selected"
    color="neutral"
    variant="subtle"
  >
    {{ selected.label }}
  </UBadge>

  <span v-else>
    –
  </span>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const model = defineModel({
  type: [Array, String],
  default: null
})

const selected = computed(() =>
  props.items.find(item => item.value === model.value)
)
</script>
