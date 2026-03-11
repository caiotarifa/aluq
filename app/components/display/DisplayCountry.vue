<template>
  <span v-if="model">
    {{ flag }} {{ name }}
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

const { locale } = useI18n()

const displayNames = computed(() =>
  new Intl.DisplayNames([locale.value], { type: 'region' })
)

const flag = computed(() =>
  model.value ? getCountryFlag(model.value) : ''
)

const name = computed(() =>
  model.value
    ? displayNames.value.of(model.value) || model.value
    : ''
)
</script>
