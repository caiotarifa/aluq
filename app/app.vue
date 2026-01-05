<template>
  <UApp :locale="locales[locale]">
    <NuxtLoadingIndicator />
    <NuxtPage />
  </UApp>
</template>

<script setup>
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()

const currentLocale = computed(() =>
  locales[locale.value.toLocaleLowerCase().replace('-', '_')]
)

const dir = computed(() =>
  currentLocale.value.dir
)

const lang = computed(() =>
  currentLocale.value.code
)

useHead({
  htmlAttrs: {
    dir,
    lang
  }
})
</script>
