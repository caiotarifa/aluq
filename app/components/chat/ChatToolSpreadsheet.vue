<template>
  <DisplayFile
    v-if="invocation.state === 'output-available'"
    :actions="fileActions"
    class="my-8"
    :model-value="syntheticFile"
  />
</template>

<script setup>
import { Workbook } from '@cj-tech-master/excelts'
import { formatCsv } from '@cj-tech-master/excelts/csv'

const props = defineProps({
  invocation: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const { notifyError } = useNotify()

const filename = computed(() =>
  props.invocation.output?.filename ?? 'data'
)

const format = computed(() =>
  props.invocation.output?.format ?? 'xlsx'
)

const columns = computed(() =>
  props.invocation.output?.columns ?? []
)

const data = computed(() =>
  props.invocation.output?.data ?? []
)

const contentTypes = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

const syntheticFile = computed(() => ({
  name: `${filename.value}.${format.value}`,
  contentType: contentTypes[format.value] ?? contentTypes.xlsx,
  description: t('chatToolSpreadsheet.rows', { count: data.value.length }),
  onClick: downloadSpreadsheet
}))

const fileActions = () => [{
  icon: 'i-tabler-download',
  onClick: downloadSpreadsheet
}]

async function downloadSpreadsheet() {
  try {
    const rows = [columns.value]

    for (const rowObj of data.value) {
      rows.push(columns.value.map(col => rowObj[col] ?? ''))
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const finalFilename = `${filename.value}_${timestamp}.${format.value}`

    if (format.value === 'csv') {
      const buffer = new TextEncoder().encode(
        formatCsv(rows, { bom: true })
      )

      return saveAsFile(buffer, finalFilename, 'text/csv')
    }

    const workbook = new Workbook()
    workbook.addWorksheet('Data').addAOA(rows)

    const buffer = await workbook.xlsx.writeBuffer()

    saveAsFile(
      buffer,
      finalFilename,
      contentTypes.xlsx
    )
  }
  catch (error) {
    notifyError({
      title: t('chatToolSpreadsheet.downloadError'),
      description: error.message
    })
  }
}
</script>
