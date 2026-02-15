import {
  authSignInByEmailSchema,
  authSignUpByEmailSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema
} from '~/schemas/auth'

/**
 * Auth error class.
 *
 * @class
 */
class AuthError extends Error {
  /**
   * Constructor.
   *
   * @param {string} message Error message.
   */
  constructor(message, options) {
    super(message, options)
    this.name = 'AuthError'
  }
}

/**
 * Use auth composable.
 *
 * @returns {Object} Authentication state and helpers
 */
export function useAuth() {
  const { t } = useI18n()
  const { notifyError, notifySuccess } = useNotify()

  // Auth client (shared instance from session plugin).
  const { $authClient: authClient } = useNuxtApp()

  // Session state (shared via useState).
  const session = useState('auth:session', () => null)
  const user = useState('auth:user', () => null)

  const sessionFetching = useState('auth:sessionFetching', () => false)

  // Fetch session.
  async function fetchSession() {
    if (sessionFetching.value) return

    sessionFetching.value = true
    const { data } = await authClient.getSession()

    session.value = data?.session || null
    user.value = data?.user || null
    sessionFetching.value = false

    return data
  }

  // Listen for session changes (client only).
  if (import.meta.client) {
    const unsubscribe = authClient.$store.listen(
      '$sessionSignal',

      async (signal) => {
        if (!signal) return
        await fetchSession()
      }
    )

    onUnmounted(() => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
  }

  // Computed states.
  const isSignedIn = computed(() =>
    !!user.value
  )

  const currentUser = computed(() =>
    user.value
  )

  const isEmailVerified = computed(() =>
    user.value?.emailVerified || false
  )

  const activeOrganizationId = computed(() =>
    session.value?.activeOrganizationId || null
  )

  // Loading states.
  const isSigningIn = ref(false)
  const isSigningUp = ref(false)
  const isSigningOut = ref(false)
  const isSendingResetEmail = ref(false)
  const isResettingPassword = ref(false)
  const isSendingVerificationEmail = ref(false)
  const isVerifyingEmail = ref(false)

  /**
   * Sign in method using email.
   *
   * @param {object} credentials
   * @returns {Promise<void>}
   */
  async function signInByEmail(credentials) {
    isSigningIn.value = true

    const validatedCredentials = authSignInByEmailSchema.parse(
      credentials
    )

    try {
      const result = await authClient.signIn.email(validatedCredentials)

      if (result.error) {
        throw result.error
      }

      // Atualiza a sessão após login bem-sucedido
      await fetchSession()

      notifySuccess({
        title: t('messages.auth.signedIn')
      })

      return result
    }

    catch (error) {
      const { message, ...options } = error

      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isSigningIn.value = false
    }
  }

  /**
   * Sign up method using email.
   *
   * @param {object} credentials
   * @returns {Promise<void>}
   */
  async function signUpByEmail(credentials) {
    isSigningUp.value = true

    const validatedCredentials = authSignUpByEmailSchema.parse(
      credentials
    )

    // Remove passwordConfirm before sending to the server.
    delete validatedCredentials.passwordConfirm

    try {
      const result = await authClient.signUp.email(validatedCredentials)

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.signedUp')
      })

      return result
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isSigningUp.value = false
    }
  }

  /**
   * Sign out method.
   *
   * @returns {Promise<void>}
   */
  async function signOut() {
    isSigningOut.value = true

    try {
      const result = await authClient.signOut()

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.signedOut')
      })

      return result
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isSigningOut.value = false
    }
  }

  /**
   * Forgot password method.
   *
   * @param {string} email
   * @returns {Promise<void>}
   */
  async function forgotPassword(data) {
    isSendingResetEmail.value = true

    const { email } = authForgotPasswordSchema.parse(
      data
    )

    try {
      const result = await authClient.requestPasswordReset({
        email
      })

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.resetEmailSent')
      })

      return result
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isSendingResetEmail.value = false
    }
  }

  /**
   * Reset password method.
   *
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async function resetPassword(data) {
    isResettingPassword.value = true

    const validatedData = authResetPasswordSchema.parse(
      data
    )

    try {
      const result = await authClient.resetPassword(validatedData)

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.passwordReset')
      })

      return result
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isResettingPassword.value = false
    }
  }

  /**
   * Send verification email.
   *
   * @param {string} email
   * @returns {Promise<{ retryAfter?: number }>}
   */
  async function sendVerificationEmail(email) {
    isSendingVerificationEmail.value = true

    try {
      const result = await authClient.sendVerificationEmail({
        email
      })

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.verificationEmailSent')
      })

      return result
    }

    catch (error) {
      const { message, status, ...options } = error

      // Rate limited.
      if (status === 429) {
        const retryAfter = error.headers?.get?.('X-Retry-After') || 60

        notifyError({
          description: t('messages.auth.rateLimitExceeded', {
            seconds: retryAfter
          })
        })

        return { retryAfter: Number(retryAfter) }
      }

      notifyError({ description: message })
      throw new AuthError(message, options)
    }

    finally {
      isSendingVerificationEmail.value = false
    }
  }

  /**
   * Verify email with token.
   *
   * @param {string} token
   * @returns {Promise<void>}
   */
  async function verifyEmail(token) {
    isVerifyingEmail.value = true

    try {
      const result = await authClient.verifyEmail({
        query: { token }
      })

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.emailVerified')
      })

      return result
    }

    catch (error) {
      const { message, ...options } = error

      notifyError({
        description: t('messages.auth.emailVerificationFailed')
      })

      throw new AuthError(message, options)
    }

    finally {
      isVerifyingEmail.value = false
    }
  }

  return {
    // Client instance.
    client: authClient,

    // State.
    isSignedIn,
    currentUser,
    isEmailVerified,
    activeOrganizationId,

    // Loading states.
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isSendingResetEmail,
    isResettingPassword,
    isSendingVerificationEmail,
    isVerifyingEmail,

    // Methods.
    fetchSession,

    signInByEmail,
    signUpByEmail,
    signOut,

    forgotPassword,
    resetPassword,

    sendVerificationEmail,
    verifyEmail
  }
}
