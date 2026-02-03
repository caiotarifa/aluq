<template>
  <UModal
    :close="false"
    :description
    :dismissible="false"
    :title
    :ui="{ footer: 'flex-row-reverse justify-start' }"
  >
    <template #footer>
      <UButton
        :label="t('actions.delete')"
        :loading
        @click="emit('close', true)"
      />

      <UButton
        color="neutral"
        :disabled="loading"
        :label="t('actions.cancel')"
        variant="ghost"
        @click="emit('close', false)"
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

  loading: {
    type: Boolean,
    default: false
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
