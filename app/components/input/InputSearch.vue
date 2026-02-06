<template>
  <UInput
    ref="uInputRef"
    v-model="localModel"
    autocomplete="off"
    :icon="appConfig.ui.icons.search"
    :placeholder="placeholderText"
    variant="soft"
    @keydown.esc="$event.target.blur()"
  >
    <template #trailing>
      <UButton
        v-if="localModel.length"
        class="pr-0"
        color="neutral"
        :icon="appConfig.ui.icons.close"
        variant="link"
        @click="clear"
      />

      <template v-else-if="kbds">
        <UKbd
          v-for="kbd in kbds"
          :key="kbd"
          :value="kbd"
          variant="subtle"
        />
      </template>
    </template>
  </UInput>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core'

const props = defineProps({
  debounceTime: {
    type: Number,
    default: 1000
  },

  kbds: {
    type: [Array, Boolean],
    default: () => ['/']
  },

  placeholder: {
    type: String,
    default: ''
  }
})

// Model.
const model = defineModel({
  type: String,
  default: ''
})

const localValue = ref(model.value)

const syncModel = useDebounceFn(() => {
  model.value = localValue.value
}, props.debounceTime)

const localModel = computed({
  get: () => localValue.value,

  set: (value) => {
    localValue.value = value
    syncModel()
  }
})

const appConfig = useAppConfig()
const { t } = useI18n()

function clear() {
  localValue.value = ''
  model.value = ''
}

// Placeholder text.
const placeholderText = computed(() =>
  props.placeholder || t('inputSearch.placeholder')
)

// Shortcuts.
const uInputRef = useTemplateRef('uInputRef')

if (props.kbds) {
  defineShortcuts({
    [props.kbds.join('_')]: () => {
      uInputRef.value?.inputRef?.focus()
    }
  })
}
</script>
