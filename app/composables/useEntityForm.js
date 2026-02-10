const excludedProperties = ['id', 'createdAt', 'updatedAt']

function buildInitialState(entity) {
  const state = {}

  for (const key in entity.properties) {
    if (excludedProperties.includes(key)) continue

    const property = entity.properties[key]
    state[key] = property.defaultValue ?? null
  }

  return state
}

function buildPayload(state) {
  const payload = {}

  for (const field in state) {
    if (excludedProperties.includes(field)) continue
    payload[field] = toRaw(state[field])
  }

  return payload
}

function resolveFormConfig(entity) {
  const form = entity.form || {}

  if (form.fieldsets?.length || form.fields?.length) {
    return {
      fieldsets: form.fieldsets || [],
      fields: form.fields || []
    }
  }

  const fields = []

  for (const key in entity.properties) {
    if (excludedProperties.includes(key)) continue
    fields.push({ property: key })
  }

  return {
    fieldsets: [],
    fields
  }
}

export function useEntityForm(entityName, options = {}) {
  const route = useRoute()
  const router = useRouter()

  const key = singularize(toValue(entityName))

  const isNew = computed(() =>
    route.params.id === 'new'
  )

  const entity = useEntity(entityName)

  const formConfig = computed(() =>
    resolveFormConfig(entity.value)
  )

  const state = reactive({})
  const isInitialized = ref(false)

  const { t } = useI18n()
  const { client } = useRemote()
  const { notifyError, notifySuccess } = useNotify()

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  const {
    data: existingData,
    error: fetchError,
    isLoading: isFetching
  } = client[key].useFindUnique(
    () => isNew.value ? false : { where: { id: route.params.id } },
    () => ({ enabled: !isNew.value })
  )

  watch(fetchError, (error) => {
    if (!error) return

    const item = t(`${key}.items`)

    notifyError({
      title: t('messages.fetchError.title'),
      description: t('messages.fetchError.description', { item })
    })
  })

  // Reset initialization flag when route id changes.
  watch(
    () => route.params.id,
    () => { isInitialized.value = false }
  )

  // State initialization.
  watch([() => entity.value, existingData], ([resolvedEntity, data]) => {
    if (isInitialized.value || !resolvedEntity) return

    const base = buildInitialState(resolvedEntity)

    if (data) {
      for (const field in data) {
        if (field in base) {
          base[field] = data[field]
        }
      }
    }

    for (const field in base) {
      state[field] = base[field]
    }

    if (isNew.value || data) {
      isInitialized.value = true
    }
  }, { immediate: true })

  // Mutations.
  const createMutation = client[key].useCreate()
  const updateMutation = client[key].useUpdate()

  const isSaving = computed(() =>
    createMutation.isPending.value || updateMutation.isPending.value
  )

  function save() {
    const data = buildPayload(state)

    if (isNew.value) {
      return createMutation.mutateAsync({ data })
    }

    return updateMutation.mutateAsync({
      where: { id: route.params.id },
      data
    })
  }

  // Redirect default.
  const redirectTo = computed(() =>
    toValue(options.redirectTo) || `/app/${route.params.entity}`
  )

  // Submit handler.
  async function onSubmit() {
    if (isSaving.value) return

    const item = t(`${key}.items`)

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

  return {
    entity,
    formConfig,
    isFetching,
    isNew,
    isSaving,
    state,

    onCancel,
    onSubmit
  }
}
