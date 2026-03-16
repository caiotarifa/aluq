<template>
  <UModal
    v-model:open="open"
    :close="!isExporting"
    :description="t('listExport.description')"
    :dismissible="!isExporting"
    :title="t('listExport.title')"
    :ui="{ footer: 'justify-end' }"
    @after:leave="resetExport"
  >
    <template #body>
      <div
        v-if="!isExporting"
        class="space-y-6"
      >
        <UFormField>
          <URadioGroup
            v-model="source"
            :items="sourceOptions"
            variant="table"
          />
        </UFormField>

        <UFormField :label="t('listExport.format.label')">
          <USelect
            v-model="format"
            class="w-full"
            :items="formatOptions"
          >
            <template #default="{ modelValue }">
              {{ getFormatOption(modelValue).label }}

              <UBadge
                v-if="getFormatOption(modelValue).badge"
                color="neutral"
                :label="getFormatOption(modelValue).badge"
                size="sm"
                variant="soft"
              />
            </template>

            <template #item="{ item }">
              {{ item.label }}

              <UBadge
                v-if="item.badge"
                color="neutral"
                :label="item.badge"
                size="sm"
                variant="soft"
              />
            </template>
          </USelect>
        </UFormField>

        <UFormField :label="t('listExport.headers.label')">
          <USelect
            v-model="headers"
            class="w-full"
            :items="headersOptions"
          />
        </UFormField>
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <AvatarHeader
          :color="statusColor"
          :description="t('listExport.exporting.progressStatus', {
            current: progress.current,
            total: progress.total
          })"
          :icon="statusIcon"
          :loading="!isComplete && !isCancelled"
          :title="statusTitle"
        />

        <div class="mx-auto max-w-100 space-y-2">
          <UProgress :model-value="progressPercent || null" />

          <div class="flex justify-center text-xs text-dimmed">
            <span>{{ progressPercent }}%</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        v-if="!isExporting"
        color="neutral"
        :label="t('actions.cancel')"
        variant="soft"
        @click="closeModal"
      />

      <UButton
        v-if="!isExporting"
        icon="i-tabler-download"
        :label="t('listExport.actions.export')"
        @click="startExport"
      />

      <UButton
        v-if="isExporting && !isComplete && !isCancelled"
        color="error"
        :label="t('actions.cancel')"
        variant="soft"
        @click="cancelExport"
      />

      <UButton
        v-if="isExporting && (isComplete || isCancelled)"
        :label="t('actions.done')"
        @click="closeModal"
      />
    </template>
  </UModal>
</template>

<script setup>
import { Workbook } from '@cj-tech-master/excelts'
import { formatCsv } from '@cj-tech-master/excelts/csv'

