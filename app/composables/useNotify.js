export function useNotify(globalOptions = {}) {
  const appConfig = useAppConfig()
  const toast = useToast()

  /**
   * Show error notification.
   *
   * @param {object} options
   */
  function notifyError(options) {
    return toast.add({
      color: 'error',
      icon: appConfig.ui.icons.error,
      ...globalOptions,
      ...options
    })
  }

  /**
   * Show success notification.
   *
   * @param {object} options
   */
  function notifySuccess(options) {
    return toast.add({
      color: 'success',
      icon: appConfig.ui.icons.success,
      ...globalOptions,
      ...options
    })
  }

  return {
    notifyError,
    notifySuccess
  }
}
