<template>
  <div
    v-if="between"
    class="flex items-center gap-2"
  >
    <UInput
      autofocus
      :model-value="rangeStart"
      :placeholder="t('operators.greaterThanOrEqual')"
      size="sm"
      type="number"
      variant="soft"
      @update:model-value="updateStart"
    />

    <span class="text-dimmed">
      {{ t('and') }}
    </span>

    <UInput
      :model-value="rangeEnd"
      :placeholder="t('operators.lessThanOrEqual')"
      size="sm"
      type="number"
      variant="soft"
      @update:model-value="updateEnd"
    />
  </div>

  <UInput
    v-else
    v-model="model"
    autofocus
    placeholder="0"
    size="sm"
    type="number"
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

  between: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const modelValue = defineModel({
  type: [Number, Array],
  default: null
})

const model = computed({
  get: () => modelValue.value,
  set: (value) => {
    modelValue.value = value === '' ? null : Number(value)
  }
})

const rangeStart = computed(() =>
  Array.isArray(modelValue.value)
    ? modelValue.value[0]
    : null
)

const rangeEnd = computed(() =>
  Array.isArray(modelValue.value)
    ? modelValue.value[1]
    : null
)

function updateStart(value) {
  const current = Array.isArray(modelValue.value)
    ? modelValue.value
    : [null, null]

  modelValue.value = [
    value === '' ? null : Number(value),
    current[1]
  ]
}

function updateEnd(value) {
  const current = Array.isArray(modelValue.value)
    ? modelValue.value
    : [null, null]

  modelValue.value = [
    current[0],
    value === '' ? null : Number(value)
  ]
}
</script>