const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  },

  items: {
    type: Array,
    default: () => []
  },

  pageSize: {
    type: Number,
    default: 100
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const { t } = useI18n()
const { notifyError, notifySuccess } = useNotify()

// Exportable keys.
const exportableKeys = computed(() => {
  const keys = []

  for (const key in props.entity.properties) {
    if (key.endsWith('.id')) continue
    keys.push(key)
  }

  return keys
})

// Export state.
const isExporting = ref(false)
const source = ref('current')

// Remote list for paginated export.
const exportQuery = ref({
  page: 1,
  size: props.pageSize
})

const createRemote = composable => composable(
  () => props.entity.name,

  computed(() => ({
    ...exportQuery.value,
    properties: exportableKeys.value
  })),

  () => ({
    enabled: isExporting.value && source.value === 'all'
  })
)

const list = createRemote(useRemoteList)
const count = createRemote(useRemoteCount)

// Modal.
function closeModal() {
  open.value = false
}

const sourceOptions = computed(() => [
  {
    value: 'current',
    label: t('listExport.source.current'),
    description: t('listExport.source.currentDescription', {
      count: props.items.length
    })
  },
  {
    value: 'all',
    label: t('listExport.source.all'),
    description: t('listExport.source.allDescription')
  }
])

// Format options.
const format = ref('xlsx')

const formatOptions = [
  { value: 'xlsx', label: 'Microsoft Excel', badge: '.xlsx' },
  { value: 'csv', label: 'Comma-Separated Values', badge: '.csv' }
]

function getFormatOption(value) {
  return formatOptions.find(option => option.value === value)
}

// Headers options.
const headers = ref('translated')

const headersOptions = computed(() => [
  {
    value: 'translated',
    label: t('listExport.headers.translated')
  },
  {
    value: 'keys',
    label: t('listExport.headers.keys')
  }
])

// Export state (continued).
const isComplete = ref(false)
const isCancelled = ref(false)

const progress = ref({ current: 0, total: 0 })

const progressPercent = computed(() => {
  if (progress.value.total === 0) {
    return 0
  }

  return Math.round(
    (progress.value.current / progress.value.total) * 100
  )
})

const statusColor = computed(() => {
  if (isCancelled.value) {
    return 'warning'
  }

  if (isComplete.value) {
    return 'success'
  }

  return 'primary'
})

const statusIcon = computed(() => {
  if (isCancelled.value) {
    return 'i-tabler-circle-x'
  }

  return 'i-tabler-circle-check'
})

const statusTitle = computed(() => {
  if (isCancelled.value) {
    return t('listExport.exporting.exportCancelled')
  }

  if (isComplete.value) {
    return t('listExport.exporting.exportDone')
  }

  return t('listExport.exporting.exportingData')
})

function resetExport() {
  isExporting.value = false
  isComplete.value = false
  isCancelled.value = false
  exportQuery.value = { page: 1, size: props.pageSize }
  progress.value = { current: 0, total: 0 }
  source.value = 'current'
  format.value = 'xlsx'
  headers.value = 'translated'
}

function cancelExport() {
  isCancelled.value = true

  notifyError({
    title: t('listExport.exporting.cancelled', {
      count: progress.value.current
    })
  })
}

async function startExport() {
  isExporting.value = true

  const data = source.value === 'current'
    ? exportCurrentView()
    : await exportAllData()

  if (isCancelled.value) return

  await downloadFile(data)
  isComplete.value = true

  notifySuccess({
    title: t('listExport.exporting.success', { count: data.length })
  })
}

function exportCurrentView() {
  progress.value.total = props.items.length

  const data = []

  for (const item of props.items) {
    data.push(formatRow(item))
    progress.value.current++
  }

  return data
}

async function exportAllData() {
  await count.refetch()
  const total = count.data.value || 0

  progress.value.total = total

  const data = []
  const totalPages = Math.ceil(total / props.pageSize)

  for (let page = 1; page <= totalPages; page++) {
    if (isCancelled.value) break

    exportQuery.value = { page, size: props.pageSize }
    await list.refetch()

    const items = list.data.value || []

    for (const item of items) {
      data.push(formatRow(item))
      progress.value.current++
    }
  }

  return data
}

function resolveNestedValue(item, key) {
  if (!key.includes('.')) {
    return item[key]
  }

  const [relation, property] = key.split('.')
  const value = item[relation]

  if (Array.isArray(value)) {
    return value.map(v => v?.[property]).filter(Boolean).join(', ')
  }

  return value?.[property] ?? null
}

function resolveColumnNames() {
  const columns = {}

  for (const key of exportableKeys.value) {
    const property = props.entity.properties[key]

    columns[key] = headers.value === 'translated'
      ? (property?.label || key)
      : key
  }

  return columns
}

function formatRow(item) {
  const row = {}
  const columns = resolveColumnNames()

  for (const key in columns) {
    row[columns[key]] = resolveNestedValue(item, key) ?? ''
  }

  return row
}

async function downloadFile(data) {
  const columns = resolveColumnNames()
  const columnNames = Object.values(columns)
  const rows = [columnNames]

  for (const row of data) {
    rows.push(columnNames.map(col => row[col] ?? ''))
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

  const title = t(`${props.entity.name}.title`) || props.entity.name
  const fileName = `${title}_${timestamp}.${format.value}`

  if (format.value === 'csv') {
    const buffer = new TextEncoder().encode(
      formatCsv(rows, { bom: true })
    )

    return saveAsFile(buffer, fileName, 'text/csv')
  }

  const workbook = new Workbook()
  workbook.addWorksheet('Data').addAOA(rows)

  const buffer = await workbook.xlsx.writeBuffer()

  saveAsFile(
    buffer,
    fileName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
}
</script>
