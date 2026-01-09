import * as v from 'valibot'

import { createOrganizationSchema } from '~/schemas/organization'

/**
 * Organization error class.
 *
 * @class
 */
class OrganizationError extends Error {
  /**
   * Constructor.
   *
   * @param {string} message Error message.
   */
  constructor(message, options) {
    super(message, options)
    this.name = 'OrganizationError'
  }
}

/**
 * Use organization composable.
 *
 * @returns {Object} Organization state and helpers
 */
export function useOrganization() {
  const { t } = useI18n()
  const { notifyError, notifySuccess } = useNotify()
  const { client: authClient, currentUser } = useAuth()

  // Loading states.
  const isFetchingOrganizations = ref(false)
  const isFetchingInvitations = ref(false)
  const isCreatingOrganization = ref(false)
  const isSettingActiveOrganization = ref(false)
  const isAcceptingInvitation = ref(false)
  const isRejectingInvitation = ref(false)

  // Data states.
  const organizations = ref([])
  const invitations = ref([])

  /**
   * Fetch user organizations.
   *
   * @returns {Promise<Array>}
   */
  async function fetchOrganizations() {
    isFetchingOrganizations.value = true

    try {
      const result = await authClient.organization.list()

      if (result.error) {
        throw result.error
      }

      organizations.value = result.data || []
      return organizations.value
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isFetchingOrganizations.value = false
    }
  }

  /**
   * Fetch pending invitations for current user.
   *
   * @returns {Promise<Array>}
   */
  async function fetchInvitations() {
    isFetchingInvitations.value = true

    try {
      const result = await authClient.organization.listInvitations({
        query: { status: 'pending' }
      })

      if (result.error) {
        throw result.error
      }

      invitations.value = result.data || []
      return invitations.value
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isFetchingInvitations.value = false
    }
  }

  /**
   * Create a new organization.
   *
   * @param {object} data
   * @returns {Promise<object>}
   */
  async function createOrganization(data) {
    isCreatingOrganization.value = true

    const validatedData = v.parse(
      createOrganizationSchema,
      data
    )

    try {
      const result = await authClient.organization.create(validatedData)

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.organization.created')
      })

      return result.data
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isCreatingOrganization.value = false
    }
  }

  /**
   * Set active organization.
   *
   * @param {string} organizationId
   * @returns {Promise<void>}
   */
  async function setActiveOrganization(organizationId) {
    isSettingActiveOrganization.value = true

    try {
      const result = await authClient.organization.setActive({
        organizationId
      })

      if (result.error) {
        throw result.error
      }

      return result.data
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isSettingActiveOrganization.value = false
    }
  }

  /**
   * Accept an invitation.
   *
   * @param {string} invitationId
   * @returns {Promise<void>}
   */
  async function acceptInvitation(invitationId) {
    isAcceptingInvitation.value = true

    try {
      const result = await authClient.organization.acceptInvitation({
        invitationId
      })

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.organization.invitationAccepted')
      })

      return result.data
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isAcceptingInvitation.value = false
    }
  }

  /**
   * Reject an invitation.
   *
   * @param {string} invitationId
   * @returns {Promise<void>}
   */
  async function rejectInvitation(invitationId) {
    isRejectingInvitation.value = true

    try {
      const result = await authClient.organization.rejectInvitation({
        invitationId
      })

      if (result.error) {
        throw result.error
      }

      notifySuccess({
        title: t('messages.organization.invitationRejected')
      })

      return result.data
    }

    catch ({ message, ...options }) {
      notifyError({ description: message })
      throw new OrganizationError(message, options)
    }

    finally {
      isRejectingInvitation.value = false
    }
  }

  // Computed states.
  const hasOrganizations = computed(() =>
    organizations.value.length > 0
  )

  const hasInvitations = computed(() =>
    invitations.value.length > 0
  )

  const userEmail = computed(() =>
    currentUser.value?.email || ''
  )

  return {
    // Data states.
    organizations,
    invitations,

    // Computed states.
    hasOrganizations,
    hasInvitations,
    userEmail,

    // Loading states.
    isFetchingOrganizations,
    isFetchingInvitations,
    isCreatingOrganization,
    isSettingActiveOrganization,
    isAcceptingInvitation,
    isRejectingInvitation,

    // Methods.
    fetchOrganizations,
    fetchInvitations,
    createOrganization,
    setActiveOrganization,
    acceptInvitation,
    rejectInvitation
  }
}
