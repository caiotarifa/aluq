// TODO: Transformar em computada.
export const useViews = (entity, views = {}) => {
  const { t } = useI18n()

  const localePrefix = entity + '.views.'
  const viewsObject = {}

  for (const key in views) {
    viewsObject[key] = Object.assign({
      label: t(localePrefix + key)
    }, views[key])
  }

  return viewsObject
}
