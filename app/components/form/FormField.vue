<template>
  <UFormField
    :label="property.label"
    :name="name"
  >
    <USkeleton
      v-if="loading"
      class="h-8 w-full"
    />

    <component
      :is="activeComponent"
      v-else
      v-model="model"
      class="w-full"
      v-bind="activeProps"
    />
  </UFormField>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },

  name: {
    type: String,
    required: true
  },

  property: {
    type: Object,
    required: true
  },

  readonly: {
    type: Boolean,
    default: false
  }
})

const model = defineModel({
  type: [String, Number, Boolean, Object, Array],
  default: null
})

// Component resolvers.
const { resolve: resolveInput } = useInput()
const { resolve: resolveDisplay } = useDisplay()

const inputConfig = computed(() => {
  const { resolveInput, propertyType } = props.property
  const resolver = resolveInput || propertyType?.resolveInput

  if (typeof resolver === 'function') {
    return resolver(props.property)
  }

  return { component: 'UInput', props: {} }
})

const displayConfig = computed(() => {
  const { resolveDisplay, propertyType } = props.property
  const resolver = resolveDisplay || propertyType?.resolveDisplay

  if (typeof resolver === 'function') {
    return resolver(props.property)
  }

  return { component: 'DisplayText', props: {} }
})

const activeComponent = computed(() =>
  props.readonly
    ? resolveDisplay(displayConfig.value)
    : resolveInput(inputConfig.value)
)

const activeProps = computed(() =>
  (props.readonly ? displayConfig.value.props : inputConfig.value.props) || {}
)
</script>
