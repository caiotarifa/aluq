<template>
  <UCollapsible
    v-if="props.streaming || props.text.length > 0"
    v-model:open="open"
    class="my-4 flex flex-col gap-1 sm:my-6"
  >
    <UButton
      class="group p-0"
      color="neutral"
      :label="props.streaming ? t('chat.reasoning.loading') : t('chat.reasoning.show')"
      :trailing-icon="appConfig.ui.icons.chevronDown"
      :ui="{ trailingIcon }"
      variant="link"
    />

    <template #content>
      <div
        v-for="(value, index) in paragraphs"
        :key="index"
        class="text-sm text-muted italic"
      >
        <span class="whitespace-pre-wrap">
          {{ value }}
        </span>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup>
const props = defineProps({
  streaming: {
    type: Boolean,
    default: false
  },

  text: {
    type: String,
    default: ''
  }
})

const appConfig = useAppConfig()
const { t } = useI18n()

// Opening.
const open = ref(false)

watch(() => props.streaming, (value) => {
  open.value = value
}, { immediate: true })

// Computed.
const trailingIcon = computed(() =>
  props.text.length > 0
    ? 'group-data-[state=open]:rotate-180 transition-transform duration-200'
    : 'hidden'
)

const paragraphs = computed(() =>
  props.text.split('\n').filter(Boolean)
)
</script>
