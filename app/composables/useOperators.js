import { operators } from '~/registry/operators.js'

export function useOperators() {
  const { t } = useI18n()

  return computed(() => {
    for (const key in operators) {
      operators[key].label = t(`operators.${operators[key].value}`)
    }

    return operators
  })
}
