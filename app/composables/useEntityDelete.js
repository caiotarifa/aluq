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

  async function confirmAndExecute({
    confirmConfig,
    action,
    successConfig,
    errorConfig
  }) {
    try {
      const confirmed = await confirmDialog({ ...confirmConfig, action })

      if (!confirmed) return false

      notifySuccess(successConfig)
      return true
    }

    catch {
      notifyError(errorConfig)
      return false
    }
  }

  async function deleteRecord(id) {
    const item = t(`${key}.items`)

    return confirmAndExecute({
      confirmConfig: {
        title: t('messages.confirmDelete.title', { item }),
        description: t('messages.confirmDelete.description'),
        confirmLabel: t('actions.delete')
      },

      action: () => deleteMutation.mutateAsync(
        { where: { id } }
      ),

      successConfig: {
        title: t('messages.deleteSuccess.title'),
        description: t('messages.deleteSuccess.description', { item })
      },

      errorConfig: {
        title: t('messages.deleteError.title'),
        description: t('messages.deleteError.description', { item })
      }
    })
  }

  async function deleteRecords(ids) {
    const item = t(`${key}.items`, ids.length)
    const title = t(`${key}.title`, ids.length).toLowerCase()

    return confirmAndExecute({
      confirmConfig: {
        title: t('messages.confirmBatchDelete.title', {
          count: ids.length,
          title
        }),
        description: t('messages.confirmBatchDelete.description'),
        confirmLabel: t('actions.delete')
      },

      action: async () => {
        for (const id of ids) {
          await deleteMutation.mutateAsync({ where: { id } })
        }
      },

      successConfig: {
        title: t('messages.batchDeleteSuccess.title'),
        description: t(
          'messages.batchDeleteSuccess.description',
          { count: ids.length, title }
        )
      },
      errorConfig: {
        title: t('messages.deleteError.title'),
        description: t('messages.deleteError.description', { item })
      }
    })
  }

  return {
    isDeleting,
    deleteRecord,
    deleteRecords
  }
}
