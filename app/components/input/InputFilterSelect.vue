<template>
  <USelectMenu
    v-if="multiple"
    v-model="model"
    :items="options"
    multiple
    :placeholder="t('listFilter.filter')"
    size="sm"
    variant="soft"
  />

  <USelect
    v-else
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
  },

  options: {
    type: Array,
    default: () => []
  },

  multiple: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const model = defineModel({
  type: [String, Number, Boolean, Array],
  default: null
})
</script>
