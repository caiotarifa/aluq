<template>
  <UTable
    :data
    :loading
    sticky
    :ui="{
      root: 'overflow-clip',
      td: loading ? 'blur opacity-50 pointer-events-none' : '',
      thead: '-top-4 sm:-top-6'
    }"
  />
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => []
  },

  loading: {
    type: Boolean,
    default: false
  }
})
</script>
