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
      <UAvatar
        :as="{ img: 'img' }"
        class="shrink-0 rounded-md"
        :icon="getFileIcon(file.contentType)"
        :src="file.previewUrl"
      />

      <div class="flex min-w-0 flex-1 flex-col">
        <component
          :is="file.url ? 'a' : 'div'"
          class="truncate text-default"
          v-bind="file.url ? { href: file.url, target: '_blank' } : {}"
        >
          {{ file.name }}
        </component>

        <div class="truncate text-muted">
          {{ formatBytes(file.size) }}
        </div>
      </div>

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
      file.url = `/api/upload?pathname=${encodeURIComponent(item.pathname)}`
    }

    if (
      !file.previewUrl
      && item.contentType?.startsWith('image/')
      && item.pathname
    ) {
      file.previewUrl = file.url
    }

    result.push(file)
  }

  return result
})

function fileActions(file, index) {
  return props.actions?.(file, index) || []
}

function getFileIcon(contentType) {
  const type = contentType || ''

  if (type.startsWith('image/')) return 'i-tabler-photo'
  if (type.includes('pdf')) return 'i-tabler-file-type-pdf'

  if (/excel|spreadsheet/.test(type)) {
    return 'i-tabler-file-type-xls'
  }

  if (/word|document/.test(type)) {
    return 'i-tabler-file-type-doc'
  }

  return 'i-tabler-file'
}
</script>
