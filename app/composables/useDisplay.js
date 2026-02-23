import {
  DisplayBoolean,
  DisplayCode,
  DisplayCurrency,
  DisplayDate,
  DisplayEmail,
  DisplayNumber,
  DisplayPhone,
  DisplayRelation,
  DisplaySelect,
  DisplayText
} from '#components'

const components = {
  DisplayBoolean,
  DisplayCode,
  DisplayCurrency,
  DisplayDate,
  DisplayEmail,
  DisplayNumber,
  DisplayPhone,
  DisplayRelation,
  DisplaySelect,
  DisplayText
}

export function useDisplay() {
  function resolve(displayConfig) {
    if (!displayConfig?.component) return null
    return components[displayConfig.component] || null
  }

  return { resolve }
}
