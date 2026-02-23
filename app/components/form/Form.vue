<template>
  <UForm
    :schema="entity?.schema"
    :state
    @submit="onSubmit"
  >
    <!-- Loose Fields -->
    <FormField
      v-for="field in fields"
      :key="field.property"
      v-model="state[field.property]"
      :class="field.class"
      :loading="fetching"
      :name="field.property"
      :property="entity.properties[field.property]"
      :readonly
    />

    <!-- Fieldsets -->
    <FormFieldset
      v-for="(fieldset, index) in fieldsets"
      :key="`fieldset-${index}`"
      v-model:open="openFieldsets[index]"
      :description="resolveFieldsetText(fieldset.description)"
      :icon="fieldset.icon"
      :legend="resolveFieldsetText(fieldset.name)"
      :ui="{ content: fieldset.class }"
    >
      <FormField
        v-for="field in fieldset.fields"
        :key="field.property"
        v-model="state[field.property]"
        :class="field.class"
        :loading="fetching"
        :name="field.property"
        :property="entity.properties[field.property]"
        :readonly
      />
    </FormFieldset>

    <div
      v-if="!readonly"
      class="mt-6 flex justify-end gap-3"
    >
      <slot name="actions">
        <UButton
          class="px-6"
          color="neutral"
          variant="soft"
          @click="emit('cancel')"
        >
          {{ t('actions.cancel') }}
        </UButton>

        <UButton
          class="px-6"
          :loading="saving"
          type="submit"
        >
          {{ submitLabel }}
        </UButton>
      </slot>
    </div>
  </UForm>
</template>

<script setup>
const props = defineProps({
  entity: {
    type: Object,
    required: true
  },

  fetching: {
    type: Boolean,
    default: false
  },

  fields: {
    type: Array,
    default: () => []
  },

  fieldsets: {
    type: Array,
    default: () => []
  },

  readonly: {
    type: Boolean,
    default: false
  },

  saving: {
    type: Boolean,
    default: false
  }
})

const state = defineModel('state', {
  type: Object,
  required: true
})

const emit = defineEmits([
  'cancel',
  'submit'
])

// Fieldset open state.
const openFieldsets = ref([])

watchEffect(() => {
  const nextOpenFieldsets = []

  for (const index in props.fieldsets) {
    const fieldset = props.fieldsets[index]

    const openState = openFieldsets.value[index]
    const defaultOpen = fieldset.open !== false

    nextOpenFieldsets.push(openState ?? defaultOpen)
  }

  openFieldsets.value = nextOpenFieldsets
})

// Translation.
const { t } = useI18n()

function resolveFieldsetText(textKey) {
  if (!textKey) return ''
  return t(`${props.entity.name}.fieldsets.${textKey}`)
}

// Submit label.
const submitLabel = computed(() => {
  return props.saving ? t('actions.submiting') : t('actions.submit')
})

// Submit handler.
function onSubmit(event) {
  emit('submit', event)
}
</script>
