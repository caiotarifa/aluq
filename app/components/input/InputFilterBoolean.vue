<template>
  <USelect
    v-model="model"
    :items="options"
    size="sm"
    variant="soft"
  />
</template>

<script setup>
defineProps({
  field: {
    type: Object,
    default: () => ({})
  },

  operator: {
    type: String,
    default: 'equals'
  }
})

const { t } = useI18n()

const model = defineModel({
  type: Boolean,
  default: true
})

const options = computed(() => [
  { label: t('yes'), value: true },
  { label: t('no'), value: false }
])
</script>
