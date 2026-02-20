const excludedProperties = ['id', 'createdAt', 'updatedAt']

function isExcluded(key) {
  return excludedProperties.includes(key)
}

export function useEntityForm(entityName, id, options = {}) {
  const entityNameValue = toValue(entityName)

  const isNew = computed(() =>
    id.value === 'new'
  )

  // Composables.
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const { notifyError, notifySuccess } = useNotify()
  const { client } = useRemote()

  if (!client[entityNameValue]) {
    throw new Error(`Entity "${entityNameValue}" not found in schema`)
  }

  // Entity.
  const entity = useEntity(entityName)

  // Form configuration.
  const formConfig = computed(() => {
    const form = entity.value.form || {}

    if (form.fieldsets?.length || form.fields?.length) {
      return {
        fieldsets: form.fieldsets || [],
        fields: form.fields || []
      }
    }

    const fields = []

    for (const key in entity.value.properties) {
      if (isExcluded(key)) continue
      fields.push({ property: key })
    }

    return {
      fieldsets: [],
      fields
    }
  })

  // State.
  const state = reactive({})

  for (const key in entity.properties) {
    if (isExcluded(key)) continue

    const property = entity.properties[key]
    state[key] = property.defaultValue ?? undefined
  }

  // Data fetching.
  const { isLoading: isFetching } = useRemoteItem(
    entityName,

    computed(() =>
      isNew.value ? null : { id }
    ),

    {
      enabled: !isNew.value,

      select: (data) => {
        for (const key in data) {
          if (isExcluded(key)) continue
          state[key] = data[key]
        }
      }
    }
  )

  // Redirect.
  const redirectTo = computed(() =>
    toValue(options.redirectTo) || `/app/${route.params.entity}`
  )

  // Mutations.
  const createMutation = client[entityNameValue].useCreate()
  const updateMutation = client[entityNameValue].useUpdate()

  const isSaving = computed(() =>
    createMutation.isPending.value || updateMutation.isPending.value
  )

  function save() {
    const data = {}

    for (const field in state) {
      if (isExcluded(field)) continue

      const value = toRaw(state[field])
      data[field] = value === undefined ? null : value
    }

    if (isNew.value) {
      return createMutation.mutateAsync({ data })
    }

    return updateMutation.mutateAsync({ where: { id }, data })
  }

  // Submit handler.
  async function onSubmit() {
    if (isSaving.value) return

    const item = t(`${entityNameValue}.items`)

    try {
      await save()

      notifySuccess({
        title: t('messages.submitSuccess.title'),
        description: t('messages.submitSuccess.description', { item })
      })

      router.push(redirectTo.value)
    }

    catch {
      notifyError({
        title: t('messages.submitError.title'),
        description: t('messages.submitError.description', { item })
      })
    }
  }

  // Cancel handler.
  function onCancel() {
    router.push(redirectTo.value)
  }

  // Delete.
  const { isDeleting, deleteRecord } = useEntityDelete(entityNameValue)

  async function onDelete() {
    const confirmed = await deleteRecord(id)

    if (confirmed) {
      router.push(redirectTo.value)
    }
  }

  // Item actions.
  const itemActions = computed(() => {
    if (isNew.value || !entity.value?.itemActions?.length) return []

    const actions = []

    for (const action of entity.value.itemActions) {
      if (action.key === 'edit') continue

      const actionConfig = {
        color: action.color,
        icon: action.icon,
        label: action.label
      }

      if (action.to) {
        actionConfig.to = action.to
      }

      else {
        actionConfig.loading = action.execute === 'delete' && isDeleting.value
        actionConfig.onSelect = () => onItemAction({ action })
      }

      actions.push(actionConfig)
    }

    return actions
  })

  function onItemAction({ action }) {
    if (action.execute === 'delete') {
      return onDelete()
    }

    if (action.handler) {
      return action.handler()
    }
  }

  return {
    entity,
    formConfig,
    isDeleting,
    isFetching,
    isNew,
    isSaving,
    itemActions,
    state,

    onCancel,
    onItemAction,
    onSubmit
  }
}
