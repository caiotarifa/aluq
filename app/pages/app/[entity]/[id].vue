<template>
  <AppPage
    :breadcrumb
    :title="pageTitle"
  >
    <Form
      v-model:state="state"
      v-bind="formConfig"
      :entity
      :fetching="isFetching"
      :saving="isSaving"
      @cancel="onCancel"
      @submit="onSubmit"
    />
  </AppPage>
</template>

<script setup>
import { camelCase } from 'es-toolkit/string'

const { t } = useI18n()
const route = useRoute()

const entityName = computed(() =>
  camelCase(singularize(route.params.entity))
)

const {
  entity,
  formConfig,
  isFetching,
  isNew,
  isSaving,
  state,

  onCancel,
  onSubmit
} = useEntityForm(entityName)

// Page title.
const pageTitle = computed(() => {
  if (!entity.value) return ''

  const entityTitle = t(`${entityName.value}.title`)

  return isNew.value
    ? t('actions.create', [entityTitle.toLowerCase()])
    : entityTitle
})

// Breadcrumb.
const breadcrumb = computed(() => {
  if (!entity.value) return []

  return [
    {
      label: t(`${entityName.value}.title`, 2),
      to: `/app/${route.params.entity}`
    },

    {
      label: pageTitle.value
    }
  ]
})
</script>
