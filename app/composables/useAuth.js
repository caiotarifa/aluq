import { createAuthClient } from 'better-auth/vue'
import { organizationClient, adminClient } from 'better-auth/client/plugins'
import * as v from 'valibot'

import {
  authSignInByEmailSchema,
  authSignUpByEmailSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema
} from '~/schemas/auth'

/**
 * Auth client.
 *
 * @returns {AuthClient} Auth client instance.
 */
export const authClient = createAuthClient({
  plugins: [
    organizationClient,
    adminClient
  ]
})

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

  const session = authClient.useSession(useFetch)

  // States.
  const isSignedIn = computed(() =>
    !!session.data?.value?.user
  )

  const currentUser = computed(() =>
    session.data?.value?.user || null
  )

  const activeOrganizationId = computed(() =>
    session.data?.value?.session?.activeOrganizationId || null
  )

  // Loading states.
  const isSigningIn = ref(false)
  const isSigningUp = ref(false)
  const isSigningOut = ref(false)
  const isSendingResetEmail = ref(false)
  const isResettingPassword = ref(false)

  /**
   * Sign in method using email.
   *
   * @param {object} credentials
   * @returns {Promise<void>}
   */
  async function signInByEmail(credentials) {
    isSigningIn.value = true

    const validatedCredentials = v.parse(
      authSignInByEmailSchema,
      credentials
    )

    try {
      const result = await authClient.signIn.email(validatedCredentials)

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.auth.signedIn')
      })

      return result
    }

    catch ({ message, ...options }) {
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

    const validatedCredentials = v.parse(
      authSignUpByEmailSchema,
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

    const { email } = v.parse(
      authForgotPasswordSchema,
      data
    )

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: '/auth/password/reset'
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

    const validatedData = v.parse(
      authResetPasswordSchema,
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
   * Refresh session method.
   *
   * @returns {Promise<void>}
   */
  async function refresh() {
    return session.refresh()
  }

  return {
    // Client instance.
    authClient,

    // State.
    session,
    isSignedIn,
    currentUser,
    activeOrganizationId,

    // Loading states.
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isSendingResetEmail,
    isResettingPassword,

    // Methods.
    signInByEmail,
    signUpByEmail,
    signOut,

    forgotPassword,
    resetPassword,

    refresh
  }
}
