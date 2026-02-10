<template>
  <USwitch
    v-model="model"
    v-bind="$attrs"
  />
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})

const model = defineModel({
  type: Boolean,
  default: false
})
</script>
