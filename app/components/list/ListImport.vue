<template>
  <UModal
    v-model:open="open"
    class="min-w-1/2"
    :description="t('listImport.description')"
    :close="!importing"
    :dismissible="!importing"
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
              accept=".csv,.xls,.xlsx,.xlsm,.xlsb,.ods"
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

            <UAlert
              v-else
              color="error"
              icon="i-tabler-alert-triangle"
              :title="t('listImport.review.errorTitle')"
              variant="subtle"
            >
              <template #description>
                {{ fileError || t('listImport.review.validationErrors') }}

                <ul
                  v-if="validationErrors.length > 0"
                  class="mt-2 space-y-1 text-xs"
                >
                  <li
                    v-for="(error, index) in validationErrors.slice(0, 5)"
                    :key="index"
                    class="flex items-start gap-2"
                  >
                    <UIcon
                      class="mt-px size-3.5 shrink-0"
                      name="i-tabler-point"
                    />
                    <span>{{ error }}</span>
                  </li>

                  <li
                    v-if="validationErrors.length > 5"
                    class="opacity-50"
                  >
                    {{ t('listImport.review.moreErrors', { count: validationErrors.length - 5 }) }}
                  </li>
                </ul>
              </template>
            </UAlert>
          </div>

          <div
            v-else-if="item.value === 'importing'"
            class="space-y-8"
          >
            <header class="text-center">
              <div class="mx-auto flex size-18 items-center justify-center rounded-full bg-primary/10">
                <UIcon
                  class="size-8 text-primary"
                  :class="importing ? 'animate-spin' : ''"
                  :name="importDone ? 'i-tabler-circle-check' : 'i-tabler-loader-2'"
                />
              </div>

              <h4 class="mt-4 text-lg font-medium">
                {{ importDone ? t('listImport.importing.importDone') : t('listImport.importing.importingData') }}
              </h4>

              <p class="mt-1 text-sm text-dimmed">
                {{ t('listImport.importing.progressStatus', { current: progress.current, total: progress.total }) }}
              </p>
            </header>

            <div class="mx-auto max-w-100 space-y-2">
              <UProgress
                :model-value="importingPercent || null"
              />

              <div class="flex justify-between text-xs text-dimmed">
                <span>
                  {{ t('listImport.importing.progressCount', { created: progress.created, updated: progress.updated, failed: progress.failed }) }}
                </span>

                <span>
                  {{ importingPercent }}%
                </span>
              </div>
            </div>

            <UAlert
              v-if="importErrors.length > 0"
              color="warning"
              icon="i-tabler-alert-triangle"
              :title="t('listImport.importing.partialImport')"
              variant="subtle"
            >
              <template #description>
                <ul class="mt-2 space-y-1 text-xs">
                  <li
                    v-for="(error, index) in importErrors.slice(0, 5)"
                    :key="index"
                    class="flex items-start gap-2"
                  >
                    <UIcon
                      class="mt-px size-3.5 shrink-0"
                      name="i-tabler-point"
                    />
                    <span>{{ error }}</span>
                  </li>

                  <li
                    v-if="importErrors.length > 5"
                    class="opacity-50"
                  >
                    {{ t('listImport.importing.moreErrors', { count: importErrors.length - 5 }) }}
                  </li>
                </ul>
              </template>
            </UAlert>

            <UAlert
              v-else-if="importDone"
              color="success"
              icon="i-tabler-circle-check"
              :title="t('listImport.importing.allImported')"
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
          :disabled="!file || reviewing"
          :label="t('listImport.actions.review')"
          :loading="reviewing"
          @click="startReview"
        />

        <UButton
          v-if="isStep('review')"
          :disabled="!canImport"
          :label="t('listImport.actions.import')"
          icon="i-tabler-upload"
          @click="startImport"
        />

        <UButton
          v-if="isStep('importing')"
          :disabled="importing"
          :label="t('actions.done')"
          @click="closeModal"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup>
import * as v from 'valibot'
import * as XLSX from 'xlsx'

