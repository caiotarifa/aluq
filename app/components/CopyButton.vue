<template>
  <UTooltip
    arrow
    :content="{ side: 'top' }"
    :delay-duration="0"
    disable-closing-trigger
    :text="t(`copyButton.${copied ? 'copied' : 'copy'}`)"
  >
    <UButton
      class="align-bottom"
      :class="{
        'ml-1.5 p-0.5': compact,
        'px-2.5': !compact,
        'opacity-50': !copied
      }"
      :color="copied ? 'primary' : 'neutral'"
      variant="link"
      v-bind="button"
      @click="copy(text)"
    >
      <template #leading>
        <UIcon
          :name="copied ? 'i-tabler-copy-check' : 'i-tabler-copy'"
          v-bind="icon"
        />
      </template>
    </UButton>
  </UTooltip>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  button: {
    type: Object,
    default: () => ({})
  },

  compact: {
    type: Boolean,
    default: true
  },

  icon: {
    type: Object,
    default: () => ({})
  },

  text: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const { copy, copied } = useClipboard({
  source: props.text
})
</script>
