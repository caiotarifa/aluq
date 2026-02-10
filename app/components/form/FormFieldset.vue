<template>
  <fieldset :class="ui.root">
    <UAccordion
      v-model="open"
      :items
    >
      <div>
        <legend
          v-if="legend"
          class="text-lg font-medium text-highlighted"
        >
          {{ legend }}
        </legend>

        <div
          v-if="description"
          class="text-xs text-muted"
        >
          {{ description }}
        </div>
      </div>

      <template
        v-if="icon"
        #leading
      >
        <UIcon :name="icon" />
      </template>

      <template #content>
        <div :class="ui.content">
          <slot />
        </div>
      </template>
    </UAccordion>
  </fieldset>
</template>

<script setup>
import { tv } from 'tailwind-variants'

const props = defineProps({
  description: {
    type: String,
    default: ''
  },

  icon: {
    type: String,
    default: ''
  },

  legend: {
    type: String,
    default: ''
  },

  ui: {
    type: Object,
    default: () => ({})
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: true,

  get: value => value ? '0' : '',

  set: (value) => {
    if (Array.isArray(value)) {
      return value.includes('0')
    }

    return value === '0'
  }
})

const fieldset = tv({
  slots: {
    root: 'rounded-lg px-4 ring ring-default',
    content: 'border-t border-default py-4'
  }
})

const items = [
  { value: '0' }
]

const ui = computed(() => {
  const { root, content } = fieldset()

  return {
    root: root({ class: props.ui?.root }),
    content: content({ class: props.ui?.content })
  }
})
</script>
