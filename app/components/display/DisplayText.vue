<template>
  <span>
    {{ display || '–' }}
  </span>
</template>

<script setup>
import { Mask } from 'maska'

const props = defineProps({
  mask: {
    type: [Array, Function, String],
    default: undefined
  }
})

const model = defineModel({
  type: String,
  default: ''
})

const maskInstance = computed(() =>
  props.mask ? new Mask({ mask: props.mask }) : null
)

const display = computed(() => {
  if (!model.value) return ''

  return maskInstance.value
    ? maskInstance.value.masked(model.value)
    : model.value
})
</script>
