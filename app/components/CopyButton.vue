<template>
  <UTooltip
    arrow
    :content="{ side: 'top' }"
    :delay-duration="0"
    disable-closing-trigger
    :text="t(`copyButton.${copied ? 'copied' : 'copy'}`)"
  >
    <UButton
      class="align-bottom ml-1.5 p-0.5"
      :class="{ 'opacity-50': !copied }"
      :color="copied ? 'primary' : 'neutral'"
      variant="link"
      @click="copy(text)"
    >
      <template #trailing>
        <UIcon :name="copied ? 'i-tabler-copy-check' : 'i-tabler-copy'" />
      </template>
    </UButton>
  </UTooltip>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const { copy, copied } = useClipboard({
  legacy: true,
  source: props.text
})
</script>
