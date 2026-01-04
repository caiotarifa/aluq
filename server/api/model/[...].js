import { RPCApiHandler } from '@zenstackhq/server/api'
import { createEventHandler } from '@zenstackhq/server/nuxt'

import { auth } from '~~/server/utils/auth'
import { authDb } from '~~/server/utils/db'
import { schema } from '~~/zenstack/schema'

export default createEventHandler({
  apiHandler: new RPCApiHandler({ schema }),

  async getClient(event) {
    const sessionResult = await auth.api.getSession({
      headers: event.headers
    })

    // No authenticated.
    if (!sessionResult) {
      // throw createError({
      //   statusCode: 401,
      //   message: 'Unauthorized'
      // })

      return authDb
    }

    // Authenticated.
    const { session } = sessionResult
    const userContext = { userId: session.userId }

    if (session.activeOrganizationId) {
      userContext.organizationId = session.activeOrganizationId
    }

    return authDb.$setAuth(userContext)
  }
})