import { useClientQueries } from '@zenstackhq/tanstack-query/vue'
import { schema } from '../../../zenstack/schema'

const { t } = useI18n()

const props = defineProps({
  entity: {
    type: Object,
    default: () => ({})
  }
})

const open = defineModel('open', {
  type: Boolean,
  default: false
})

function closeModal() {
  open.value = false
}

// Entity.
const entityName = computed(() =>
  props.entity?.name
)

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
function downloadTemplate() {
  const templateHeaders = Object.keys(props.entity.properties)
  const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders])
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, t(`${entityName.value}.title`) + ' - Template.xlsx')
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

// Upload.
const file = ref(null)

function resetFile() {
  resetImport()
  resetReview()

  file.value = null

  goToStep('upload')
}

// Review.
const reviewing = ref(false)

const headers = ref([])
const rows = ref([])

const fileError = ref(null)

const previewRows = computed(() =>
  rows.value.slice(0, 5)
)

function startReview() {
  reviewing.value = true
  parseFile()
}

function doneReview() {
  reviewing.value = false
  goToStep('review')
}

function resetReview() {
  headers.value = []
  rows.value = []
  reviewing.value = false
  fileError.value = null
}

function parseFile() {
  resetReview()

  const reader = new FileReader()

  reader.addEventListener('load', (event) => {
    try {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      if (jsonData.length === 0) {
        fileError.value = t('listImport.review.emptyFile')
        return
      }

      rows.value = jsonData
      headers.value = Object.keys(jsonData[0] || {})

      validateRows()
    }
    catch {
      fileError.value = t('listImport.review.parseError')
    }
    finally {
      doneReview()
    }
  })

  reader.addEventListener('error', () => {
    fileError.value = t('listImport.review.readError')
    doneReview()
  })

  reader.readAsArrayBuffer(file.value)
}

// Validation.
const validationErrors = ref([])

function validateRows() {
  validationErrors.value = []

  if (!props.entity.schema) return

  for (const index in rows.value) {
    const value = rows.value[index]
    const result = v.safeParse(props.entity.schema, value)

    if (!result.success) {
      for (const issue of result.issues) {
        const field = issue.path?.map(p => p.key).join('.') || ''
        const row = Number(index) + 2

        validationErrors.value.push(t(
          'listImport.review.rowError',
          { row, field, message: issue.message }
        ))
      }
    }
  }
}

const canImport = computed(() =>
  !fileError.value && validationErrors.value.length === 0
)

// Importing.
const importing = ref(false)

const progress = ref({
  current: 0,
  total: 0,
  created: 0,
  updated: 0,
  failed: 0
})

const importingPercent = computed(() => {
  if (progress.value.total === 0) return 0

  return Math.round(
    (progress.value.current / progress.value.total) * 100
  )
})

// Import.
const importDone = ref(false)
const importErrors = ref([])

const client = useClientQueries(schema)

const createMutation = client[props.entity.name]?.useCreate()
const updateMutation = client[props.entity.name]?.useUpdate()

function resetImport() {
  importing.value = false

  progress.value = {
    current: 0,
    total: rows.value.length,
    created: 0,
    updated: 0,
    failed: 0
  }

  importDone.value = false
  importErrors.value = []
}

async function importData() {
  if (!canImport.value) return

  // Reset import state.
  resetImport()

  // Check mutations.
  if (!createMutation || !updateMutation) {
    importErrors.value.push(
      t('listImport.importing.entityNotFound', { name: props.entity.name })
    )

    importing.value = false
    importDone.value = true

    return
  }

  // Handle import.
  for (const index in rows.value) {
    const row = rows.value[index]
    const rowNumber = Number(index) + 2

    try {
      const hasId = row.id && String(row.id).trim() !== ''

      if (hasId) {
        await updateMutation.mutateAsync({
          where: { id: row.id },
          data: row
        })

        progress.value.updated++
      }
      else {
        await createMutation.mutateAsync({ data: row })
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

  importing.value = false
  importDone.value = true

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

function startImport() {
  goToStep('importing')
  importData()
}
</script>
