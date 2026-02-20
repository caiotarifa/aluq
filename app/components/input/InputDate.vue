<template>
  <UFieldGroup>
    <UInputDate
      ref="inputDate"
      v-bind="$attrs"
      v-model="model"
      :range
    />

    <UPopover :reference="inputDate?.inputsRef?.[range ? 0 : 3]?.$el">
      <UButton
        class="px-2.5 text-muted"
        color="neutral"
        icon="i-tabler-calendar"
        size="xs"
        variant="subtle"
      />

      <template #content>
        <UCalendar
          v-model="model"
          class="p-2"
          :number-of-months="range ? 2 : 1"
          :range
        />
      </template>
    </UPopover>
  </UFieldGroup>
</template>

<script setup>
import { parseDate } from '@internationalized/date'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  range: {
    type: Boolean,
    default: false
  }
})

const inputDate = useTemplateRef('inputDate')

function parser(value) {
  try {
    return parseDate(value)
  }

  catch {
    return undefined
  }
}

function formatter(value) {
  return value ? value.toString() : ''
}

// Range date value.
function normalizeRange(value) {
  if (!Array.isArray(value)) return undefined

  const [start, end] = value

  const startValue = parser(start ?? '')
  const endValue = parser(end ?? '')

  if (!startValue && !endValue) return undefined

  return { start: startValue, end: endValue }
}

function toRangeModel(value) {
  return [formatter(value?.start), formatter(value?.end)]
}

// Model.
const modelValue = defineModel({
  type: [Array, String],
  default: undefined
})

const model = computed({
  get() {
    if (props.range) {
      return normalizeRange(modelValue.value)
    }

    return parser(modelValue.value)
  },

  set(value) {
    modelValue.value = props.range
      ? toRangeModel(value)
      : formatter(value)
  }
})
</script>
