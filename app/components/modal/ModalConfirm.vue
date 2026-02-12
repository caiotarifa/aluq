<template>
  <UModal
    :close="false"
    :description
    :dismissible="!loading"
    :title
    :ui="{ footer: 'flex-row-reverse justify-start' }"
  >
    <template #footer>
      <UButton
        color="error"
        :label="confirmLabel || t('actions.confirm')"
        :loading
        @click="onConfirm"
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

const props = defineProps({
  action: {
    type: Function,
    default: null
  },

  confirmLabel: {
    type: String,
    default: ''
  },

  description: {
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

const loading = ref(false)

async function onConfirm() {
  if (!props.action) {
    emit('close', true)
    return
  }

  try {
    loading.value = true
    await props.action()
    emit('close', true)
  }

  finally {
    loading.value = false
  }
}
</script>
