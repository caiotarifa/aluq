import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  stepCountIs,
  streamText
} from 'ai'

import { auth } from '#server/utils/auth'
import { authDb, db } from '#server/utils/db'
import { resolveModel } from '#server/utils/ai'
import { buildSystemPrompt } from '#server/utils/systemPrompt'
import { createListTool } from '#server/utils/ai/tools/list'

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

  const { model, messages } = await readBody(event)

  // Generate title if missing.
  let generatedTitle = null

  if (!chat.title) {
    const { text } = await generateText({
      model: resolveModel('openai/gpt-5-nano'),
      system: `Gere um título curto (máximo 30 caracteres) para um chat:
        - O título deve estar em português.
        - O título não deve conter aspas ou pontuação desnecessária.
        - O título deve ser descritivo e relevante para o conteúdo do chat.
        - Responda apenas com o título, sem explicações adicionais.`,
      prompt: JSON.stringify(messages[0])
    })

    generatedTitle = text.slice(0, 30)

    await db.chat.update({
      where: { id },
      data: { title: generatedTitle }
    })
  }

  // Save new user message (first message is already saved on chat creation).
  const lastMessage = messages[messages.length - 1]

  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.chatMessage.create({
      data: {
        chatId: chat.id,
        role: 'user',
        parts: JSON.stringify(lastMessage.parts)
      }
    })
  }

  // Build tools.
  const tools = {
    list: createListTool(authDb, session)
  }

  // Build system prompt.
  const [user, organization] = await Promise.all([
    db.user.findFirst({
      where: { id: session.userId }
    }),

    db.organization.findFirst({
      where: { id: session.activeOrganizationId }
    })
  ])

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (generatedTitle) {
        writer.write({
          type: 'data-title',
          data: { title: generatedTitle }
        })
      }

      const modelMessages = await convertToModelMessages(messages)

      const result = streamText({
        model: resolveModel(model),
        system: buildSystemPrompt({ user, organization }),
        messages: modelMessages,
        tools,

        providerOptions: {
          openai: {
            reasoningEffort: 'low',
            reasoningSummary: 'detailed'
          },

          google: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingBudget: 2048
            }
          }
        },

        stopWhen: stepCountIs(5)
      })

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
    },

    onFinish: async ({ messages }) => {
      const data = messages.map(message => ({
        chatId: chat.id,
        role: message.role,
        parts: JSON.stringify(message.parts)
      }))

      await db.chatMessage.createMany({ data })
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})
