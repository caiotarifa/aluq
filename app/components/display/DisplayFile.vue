<template>
  <div
    v-if="files.length"
    class="flex flex-col gap-2"
  >
    <div
      v-for="(file, index) in files"
      :key="file.key || index"
      class="relative flex min-w-0 items-center gap-1.5 rounded-md border p-2.5 text-xs"
      :class="file.error ? 'border-error' : 'border-default'"
    >
      <component
        :is="canPreview(file) ? 'button' : file.url ? 'a' : 'div'"
        class="group flex flex-1 gap-1.5 hover:cursor-pointer"
        v-bind="canPreview(file) ? {} : file.url ? { href: file.url, download: file.name } : {}"
        @click="canPreview(file) ? openPreview(file) : undefined"
      >
        <UAvatar
          class="shrink-0 rounded-md"
          :icon="getFileIcon(file.contentType)"
          :src="file.contentType?.startsWith('image/') ? file.url : undefined"
        />

        <span class="block space-y-0.5 text-left">
          <span class="block truncate transition-colors group-hover:text-primary">
            {{ file.name }}
          </span>

          <div class="block truncate text-dimmed">
            {{ formatBytes(file.size) }}
          </div>
        </span>
      </component>

      <UButton
        v-for="action in fileActions(file, index)"
        :key="action.icon"
        color="neutral"
        :icon="action.icon"
        :loading="action.loading"
        size="sm"
        variant="link"
        @click="action.onClick"
      />

      <UProgress
        v-if="file.progress != null"
        class="absolute -bottom-px left-2.5 w-[calc(100%-1.25rem)]"
        size="2xs"
        :ui="{ base: 'bg-transparent' }"
        :value="file.progress"
      />
    </div>
  </div>

  <span
    v-else
    class="text-sm text-dimmed"
  >
    —
  </span>
</template>

<script setup>
import { LazyFilePreview } from '#components'

const props = defineProps({
  actions: {
    type: Function,
    default: null
  }
})

const model = defineModel({
  type: [Object, Array],
  default: null
})

const files = computed(() => {
  if (!model.value) return []

  const items = Array.isArray(model.value)
    ? model.value
    : [model.value]

  const result = []

  for (const item of items) {
    const file = {
      key: item.pathname,
      name: item.originalName,
      size: item.size,
      contentType: item.contentType,
      ...item
    }

    if (!file.url && item.pathname) {
      file.url = `/assets/${item.pathname}`
    }

    result.push(file)
  }

  return result
})

// Preview.
function canPreview(file) {
  if (!file.url) return false

  const type = file.contentType || ''
  return type.startsWith('image/') || type.includes('pdf')
}

const overlay = useOverlay()
const previewModal = overlay.create(LazyFilePreview)

function openPreview(file) {
  previewModal.open({ file })
}

// Actions.
function fileActions(file, index) {
  return props.actions?.(file, index) || []
}

function getFileIcon(contentType) {
  const type = contentType || ''

  if (type.startsWith('image/')) {
    return 'i-tabler-photo'
  }

  if (type.includes('pdf')) {
    return 'i-tabler-file-type-pdf'
  }

  if (/excel|spreadsheet/.test(type)) {
    return 'i-tabler-file-type-xls'
  }

  if (/word|document/.test(type)) {
    return 'i-tabler-file-type-doc'
  }

  return 'i-tabler-file'
}
</script>
