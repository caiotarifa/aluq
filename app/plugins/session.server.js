import { createAuthClient } from 'better-auth/vue'

export default defineNuxtPlugin({
  name: 'auth-session',
  enforce: 'pre',

  async setup(nuxtApp) {
    const payload = nuxtApp.payload
    payload.isCached = Boolean(useRequestEvent()?.context.cache)

    if (
      !payload.serverRendered
      || payload.prerenderedAt
      || payload.isCached
    ) return

    const authClient = createAuthClient({
      baseURL: useRequestURL().origin,
      fetchOptions: { headers: useRequestHeaders() }
    })

    const { data } = await authClient.getSession()

    useState('auth:session', () => data?.session || null)
    useState('auth:user', () => data?.user || null)
  }
})
