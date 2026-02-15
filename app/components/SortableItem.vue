<template>
  <div
    ref="element"
    v-bind="$attrs"
  >
    <slot :drag="setHandle" />
  </div>
</template>

<script setup>
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { RestrictToElement } from '@dnd-kit/dom/modifiers'
import { useSortable } from '@dnd-kit/vue/sortable'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },

  id: {
    type: [String, Number],
    required: true
  },

  index: {
    type: Number,
    required: true
  }
})

const elementRef = useTemplateRef('element')
const handleRef = ref(null)

function setHandle(element) {
  handleRef.value = element?.$el || element
}

useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  disabled: computed(() => props.disabled),
  element: elementRef,
  handle: handleRef,

  modifiers: [
    RestrictToVerticalAxis,

    RestrictToElement.configure({
      element: () => elementRef.value?.parentElement
    })
  ]
})
</script>
