import { LazyModalAlert, LazyModalConfirm } from '#components'

export function useDialog() {
  const overlay = useOverlay()

  const confirmModal = overlay.create(LazyModalConfirm)
  const alertModal = overlay.create(LazyModalAlert)

  async function confirmDialog({
    title,
    description,
    confirmLabel,
    action
  } = {}) {
    const instance = confirmModal.open({
      title,
      description,
      confirmLabel,
      action
    })

    const result = await instance.result

    return result === true
  }

  async function alertDialog({
    title,
    description,
    icon
  } = {}) {
    const instance = alertModal.open({
      title,
      description,
      icon
    })

    await instance.result
  }

  return {
    confirmDialog,
    alertDialog
  }
}
