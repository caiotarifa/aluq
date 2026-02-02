<template>
  <AppChat>
    <UContainer class="flex min-h-0 flex-1 flex-col gap-4 sm:gap-6">
      <UChatMessages
        should-auto-scroll
        class="min-h-0 flex-1 overflow-y-auto"
        :assistant="assistantConfig"
        :messages="chat.messages"
        :status="chat.status"
        :ui="{ viewport: 'top-[calc(100%-150px)]' }"
      >
        <template #content="{ message }">
          <template
            v-for="(part, index) in message.parts"
            :key="`${message.id}-${index}`"
          >
            <ChatReasoning
              v-if="part.type === 'reasoning'"
              :streaming="part.state !== 'done'"
              :text="part.text"
            />

            <MDCCached
              v-else-if="part.type === 'text' && message.role === 'assistant'"
              :cache-key="`${message.id}-${index}`"
              class="*:first:mt-0 *:last:mb-0"
              :parser-options="{ highlight: false }"
              :value="part.text"
            />

            <p
              v-else-if="part.type === 'text'"
              class="whitespace-pre-wrap"
            >
              {{ part.text }}
            </p>

            <!-- <ChatDataTable
              v-else-if="part.type === 'tool-findRecords'"
              :part="part"
            /> -->
          </template>
        </template>
      </UChatMessages>

      <div class="sticky bottom-0 z-10">
        <ChatPrompt
          v-model="input"
          v-model:model="model"
          :models="models"
          :model-item="modelConfig"
          :placeholder="t('chat.placeholder')"
          :status="chat.status"
          @submit="onSubmit"
          @stop="chat.stop()"
          @reload="onReload"
        />

        <div class="bg-default py-4 text-center text-xs text-dimmed">
          {{ t('chat.disclaimer') }}
        </div>
      </div>
    </UContainer>
  </AppChat>
</template>

<script setup>
import { DefaultChatTransport } from 'ai'
import { Chat } from '@ai-sdk/vue'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

// Route and i18n.
const route = useRoute()
const { t } = useI18n()

const chatId = computed(() =>
  route.params.id
)

// Load chat data.
const { data } = await useFetch(`/api/chat/${chatId.value}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({
    status: 404,
    statusText: t('chat.notFound')
  })
}

// Models.
const { models, model, modelConfig } = useChatModels()

// Select last used model.
if (data.value.model) {
  const exists = models.find(item => item.value === data.value.model)

  if (exists) {
    model.value = data.value.model
  }
}

// Create chat instance.
const { notifyError } = useNotify()
const { client } = useRemote()

const updateTitleMutation = client.chat.useUpdate({
  optimisticUpdate: true
})

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,

  transport: new DefaultChatTransport({
    api: `/api/chat/${data.value.id}`,
    body: { model: model.value }
  }),

  onData: (eventData) => {
    if (eventData?.type === 'data-title') {
      updateTitleMutation.mutate({
        where: { id: chatId.value },
        data: { title: eventData.data.title }
      })
    }
  },

  onError: (error) => {
    // TODO: better error handling.
    console.error('Chat error:', error)

    notifyError({
      title: t('chat.error.title'),
      description: error.message || t('chat.error.description')
    })
  }
})

// Auto-start streaming for new chats.
onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})

// Input.
const input = ref('')

function onSubmit() {
  const text = input.value.trim()

  if (!text) return

  chat.sendMessage({ text })
  input.value = ''
}

function onReload() {
  chat.clearError()
  chat.regenerate()
}

// Assistant.
const { copy, copied } = useClipboard()

const assistantConfig = computed(() => {
  if (chat.status !== 'streaming') {
    return {
      actions: [{
        color: copied.value ? 'primary' : 'neutral',
        icon: copied.value ? 'i-tabler-copy-check' : 'i-tabler-copy',
        label: t(`copyButton.${copied.value ? 'copied' : 'copy'}`),
        variant: 'link',
        onClick: (event, message) => copy(getTextFromMessage(message))
      }]
    }
  }

  return { actions: [] }
})
</script>
