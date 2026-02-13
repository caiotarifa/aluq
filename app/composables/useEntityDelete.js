export function useEntityDelete(entityName) {
  const key = singularize(toValue(entityName))
  const { client } = useRemote()

  if (!client[key]) {
    throw new Error(`Entity "${key}" not found in schema`)
  }

  const { t } = useI18n()
  const { confirmDialog } = useDialog()
  const { notifyError, notifySuccess } = useNotify()

  const deleteMutation = client[key].useDelete()

  const isDeleting = computed(() =>
    deleteMutation.isPending.value
  )

  async function deleteRecord(id) {
    const item = t(`${key}.items`)

    try {
      const confirmed = await confirmDialog({
        title: t('messages.confirmDelete.title', { item }),
        description: t('messages.confirmDelete.description'),
        confirmLabel: t('actions.delete'),
        action: () => deleteMutation.mutateAsync({ where: { id } })
      })

      if (!confirmed) return false

      notifySuccess({
        title: t('messages.deleteSuccess.title'),
        description: t('messages.deleteSuccess.description', { item })
      })

      return true
    }

    catch {
      notifyError({
        title: t('messages.deleteError.title'),
        description: t('messages.deleteError.description', { item })
      })

      return false
    }
  }

  async function deleteRecords(ids) {
    const item = t(`${key}.items`, ids.length)
    const title = t(`${key}.title`, ids.length).toLowerCase()

    try {
      const confirmed = await confirmDialog({
        title: t('messages.confirmBatchDelete.title', {
          count: ids.length,
          title
        }),

        description: t('messages.confirmBatchDelete.description'),
        confirmLabel: t('actions.delete'),

        action: async () => {
          for (const id of ids) {
            await deleteMutation.mutateAsync({ where: { id } })
          }
        }
      })

      if (!confirmed) return false

      notifySuccess({
        title: t('messages.batchDeleteSuccess.title'),
        description: t('messages.batchDeleteSuccess.description', {
          count: ids.length,
          title
        })
      })

      return true
    }

    catch {
      notifyError({
        title: t('messages.deleteError.title'),
        description: t('messages.deleteError.description', { item })
      })

      return false
    }
  }

  return {
    isDeleting,
    deleteRecord,
    deleteRecords
  }
}
