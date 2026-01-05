import { authClient } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value?.user) {
    const redirectTo = to.query.redirectTo

    if (session.value?.session?.activeOrganizationId) {
      return navigateTo(redirectTo ? decodeURIComponent(redirectTo) : '/app')
    }

    return navigateTo('/auth/organization', {
      query: redirectTo ? { redirectTo } : {}
    })
  }
})
