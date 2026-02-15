export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta?.auth === false) return

  const ready = useState('auth:ready')
  if (!ready.value) return

  const user = useState('auth:user').value
  const isSignedIn = !!user
  const isEmailVerified = user?.emailVerified || false

  const authConfig = typeof to.meta?.auth === 'object'
    ? to.meta.auth
    : {}

  const {
    only,
    redirectTo,
    verifiedEmail = true,
    requireOrganization = true
  } = authConfig

  const isAuthRoute = to.path.startsWith('/auth')
  const redirect = to.query.redirect || redirectTo

  const isSafeRedirect = typeof redirect === 'string'
    && redirect.length > 0
    && redirect.startsWith('/')
    && !redirect.startsWith('//')
    && !redirect.startsWith('/auth')

  const safeRedirect = isSafeRedirect ? redirect : '/app'

  if (only === 'guest') {
    if (!isSignedIn) return

    return navigateTo(isEmailVerified
      ? safeRedirect
      : '/auth/email-verification'
    )
  }

  if (only === 'unverified') {
    if (!isSignedIn) return navigateTo('/auth/sign-in')
    if (isEmailVerified) return navigateTo(safeRedirect)

    return
  }

  if (authConfig.required === false) return

  if (!isSignedIn) {
    return navigateTo({
      path: '/auth/sign-in',
      query: isAuthRoute ? undefined : { redirect: to.fullPath }
    })
  }

  if (verifiedEmail && !isEmailVerified) {
    return navigateTo('/auth/email-verification')
  }

  if (requireOrganization && !isAuthRoute) {
    const { activeOrganizationId } = useState('auth:session').value ?? {}

    if (!activeOrganizationId) {
      return navigateTo({
        path: '/auth/organization',
        query: { redirect: to.fullPath }
      })
    }
  }
})
