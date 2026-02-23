<template>
  <span
    v-if="model"
    class="group/code inline-flex items-center"
  >
    <span class="font-mono text-xs">
      {{ model }}
    </span>

    <span class="invisible group-hover/code:visible [td:hover_&]:visible">
      <CopyButton :text="model" />
    </span>
  </span>

  <span v-else>
    –
  </span>
</template>

<script setup>
const model = defineModel({
  type: String,
  default: ''
})
</script>
