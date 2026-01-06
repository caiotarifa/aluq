import { createAuthClient } from 'better-auth/vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  const payload = nuxtApp.payload
  const shouldFetchNow = !payload.serverRendered
  const shouldFetchOnMount = payload.prerenderedAt || payload.isCached

  if (!shouldFetchNow && !shouldFetchOnMount) return

  const authClient = createAuthClient({
    baseURL: useRequestURL().origin
  })

  const fetchSession = async () => {
    const { data } = await authClient.getSession()

    useState('auth:session').value = data?.session || null
    useState('auth:user').value = data?.user || null
  }

  if (shouldFetchNow) {
    await fetchSession()
  }

  else {
    nuxtApp.hook('app:mounted', fetchSession)
  }
})
