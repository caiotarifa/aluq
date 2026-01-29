const models = [
  {
    label: 'GPT-5 Nano',
    icon: 'i-simple-icons-openai',
    value: 'openai/gpt-5-nano'
  },

  {
    label: 'Claude Haiku 4.5',
    icon: 'i-simple-icons-anthropic',
    value: 'anthropic/claude-haiku-4.5'
  },

  {
    label: 'Gemini 2.5 Flash',
    icon: 'i-simple-icons-google',
    value: 'google/gemini-2.5-flash'
  }
]

export function useChatModels() {
  const model = useCookie('chat-model', {
    default: () => models[0].value
  })

  const modelConfig = computed(() =>
    models.find(item => item.value === model.value) || models[0]
  )

  return {
    models,
    model,
    modelConfig
  }
}
