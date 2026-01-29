<template>
  <AppChat>
    <UContainer class="flex flex-1 items-center justify-center">
      <div class="w-full max-w-2xl">
        <header class="mb-8 text-center">
          <h1 class="text-3xl font-semibold">
            {{ t('chat.welcomeTitle') }}
          </h1>

          <p class="mt-2 text-sm text-dimmed">
            {{ t('chat.welcomeSubtitle') }}
          </p>
        </header>

        <ChatPrompt
          v-model="input"
          v-model:model="model"
          :models
          :model-item="modelConfig"
          :placeholder="t('chat.placeholder')"
          :status="isSubmitting ? 'submitted' : 'ready'"
          @submit="onSubmit"
        />

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <UButton
            v-for="(suggestion, index) in tm('chat.suggestions')"
            :key="index"
            icon="i-tabler-message"
            color="neutral"
            variant="outline"
            :ui="{ leadingIcon: 'mr-1 size-6 text-dimmed' }"
            @click="fillPrompt(rt(suggestion.prompt))"
          >
            <div class="text-left">
              <div class="text-sm font-medium">
                {{ rt(suggestion.title) }}
              </div>

              <div class="text-xs text-dimmed">
                {{ rt(suggestion.description) }}
              </div>
            </div>
          </UButton>
        </div>

        <div class="mt-6 text-center text-xs text-dimmed">
          {{ t('chat.disclaimer') }}
        </div>
      </div>
    </UContainer>
  </AppChat>
</template>

<script setup>
const { rt, t, tm } = useI18n()

// Models.
const { models, model, modelConfig } = useChatModels()

// Input.
const input = ref('')
const isSubmitting = ref(false)

// Create chat and navigate to it.
const { client } = useRemote()

const chatCreate = client.chat?.useCreate()

async function onSubmit() {
  const text = input.value.trim()

  if (!text || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const response = await chatCreate.mutateAsync({
      data: {
        model: model.value,

        messages: {
          create: [{
            role: 'user',
            parts: JSON.stringify([{ type: 'text', text }])
          }]
        }
      }
    })

    navigateTo(`/app/chat/${response.id}`)
  }

  catch (error) {
    const { notifyError } = useNotify()

    notifyError({
      title: t('chat.error.title'),
      description: error?.message || t('chat.error.description')
    })
  }

  finally {
    isSubmitting.value = false
  }
}

function fillPrompt(suggestion) {
  input.value = suggestion
}
</script>
