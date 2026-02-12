<template>
  <div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
    <AvatarHeader
      color="neutral"
      :description="description"
      :icon="icon"
      :title="title"
    />

    <div v-if="action">
      <UButton v-bind="action" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  entity: {
    type: Object,
    required: true
  },

  search: {
    type: String,
    default: ''
  },

  type: {
    type: String,
    required: true,
    validator: value => ['no-records', 'no-results'].includes(value)
  }
})

const emit = defineEmits([
  'clear'
])

const { t } = useI18n()

const isNoRecords = computed(() =>
  props.type === 'no-records'
)

const icon = computed(() =>
  isNoRecords.value ? 'i-tabler-database-off' : 'i-tabler-search'
)

const entityName = computed(() =>
  props.entity?.name || ''
)

const entityItems = computed(() => {
  if (!entityName.value) return ''

  return t(`${entityName.value}.items`)
})

const entityTitle = computed(() => {
  if (!entityName.value) return ''

  return t(`${entityName.value}.title`)
})

const title = computed(() =>
  isNoRecords.value
    ? t('listEmptyState.noRecords.title', { entity: entityItems.value })
    : t('listEmptyState.noResults.title')
)

const description = computed(() => {
  if (isNoRecords.value) {
    return t('listEmptyState.noRecords.description', {
      entity: entityItems.value
    })
  }

  if (props.search) {
    return t('listEmptyState.noResults.descriptionSearch', {
      search: props.search
    })
  }

  return t('listEmptyState.noResults.description')
})

const action = computed(() => {
  if (isNoRecords.value) {
    const createAction = props.entity.actions?.[0]?.create

    if (!createAction) return null

    return {
      ...createAction,
      label: t('actions.create', [entityTitle.value])
    }
  }

  return {
    onClick: () => emit('clear'),
    color: 'neutral',
    icon: 'i-tabler-filter-off',
    label: t('listFilter.clearFilters'),
    size: 'sm',
    variant: 'soft'
  }
})
</script>
