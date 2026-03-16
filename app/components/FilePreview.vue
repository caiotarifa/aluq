<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :description="file?.size && formatBytes(file.size)"
    :title="file?.name"
    :ui="{
      content: 'sm:max-w-5xl sm:h-[calc(100dvh-4rem)]',
      body: 'p-0 sm:p-0 md:p-0 lg:p-0',
      footer: 'justify-between',
      wrapper: 'flex gap-3'
    }"
  >
    <template #body>
      <div
        v-if="isImage"
        class="flex h-full items-center justify-center overflow-hidden"
      >
        <NuxtImg
          v-panzoom
          class="max-h-full max-w-full object-contain"
          :src="file.url"
        />
      </div>

      <iframe
        v-else-if="isIframe"
        class="size-full border-0"
        :src="file.url"
      />

      <div
        v-else
        class="flex items-center justify-center p-8 text-sm text-dimmed"
      >
        {{ t('filePreview.notSupported') }}
      </div>
    </template>

    <template #footer>
      <div class="space-x-2">
        <UButton
          color="neutral"
          icon="i-tabler-download"
          :label="t('filePreview.download')"
          variant="link"
          @click="downloadFile"
        />

        <UButton
          color="neutral"
          icon="i-tabler-share"
          :label="t('filePreview.share')"
          variant="link"
          @click="shareFile"
        />
      </div>

      <div
        v-if="isImage"
        class="flex items-center space-x-2"
      >
        <UButton
          color="neutral"
          :disabled="scale <= minScale"
          icon="i-tabler-zoom-out"
          size="sm"
          variant="ghost"
          @click="zoomOut"
        />

        <USlider
          class="w-32"
          :max="maxScale * 100"
          :min="minScale * 100"
          :model-value="scale * 100"
          :step="1"
          @update:model-value="handleSliderZoom"
        />

        <UButton
          color="neutral"
          :disabled="scale >= maxScale"
          icon="i-tabler-zoom-in"
          size="sm"
          variant="ghost"
          @click="zoomIn"
        />

        <UButton
          color="neutral"
          icon="i-tabler-zoom-reset"
          size="sm"
          variant="ghost"
          @click="handleReset"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
import Panzoom from '@panzoom/panzoom'

const props = defineProps({
  file: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close'
])

const { t } = useI18n()

// Preview logic.
const isImage = computed(() =>
  props.file?.contentType?.startsWith('image/')
)

const isIframe = computed(() =>
  props.file?.contentType?.includes('pdf')
)

// Pan & Zoom controls (image only).
const minScale = 1
const maxScale = 10

const scale = ref(minScale)

const panzoom = { instance: null, wheelHandler: null }

const vPanzoom = {
  mounted(el) {
    panzoom.instance = Panzoom(el, { maxScale, minScale, step: 0.1 })
    panzoom.wheelHandler = panzoom.instance.zoomWithWheel

    el.parentElement.addEventListener('wheel', panzoom.wheelHandler)
    el.addEventListener('panzoomzoom', ({ detail }) => {
      scale.value = detail.scale
    })
  },

  beforeUnmount(el) {
    el.parentElement?.removeEventListener('wheel', panzoom.wheelHandler)
    panzoom.instance?.destroy()
  }
}

function zoomIn() {
  panzoom.instance?.zoomIn()
}

function zoomOut() {
  panzoom.instance?.zoomOut()
}

function handleSliderZoom(value) {
  panzoom.instance?.zoom(value / 100)
}

function handleReset() {
  panzoom.instance?.reset()
  scale.value = minScale
}

// Download and share.
const { notifyError } = useNotify()

async function downloadFile() {
  try {
    const response = await fetch(props.file.url)
    const blob = await response.blob()

    const link = document.createElement('a')

    link.href = URL.createObjectURL(blob)
    link.download = props.file.name || 'download'
    link.click()

    URL.revokeObjectURL(link.href)
  }

  catch {
    notifyError({
      title: t('filePreview.downloadFailed')
    })
  }
}

async function shareFile() {
  const response = await fetch(props.file.url)
  const blob = await response.blob()

  const file = new File(
    [blob],
    props.file.name || 'file',
    { type: props.file.contentType }
  )

  await navigator.share({ files: [file] }).catch(() => {})
}
</script>
