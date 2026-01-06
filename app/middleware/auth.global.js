export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta?.auth === false) return

  const user = useState('auth:user').value

  const isSignedIn = !!user
  const isEmailVerified = user?.emailVerified || false

  const authConfig = typeof to.meta?.auth === 'object'
    ? to.meta.auth
    : {}

  const { only, redirectTo, verifiedEmail = true } = authConfig

  if (only === 'guest') {
    if (!isSignedIn) return

    return navigateTo(isEmailVerified
      ? (redirectTo || '/app')
      : '/auth/email-verification'
    )
  }

  if (only === 'unverified') {
    if (!isSignedIn) return navigateTo('/auth/sign-in')
    if (isEmailVerified) return navigateTo(redirectTo || '/app')
    return
  }

  if (authConfig.required !== false) {
    if (!isSignedIn) {
      return navigateTo({
        path: '/auth/sign-in',
        query: { redirect: to.fullPath }
      })
    }

    if (verifiedEmail && !isEmailVerified) {
      return navigateTo('/auth/email-verification')
    }
  }
})
