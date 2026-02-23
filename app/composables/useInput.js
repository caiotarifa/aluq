import {
  InputBoolean,
  InputCode,
  InputCurrency,
  InputDate,
  InputDateTime,
  InputPhone,
  InputRelation,
  InputText,
  InputTime
} from '#components'

const components = {
  InputBoolean,
  InputCode,
  InputCurrency,
  InputDate,
  InputDateTime,
  InputPhone,
  InputRelation,
  InputText,
  InputTime
}

export function useInput() {
  function resolve(inputConfig) {
    if (!inputConfig?.component) return null
    return components[inputConfig.component] || inputConfig.component
  }

  return { resolve }
}
