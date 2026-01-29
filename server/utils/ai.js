import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const providers = {
  openai: apiKey => createOpenAI({ apiKey }),
  anthropic: apiKey => createAnthropic({ apiKey }),
  google: apiKey => createGoogleGenerativeAI({ apiKey })
}

const apiKeyMap = {
  openai: 'openaiApiKey',
  anthropic: 'anthropicApiKey',
  google: 'googleApiKey'
}

export function resolveModel(modelId) {
  const [provider, ...rest] = modelId.split('/')
  const model = rest.join('/')

  const factory = providers[provider]

  if (!factory) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown provider: ${provider}`
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config[apiKeyMap[provider]]

  return factory(apiKey)(model)
}
