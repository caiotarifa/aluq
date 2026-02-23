<template>
  <span>
    {{ formatted }}
  </span>
</template>

<script setup>
const props = defineProps({
  currency: {
    type: String,
    default: 'BRL'
  }
})

const model = defineModel({
  type: Number,
  default: null
})

const { locale } = useI18n()

const formatted = computed(() => {
  if (model.value == null) {
    return '–'
  }

  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: props.currency || 'BRL'
  }).format(model.value)
})
</script>
