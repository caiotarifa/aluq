<template>
  <UFieldGroup>
    <UInputDate
      ref="inputDate"
      v-bind="$attrs"
      v-model="dateModel"
    />

    <UInputTime
      v-model="timeModel"
    />

    <UPopover :reference="inputDate?.inputsRef[3]?.$el">
      <UButton
        class="px-2.5 text-muted"
        color="neutral"
        icon="i-tabler-calendar"
        size="xs"
        variant="subtle"
      />

      <template #content>
        <UCalendar
          v-model="calendarModel"
          class="p-2"
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

const inputDate = useTemplateRef('inputDate')

// Model.
const modelValue = defineModel({
  type: String,
  default: undefined
})

function splitDateTime(isoString) {
  if (!isoString) return { date: '', time: '' }

  const [date, timeWithOffset] = isoString.split('T')
  const time = timeWithOffset?.split(/[+-Z]/)[0] || ''

  return { date, time }
}

function combineDateTime(date, time) {
  if (!date) return ''
  if (!time) return date

  return `${date}T${time}`
}

const dateModel = computed({
  get() {
    return splitDateTime(modelValue.value).date
  },

  set(value) {
    const { time } = splitDateTime(modelValue.value)
    modelValue.value = combineDateTime(value, time)
  }
})

const timeModel = computed({
  get() {
    return splitDateTime(modelValue.value).time
  },

  set(value) {
    const { date } = splitDateTime(modelValue.value)
    modelValue.value = combineDateTime(date, value)
  }
})

const calendarModel = computed({
  get() {
    const { date } = splitDateTime(modelValue.value)

    try {
      return date ? parseDate(date) : undefined
    }

    catch {
      return undefined
    }
  },

  set(value) {
    const dateString = value ? value.toString() : ''
    const { time } = splitDateTime(modelValue.value)

    modelValue.value = combineDateTime(dateString, time)
  }
})
</script>
