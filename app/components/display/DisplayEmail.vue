<template>
  <ActionLink
    v-if="model"
    icon="i-tabler-mail"
    :to="`mailto:${model}`"
  >
    {{ model }}
  </ActionLink>

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
