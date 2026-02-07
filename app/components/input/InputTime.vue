<template>
  <UInputTime
    v-model="model"
  />
</template>

<script setup>
import { parseTime } from '@internationalized/date'

function parser(value) {
  try {
    return parseTime(value)
  }

  catch {
    return undefined
  }
}

// Model.
const modelValue = defineModel({
  type: String,
  default: undefined
})

const model = computed({
  get() {
    return parser(modelValue.value)
  },

  set(value) {
    modelValue.value = value ? value.toString() : ''
  }
})
</script>
