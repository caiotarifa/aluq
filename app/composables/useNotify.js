export function useNotify(globalOptions = {}) {
  const appConfig = useAppConfig()
  const toast = useToast()

  function playSound(sound) {
    new Audio(`/sounds/${sound}.wav`).play()
  }

  /**
   * Show error notification.
   *
   * @param {object} options
   */
  function notifyError(options) {
    playSound('caution')

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
    playSound('celebration')

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
