<template>
  <UModal
    v-model:open="open"
    class="min-w-1/2"
    :close="!isImporting"
    :description="t('listImport.description')"
    :dismissible="!isImporting"
    :title="t('listImport.title')"
    :ui="{ footer: 'flex gap-2' }"
    @after:leave="resetFile"
  >
    <template #body>
      <UStepper
        v-model="step"
        :items="steps"
        orientation="vertical"
        :ui="{ header: 'min-w-50' }"
      >
        <template #content="{ item }">
          <div
            v-if="item.value === 'upload'"
            class="space-y-4"
          >
            <UAlert
              :actions="templateActions"
              :avatar="{ icon: 'i-tabler-file-spreadsheet' }"
              color="neutral"
              :description="t('listImport.template.description')"
              orientation="horizontal"
              :title="t('listImport.template.title')"
              variant="soft"
            />

            <USeparator :label="t('or')" />

            <UFileUpload
              v-model="file"
              accept=".csv,.xlsx"
              class="min-h-48 w-full"
              :description="t('listImport.upload.description')"
              file-delete-icon="i-tabler-trash"
              :label="t('listImport.upload.label')"
              layout="list"
            />
          </div>

          <div
            v-else-if="item.value === 'review'"
            class="space-y-4"
          >
            <div class="flex items-center gap-2">
              <UAvatar
                color="neutral"
                icon="i-tabler-file"
                size="md"
                variant="soft"
              />

              <div>
                <h3 class="text-sm font-medium">
                  {{ file.name }}
                </h3>

                <div class="text-xs text-dimmed">
                  {{ t('listImport.review.totalRows', { count: rows.length }) }}
                </div>
              </div>

              <UButton
                class="ml-auto"
                color="neutral"
                icon="i-tabler-trash"
                variant="link"
                @click="resetFile"
              />
            </div>

            <USeparator />

            <div
              v-if="canImport"
              class="overflow-hidden rounded-lg border border-default"
            >
              <table class="w-full overflow-x-auto text-xs">
                <thead class="bg-muted">
                  <tr class="text-left font-medium text-muted">
                    <th class="px-3 py-2.5">
                      #
                    </th>

                    <th
                      v-for="header in headers"
                      :key="header"
                      class="px-3 py-2.5"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-default">
                  <tr
                    v-for="(row, index) in previewRows"
                    :key="index"
                    class="hover:bg-muted/25"
                  >
                    <td class="px-3 py-2.5 text-dimmed">
                      {{ index + 1 }}
                    </td>

                    <td
                      v-for="header in headers"
                      :key="header"
                      class="px-3 py-2.5"
                    >
                      {{ row[header] }}
                    </td>
                  </tr>

                  <tr v-if="rows.length > previewRows.length">
                    <td
                      class="px-3 py-2.5 text-dimmed"
                      :colspan="headers.length + 1"
                    >
                      {{ t('listImport.review.moreRows', { count: rows.length - previewRows.length }) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AlertList
              v-else
              color="error"
              :description="parseError || t('listImport.review.validationErrors')"
              icon="i-tabler-alert-triangle"
              :items="validationErrors"
              :title="t('listImport.review.errorTitle')"
              variant="subtle"
            />
          </div>

          <div
            v-else-if="item.value === 'importing'"
            class="space-y-8"
          >
            <AvatarHeader
              :color="isComplete ? 'success' : 'primary'"
              :description="t('listImport.importing.progressStatus', { current: progress.current, total: progress.total })"
              :loading="isImporting && !isComplete"
              :title="isComplete ? t('listImport.importing.importDone') : t('listImport.importing.importingData')"
            />

            <div class="mx-auto max-w-100 space-y-2">
              <UProgress :model-value="progressPercent || null" />

              <div class="flex justify-between text-xs text-dimmed">
                <span>
                  {{ t('listImport.importing.progressCount', { created: progress.created, updated: progress.updated, failed: progress.failed }) }}
                </span>

                <span>{{ progressPercent }}%</span>
              </div>
            </div>

            <AlertList
              v-if="importErrors.length > 0"
              color="warning"
              icon="i-tabler-alert-triangle"
              :items="importErrors"
              :title="t('listImport.importing.partialImport')"
              variant="subtle"
            />
          </div>
        </template>
      </UStepper>
    </template>

    <template #footer>
      <div>
        <UButton
          v-if="isStep('review')"
          color="neutral"
          icon="i-tabler-arrow-left"
          :label="t('actions.back')"
          variant="ghost"
          @click="goToStep('upload')"
        />
      </div>

      <div class="ml-auto flex flex-row gap-2">
        <UButton
          v-if="!isStep('importing')"
          color="neutral"
          :label="t('actions.cancel')"
          variant="soft"
          @click="closeModal"
        />

        <UButton
          v-if="isStep('upload')"
          :disabled="!file || isReviewing"
          :label="t('listImport.actions.review')"
          :loading="isReviewing"
          @click="startReview"
        />

        <UButton
          v-if="isStep('review')"
          :disabled="!canImport"
          icon="i-tabler-upload"
          :label="t('listImport.actions.import')"
          @click="startImport"
        />

        <UButton
          v-if="isStep('importing')"
          :disabled="isImporting"
          :label="t('actions.done')"
          @click="closeModal"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { Workbook } from '@cj-tech-master/excelts'
import { parseCsv } from '@cj-tech-master/excelts/csv'

import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../../zenstack/schema'

const { t } = useI18n()
const { notifyError, notifySuccess } = useNotify()

const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  },

  maxRows: {
    type: Number,
    default: 1000
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const emit = defineEmits([
  'imported'
])

const client = useClientQueries(schema)

const abortController = ref(null)

onUnmounted(() => {
  abortController.value?.abort()
  abortController.value = null
})

// Modal.
function closeModal() {
  open.value = false
}

// Stepper.
const step = ref('upload')

const steps = computed(() => [
  {
    title: t('listImport.steps.upload'),
    icon: 'i-tabler-file-search',
    disabled: !isStep('review'),
    value: 'upload'
  },
  {
    title: t('listImport.steps.review'),
    icon: 'i-tabler-file-check',
    disabled: true,
    value: 'review'
  },
  {
    title: t('listImport.steps.importing'),
    icon: 'i-tabler-file-upload',
    disabled: true,
    value: 'importing'
  }
])

function goToStep(value) {
  step.value = value
}

function isStep(value) {
  return step.value === value
}

// Template.
const importableKeys = computed(() => {
  const keys = []

  for (const key in props.entity.properties) {
    if (!props.entity.properties[key].nested) {
      keys.push(key)
    }
  }

  return keys
})

async function downloadTemplate() {
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Template')

  worksheet.addAOA([importableKeys.value])

  const buffer = await workbook.xlsx.writeBuffer()

  saveAsFile(
    buffer,
    t(`${props.entity?.name}.title`) + ' - Template.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
}

const templateActions = computed(() => [
  {
    color: 'neutral',
    label: t('listImport.template.download'),
    icon: 'i-tabler-download',
    size: 'md',
    variant: 'subtle',
    onClick: downloadTemplate
  }
])

// File.
const file = ref(null)

function resetFile() {
  abortController.value?.abort()
  abortController.value = null

  resetImport()
  resetReview()

  file.value = null

  goToStep('upload')
}

// Review.
const isReviewing = ref(false)
const parseError = ref(null)

const headers = ref([])
const rows = ref([])

const previewRows = computed(() =>
  rows.value.slice(0, 5)
)

function startReview() {
  isReviewing.value = true
  parseFile()
}

function finishReview() {
  isReviewing.value = false
  goToStep('review')
}

function resetReview() {
  headers.value = []
  rows.value = []
  isReviewing.value = false
  parseError.value = null
}

async function readFileData() {
  if (file.value.name.toLowerCase().endsWith('.csv')) {
    const { rows } = parseCsv(
      await file.value.text(),
      { headers: true, dynamicTyping: true }
    )

    return rows
  }

  // Workbook.
  const workbook = new Workbook()

  await workbook.xlsx.load(
    await file.value.arrayBuffer()
  )

  // Only the first sheet is processed.
  const firstSheet = workbook.worksheets[0]

  if (!firstSheet) {
    throw new Error()
  }

  return firstSheet.toJSON({ defaultValue: '' })
}

async function parseFile() {
  if (!file.value) return

  resetReview()

  try {
    const jsonData = await readFileData()

    if (jsonData.length === 0) {
      parseError.value = t('listImport.review.emptyFile')
      return
    }

    if (jsonData.length > props.maxRows) {
      parseError.value = t(
        'listImport.review.tooManyRows',
        { max: props.maxRows }
      )

      return
    }

    rows.value = jsonData
    headers.value = Object.keys(jsonData[0] || {})
    validateRows()
  }
  catch (error) {
    console.error(error)
    parseError.value = t('listImport.review.parseError')
  }
  finally {
    finishReview()
  }
}

// Validation.
const validationErrors = ref([])

const canImport = computed(() =>
  !parseError.value && validationErrors.value.length === 0
)

function validateRows() {
  validationErrors.value = []

  if (!props.entity.schema) return

  for (const index in rows.value) {
    const value = rows.value[index]
    const result = props.entity.schema.safeParse(value)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path?.join('.') || ''
        const row = Number(index) + 2

        validationErrors.value.push(t(
          'listImport.review.rowError',
          { row, field, message: issue.message }
        ))
      }
    }
  }
}

// Import.
const isImporting = ref(false)
const isComplete = ref(false)
const importErrors = ref([])

const initialProgress = () => ({
  current: 0,
  total: 0,
  created: 0,
  updated: 0,
  failed: 0
})

const progress = ref(initialProgress())

const mutationOptions = { invalidateQueries: false }
const createMutation = client[props.entity.name]?.useCreate(mutationOptions)
const updateMutation = client[props.entity.name]?.useUpdate(mutationOptions)

const progressPercent = computed(() => {
  if (progress.value.total === 0) return 0

  return Math.round(
    (progress.value.current / progress.value.total) * 100
  )
})

function resetImport() {
  isImporting.value = false
  isComplete.value = false
  importErrors.value = []
  progress.value = { ...initialProgress(), total: rows.value.length }
}

function startImport() {
  goToStep('importing')
  importData()
}

async function importData() {
  if (!canImport.value) return

  resetImport()

  if (!createMutation || !updateMutation) {
    importErrors.value.push(
      t('listImport.importing.entityNotFound', { name: props.entity.name })
    )

    isComplete.value = true
    return
  }

  isImporting.value = true
  abortController.value = new AbortController()

  const allowedFields = importableKeys.value

  for (const index in rows.value) {
    if (abortController.value.signal.aborted) break

    const row = rows.value[index]
    const rowNumber = Number(index) + 2

    const parsed = props.entity.schema.safeParse(row)
    const coercedRow = parsed.success ? { ...row, ...parsed.data } : row

    const sanitizedData = {}

    for (const field of allowedFields) {
      if (!(field in row)) continue

      const value = coercedRow[field]
      const isEmpty = value === '' || value === null || value === undefined

      sanitizedData[field] = isEmpty ? null : value
    }

    try {
      const hasId = row.id && String(row.id).trim() !== ''

      if (hasId) {
        await updateMutation.mutateAsync({
          where: { id: row.id },
          data: sanitizedData
        })

        progress.value.updated++
      }
      else {
        await createMutation.mutateAsync({ data: sanitizedData })
        progress.value.created++
      }
    }
    catch (error) {
      progress.value.failed++

      importErrors.value.push(
        t('listImport.importing.rowError', {
          row: rowNumber,
          message: error.message
        })
      )
    }

    progress.value.current++
  }

  isImporting.value = false
  isComplete.value = true

  if (progress.value.created > 0 || progress.value.updated > 0) {
    emit('imported')
  }

  if (importErrors.value.length === 0) {
    return notifySuccess({
      title: t('listImport.importing.success', {
        created: progress.value.created,
        updated: progress.value.updated
      })
    })
  }

  return notifyError({
    title: t('listImport.importing.partialSuccess', {
      success: progress.value.created + progress.value.updated,
      failed: progress.value.failed
    })
  })
}
</script>
