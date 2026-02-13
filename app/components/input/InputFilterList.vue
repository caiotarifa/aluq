<template>
  <div class="space-y-2">
    <UInput
      v-model="inputValue"
      autofocus
      :placeholder="t('listFilter.typedValue')"
      size="sm"
      :type="type === 'number' ? 'number' : 'text'"
      variant="soft"
      @keydown.enter.prevent="addValue"
    />

    <div
      v-if="model.length"
      class="flex flex-wrap gap-1"
    >
      <UBadge
        v-for="(item, index) in model"
        :key="index"
        color="primary"
        size="sm"
        variant="subtle"
      >
        {{ item }}

        <UButton
          class="-mr-1 text-primary"
          color="primary"
          :icon="appConfig.ui.icons.close"
          :padded="false"
          size="2xs"
          variant="link"
          @click="removeValue(index)"
        />
      </UBadge>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  field: {
    type: Object,
    default: () => ({})
  },

  operator: {
    type: String,
    default: 'in'
  },

  type: {
    type: String,
    default: 'text'
  }
})

const appConfig = useAppConfig()
const { t } = useI18n()

const model = defineModel({
  type: Array,
  default: () => []
})

const inputValue = ref('')

function addValue() {
  const raw = inputValue.value.trim()
  if (!raw) return

  const value = props.type === 'number'
    ? Number(raw)
    : raw

  if (props.type === 'number' && Number.isNaN(value)) return
  if (model.value.includes(value)) return

  model.value = [...model.value, value]
  inputValue.value = ''
}

function removeValue(index) {
  model.value = model.value.filter((_, i) => i !== index)
}
</script>
