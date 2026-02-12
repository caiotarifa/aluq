<template>
  <UModal
    :close="false"
    :description
    :dismissible="false"
    :icon
    :title
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        :label="t('actions.ok')"
        @click="emit('close')"
      />
    </template>
  </UModal>
</template>

<script setup>
const { t } = useI18n()

defineProps({
  description: {
    type: String,
    default: ''
  },

  icon: {
    type: String,
    default: ''
  },

  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'close'
])
</script>
