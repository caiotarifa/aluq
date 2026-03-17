import { z } from 'zod'
import { pt } from 'zod/locales'

// Maps i18n locale to Zod's native locale.
const zodLocales = {
  'pt-BR': pt
}

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n

  function setupZodLocale() {
    const zodLocaleFactory = zodLocales[i18n.locale.value] ?? pt
    const { localeError: baseError } = zodLocaleFactory()

    z.config({
      localeError: (issue) => {
        // Only non-optional fields trigger invalid_type for undefined.
        if (
          issue.code === 'invalid_type'
          && (issue.input === undefined || issue.input === null)
        ) {
          return i18n.te('zod.required')
            ? i18n.t('zod.required')
            : baseError(issue)
        }

        // Special case: too_small with minimum 1 on a required string field.
        if (
          issue.code === 'too_small'
          && issue.minimum === 1
          && issue.origin === 'string'
        ) {
          return i18n.te('zod.required')
            ? i18n.t('zod.required')
            : baseError(issue)
        }

        // Declarative override: if zod.{code} exists in i18n.
        const overrideKey = `zod.${issue.code}`

        if (i18n.te(overrideKey)) {
          return i18n.t(overrideKey, issue)
        }

        // Fallback: native Zod locale.
        return baseError(issue)
      }
    })
  }

  setupZodLocale()
  watch(i18n.locale, setupZodLocale)
})
