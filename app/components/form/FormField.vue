<template>
  <UFormField
    :label="property.label"
    :name="name"
  >
    <component
      :is="inputComponent"
      v-model="model"
      class="w-full"
      v-bind="inputProps"
    />
  </UFormField>
</template>

<script setup>
import {
  UInput,
  UCheckbox,
  USelect,
  UTextarea,
  InputBoolean,
  InputDate,
  InputDateTime,
  InputTime
} from '#components'

const props = defineProps({
  name: {
    type: String,
    required: true
  },

  property: {
    type: Object,
    required: true
  }
})

const model = defineModel({
  type: [String, Number, Boolean, Object, Array],
  default: null
})

// Component map.
const componentMap = {
  UInput,
  UCheckbox,
  USelect,
  UTextarea,
  InputBoolean,
  InputDate,
  InputDateTime,
  InputTime
}

// Resolvers.
const inputConfig = computed(() => {
  const { resolveInput, propertyType } = props.property
  const resolver = resolveInput || propertyType?.resolveInput

  if (typeof resolver === 'function') {
    return resolver(props.property)
  }

  return {
    component: 'UInput',
    props: {}
  }
})

const inputComponent = computed(() => {
  const { component, componentName } = inputConfig.value
  const name = component || componentName || 'UInput'

  if (componentMap[name]) {
    return componentMap[name]
  }

  console.warn(`[FormField] Component "${name}" not found, using UInput.`)
  return UInput
})

const inputProps = computed(() =>
  inputConfig.value.props || {}
)
</script>
