<template>
  <USelectMenu
    v-if="multiple"
    v-model="model"
    :items
    multiple
    :placeholder="t('listFilter.filter')"
    size="sm"
    variant="soft"
  />

  <USelect
    v-else
    v-model="model"
    :items
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

  items: {
    type: Array,
    default: () => []
  },

  operator: {
    type: String,
    default: 'equals'
  },

  multiple: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const model = defineModel({
  type: [Array, String],
  default: null
})
</script>
