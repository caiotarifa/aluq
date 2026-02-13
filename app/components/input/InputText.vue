<template>
  <UInput
    v-if="mask"
    v-model="display"
    v-maska="maskaOptions"
    v-bind="$attrs"
  />

  <UInput
    v-else
    v-model="model"
    v-bind="$attrs"
  />
</template>

<script setup>
import { vMaska } from 'maska/vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  mask: {
    type: [String, Array, Function],
    default: undefined
  }
})

const model = defineModel({
  type: String,
  default: ''
})

const display = ref(model.value || '')
const lastUnmasked = ref(model.value || '')

const maskaOptions = computed(() => ({
  mask: props.mask,
  onMaska: (detail) => {
    lastUnmasked.value = detail.unmasked
    model.value = detail.unmasked
  }
}))

// Sync display when model changes externally
// (e.g. form reset, loading existing data)
watch(() => model.value, (value) => {
  if (value !== lastUnmasked.value) {
    lastUnmasked.value = value || ''
    display.value = value || ''
  }
})
</script>
