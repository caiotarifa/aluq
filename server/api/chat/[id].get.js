import { auth } from '#server/utils/auth'
import { db } from '#server/utils/db'

export default defineEventHandler(async (event) => {
  const sessionResult = await auth.api.getSession({
    headers: event.headers
  })

  if (!sessionResult) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const { session } = sessionResult
  const { id } = getRouterParams(event)

  const chat = await db.chat.findFirst({
    where: {
      id,
      organizationId: session.activeOrganizationId,
      userId: session.userId
    },

    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!chat) {
    throw createError({
      status: 404,
      statusText: 'Chat not found'
    })
  }

  chat.messages = chat.messages.map((message) => {
    message.parts = JSON.parse(message.parts)
    return message
  })

  return chat
})
