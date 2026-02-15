import { createAuthClient } from 'better-auth/vue'
import { organizationClient, adminClient } from 'better-auth/client/plugins'

export default defineNuxtPlugin({
  name: 'session',
  enforce: 'pre',

  async setup(nuxtApp) {
    const headers = import.meta.server ? useRequestHeaders() : undefined

    const authClient = createAuthClient({
      baseURL: useRequestURL().origin,
      fetchOptions: headers ? { headers } : undefined,
      plugins: [organizationClient, adminClient]
    })

    nuxtApp.provide('authClient', authClient)

    const sessionState = useState('auth:session', () => null)
    const userState = useState('auth:user', () => null)
    const readyState = useState('auth:ready', () => false)

    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession()

        sessionState.value = data?.session || null
        userState.value = data?.user || null
      }

      catch (error) {
        console.error('[Session] Failed to fetch:', error)
      }

      finally {
        readyState.value = true
      }
    }

    if (import.meta.server) {
      const payload = nuxtApp.payload

      payload.isCached = Boolean(useRequestEvent()?.context.cache)

      if (
        !payload.serverRendered
        || payload.prerenderedAt
        || payload.isCached
      ) {
        readyState.value = true
        return
      }

      await fetchSession()
    }

    if (import.meta.client) {
      const payload = nuxtApp.payload
      const shouldFetchNow = !payload.serverRendered
      const shouldFetchOnMount = payload.prerenderedAt || payload.isCached

      if (shouldFetchNow) {
        await fetchSession()
        return
      }

      if (shouldFetchOnMount) {
        nuxtApp.hook('app:mounted', fetchSession)
        return
      }

      readyState.value = true
    }
  }
})
