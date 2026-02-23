<template>
  <span>{{ formatted }}</span>
</template>

<script setup>
const { d } = useI18n()

const model = defineModel({
  type: String,
  default: null
})

const formatted = computed(() =>
  model.value ? d(new Date(model.value)) : '–'
)
</script>
