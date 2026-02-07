<template>
  <InputDate
    v-model="model"
    :range
    size="sm"
    variant="soft"
  />
</template>

<script setup>
defineProps({
  field: {
    type: Object,
    default: () => ({})
  },

  operator: {
    type: String,
    default: 'equals'
  },

  range: {
    type: Boolean,
    default: false
  }
})

const model = defineModel({
  type: [String, Array],
  default: null
})
</script>
