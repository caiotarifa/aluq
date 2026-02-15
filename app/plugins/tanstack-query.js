import {
  QueryClient,
  VueQueryPlugin,
  hydrate,
  dehydrate
} from '@tanstack/vue-query'

import { provideQuerySettingsContext } from '@zenstackhq/tanstack-query/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState('tanstack-query')

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 1,
        refetchOnWindowFocus: false
      }
    }
  })

  nuxtApp.vueApp.use(
    VueQueryPlugin,
    { queryClient }
  )

  const event = import.meta.server ? useRequestEvent() : null

  // Provide Zenstack TanStack Query settings.
  nuxtApp.hook('vue:setup', () => {
    const customFetch = async (url, options = {}) => {
      if (import.meta.server && event) {
        const cookie = event.headers.get('cookie')

        if (cookie) {
          options = {
            ...options,
            headers: { ...options.headers, cookie }
          }
        }
      }

      const { _data, status } = await $fetch.raw(url, options)
      return new Response(JSON.stringify(_data), { status })
    }

    provideQuerySettingsContext({
      endpoint: '/api/model',
      logging: import.meta.dev,
      fetch: customFetch
    })
  })

  // SSR hydration.
  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxtApp.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
