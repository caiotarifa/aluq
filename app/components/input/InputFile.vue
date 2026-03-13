<template>
  <div class="flex flex-col gap-2">
    <UFileUpload
      v-if="showDropzone"
      :key="uploadKey"
      :accept="accept"
      :description="t('inputFile.description')"
      :label="t('inputFile.selectFile')"
      layout="list"
      :multiple="multiple"
      position="outside"
      :preview="false"
      @update:model-value="onFileSelected"
    />

    <DisplayFile
      :actions="getFileActions"
      :model-value="displayFiles"
    />

    <p
      v-if="error"
      class="mt-1 text-xs text-error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  accept: {
    type: String,
    default: '*'
  },

  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10 MB.
  },

  multiple: {
    type: Boolean,
    default: false
  }
})

const model = defineModel({
  type: [Object, Array],
  default: null
})

const { t } = useI18n()

const error = ref('')

const uploadKey = ref(0)
const uploads = ref([])

const savedFiles = computed(() => {
  if (props.multiple) {
    return model.value || []
  }

  return model.value ? [model.value] : []
})

const showDropzone = computed(() => (
  props.multiple || (!savedFiles.value.length && !uploads.value.length)
))

const displayFiles = computed(() => {
  const items = []

  for (const file of savedFiles.value) {
    items.push({
      key: file.pathname,
      pathname: file.pathname,
      name: file.originalName,
      size: file.size,
      contentType: file.contentType
    })
  }

  for (const entry of uploads.value) {
    items.push({
      key: entry.key,
      name: entry.file.name,
      size: entry.file.size,
      contentType: entry.file.type,
      previewUrl: entry.objectUrl,
      error: entry.error,
      progress: entry.error ? undefined : entry.progress
    })
  }

  return items
})

onBeforeUnmount(() => {
  for (const entry of uploads.value) {
    entry.xhr.abort()

    if (entry.objectUrl) {
      URL.revokeObjectURL(entry.objectUrl)
    }
  }
})

function revokeObjectUrl(objectUrl) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
}

function getUploadIndex(key) {
  return uploads.value.findIndex(upload => upload.key === key)
}

function getFileActions(file, index) {
  if (file.error) {
    return [{
      icon: 'i-tabler-refresh',
      onClick: () => retryUpload(index)
    }]
  }

  return [{
    icon: 'i-tabler-trash',
    onClick: () => removeFile(index)
  }]
}

function onFileSelected(value) {
  error.value = ''

  const files = [value].flat().filter(Boolean)

  for (const file of files) {
    if (file.size > props.maxSize) {
      error.value = t('inputFile.fileTooLarge', {
        max: formatBytes(props.maxSize)
      })

      continue
    }

    startUpload(file)
  }

  uploadKey.value++
}

function startUpload(file) {
  const key = crypto.randomUUID()
  const xhr = new XMLHttpRequest()

  const formData = new FormData()
  formData.append('file', file)

  uploads.value.push({
    key,
    file,
    progress: 0,
    error: false,
    xhr,
    objectUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
  })

  xhr.upload.addEventListener('progress', (event) => {
    if (!event.lengthComputable) return

    updateUpload(key, {
      progress: Math.round((event.loaded / event.total) * 100)
    })
  })

  xhr.addEventListener('load', () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      console.error('Upload failed:', xhr.responseText)
      setUploadError(key)
      return
    }

    let result

    try {
      result = JSON.parse(xhr.responseText)
    }
    catch {
      setUploadError(key)
      return
    }

    addToModel(result)
    cleanupUpload(key)
  })

  xhr.addEventListener('error', () => {
    console.error('Upload error:', xhr.responseText)
    setUploadError(key)
  })

  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}

function updateUpload(key, changes) {
  const index = getUploadIndex(key)

  if (index < 0) return

  uploads.value.splice(index, 1, {
    ...uploads.value[index],
    ...changes
  })
}

function cleanupUpload(key) {
  const index = getUploadIndex(key)

  if (index < 0) return

  const [entry] = uploads.value.splice(index, 1)
  revokeObjectUrl(entry.objectUrl)
}

function addToModel(result) {
  if (!props.multiple) {
    model.value = result
    return
  }

  model.value = [...(model.value || []), result]
}

function setUploadError(key) {
  updateUpload(key, { error: true })
  error.value = t('inputFile.uploadError')
}

function retryUpload(index) {
  const entry = uploads.value[index - savedFiles.value.length]

  if (!entry) return

  error.value = ''

  cleanupUpload(entry.key)
  startUpload(entry.file)
}

async function removeFile(index) {
  error.value = ''

  if (index >= savedFiles.value.length) {
    const entry = uploads.value[index - savedFiles.value.length]

    if (!entry) return

    entry.xhr.abort()
    cleanupUpload(entry.key)

    return
  }

  const file = savedFiles.value[index]

  if (!file?.pathname) return

  try {
    await $fetch('/api/upload', {
      method: 'DELETE',
      query: { pathname: file.pathname }
    })
  }
  catch {
    // Silently fail.
  }

  if (!props.multiple) {
    model.value = null
    return
  }

  model.value.splice(index, 1)
}
</script>
