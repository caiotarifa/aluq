<template>
  <UChatPrompt
    v-model="inputProxy"
    @submit="emit('submit')"
  >
    <template #footer>
      <USelectMenu
        v-model="modelProxy"
        :icon="modelItem?.icon"
        :items="models"
        size="sm"
        value-key="value"
        variant="ghost"
      />

      <UChatPromptSubmit
        color="primary"
        size="sm"
        :status
        @reload="emit('reload')"
        @stop="emit('stop')"
      />
    </template>
  </UChatPrompt>
</template>

<script setup>
defineProps({
  modelItem: {
    type: Object,
    default: () => ({})
  },

  models: {
    type: Array,
    default: () => []
  },

  status: {
    type: String,
    default: 'ready'
  }
})

const inputProxy = defineModel({
  type: String,
  default: ''
})

const modelProxy = defineModel('model', {
  type: String,
  default: ''
})

const emit = defineEmits([
  'reload',
  'stop',
  'submit'
])
</script>
