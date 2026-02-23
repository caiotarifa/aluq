<template>
  <span>{{ formatted }}</span>
</template>

<script setup>
const { n } = useI18n()

const model = defineModel({
  type: Number,
  default: null
})

const formatted = computed(() =>
  model.value !== null ? n(model.value) : '–'
)
</script>
