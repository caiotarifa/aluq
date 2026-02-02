<template>
  <ChatTool
    v-if="invocation.state === 'output-available'"
    :title="t('chatToolEmail.title')"
  >
    <template #actions>
      <UTooltip :text="t('chatToolEmail.actions.copy')">
        <UButton
          :color="copied ? 'primary' : 'neutral'"
          :icon="copied ? 'i-tabler-copy-check' : 'i-tabler-copy'"
          size="sm"
          variant="link"
          @click="copyEmail"
        />
      </UTooltip>

      <UDropdownMenu
        :items="sendMenuItems"
        :ui="{ content: 'w-64' }"
      >
        <UTooltip :text="t('chatToolEmail.actions.send')">
          <UButton
            color="neutral"
            icon="i-tabler-send"
            size="sm"
            variant="link"
          />
        </UTooltip>
      </UDropdownMenu>
    </template>

    <div class="space-y-4">
      <div
        v-for="(value, key) in headerFields"
        :key="key"
        class="border-b border-default pb-4"
      >
        <span class="pr-2 font-medium text-muted">
          {{ t(`chatToolEmail.${key}`) }}
        </span>

        <span
          :ref="setHeaderValueRef(key)"
          contenteditable
        >
          {{ value }}
        </span>
      </div>

      <div
        ref="emailBodyRef"
        contenteditable
      >
        <MDCCached
          :cache-key="`email-${invocation.toolCallId}`"
          class="leading-relaxed *:first:mt-0 *:last:mb-0"
          :parser-options="{ highlight: false }"
          :value="content"
        />
      </div>
    </div>
  </ChatTool>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  invocation: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const to = computed(() =>
  props.invocation.output?.to ?? ''
)

const subject = computed(() =>
  props.invocation.output?.subject ?? ''
)

const content = computed(() =>
  props.invocation.output?.content ?? ''
)

const headerFields = computed(() => {
  const fields = {}

  if (to.value) {
    fields.to = to.value
  }

  if (subject.value) {
    fields.subject = subject.value
  }

  return fields
})

const sendMenuItems = computed(() => [
  {
    label: t('chatToolEmail.providers.gmail'),
    onSelect: () => openEmailProvider('gmail')
  },
  {
    label: t('chatToolEmail.providers.outlook'),
    onSelect: () => openEmailProvider('outlook')
  },
  {
    label: t('chatToolEmail.providers.default'),
    onSelect: () => openEmailProvider('default')
  }
])

// Clipboard.
const { copy, copied } = useClipboard()

const emailBodyRef = useTemplateRef('emailBodyRef')

function copyEmail() {
  copy(emailBodyRef.value?.innerText ?? '')
}

// Send email.
const headerValueRefs = {}

function setHeaderValueRef(key) {
  return (element) => {
    headerValueRefs[key] = element
  }
}

function getEditedValues() {
  return {
    to: headerValueRefs.to?.innerText?.trim() ?? '',
    subject: headerValueRefs.subject?.innerText?.trim() ?? '',
    body: emailBodyRef.value?.innerText?.trim() ?? ''
  }
}

function buildQuery(url, params) {
  const query = []

  for (const key in params) {
    const value = params[key]

    if (value) {
      query.push(`${key}=${encodeURIComponent(value)}`)
    }
  }

  return url + query.join('&')
}

function openEmailProvider(provider) {
  const { to, subject, body } = getEditedValues()

  const urls = {
    gmail: buildQuery(
      'https://mail.google.com/mail/?',
      { view: 'cm', to, su: subject, body }
    ),

    outlook: buildQuery(
      'https://outlook.office.com/mail/deeplink/compose?',
      { to, subject, body }
    ),

    default: buildQuery(
      `mailto:${encodeURIComponent(to)}?`,
      { subject, body }
    )
  }

  window.open(urls[provider], '_blank')
}
</script>
