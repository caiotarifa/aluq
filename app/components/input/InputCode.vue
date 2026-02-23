<template>
  <UInput
    v-model="model"
    class="font-mono"
    v-bind="$attrs"
  />
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})

const model = defineModel({
  type: String,
  default: ''
})
</script>
