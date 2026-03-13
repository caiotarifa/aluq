export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxtjs/mdc',
    '@nuxthub/core'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'Aluq',

      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ]
    }
  },

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    openaiApiKey: '',
    anthropicApiKey: '',
    googleApiKey: ''
  },

  routeRules: {
    '/': { prerender: true },

    // Auth.
    '/auth': { redirect: '/auth/sign-in' }
  },

  compatibilityDate: '2025-01-15',

  // Hub.
  hub: {
    blob: true,
    cache: true,
    kv: true
  },

  // ESLint.
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never'
      }
    }
  },

  // i18n.
  i18n: {
    locales: [
      { code: 'pt-BR', file: 'pt-BR.yml' }
    ],

    defaultLocale: 'pt-BR'
  }
})
