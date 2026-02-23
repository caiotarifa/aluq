<template>
  <UIcon
    :class="model ? 'text-success' : 'text-muted'"
    :name="model ? 'i-tabler-check' : 'i-tabler-x'"
  />
</template>

<script setup>
const model = defineModel({
  type: Boolean,
  default: false
})
</script>
