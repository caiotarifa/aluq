<template>
  <NuxtLayout name="app">
    <UDashboardPanel
      class="relative"
      :ui="{ body: 'p-0 sm:p-0' }"
    >
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <UDashboardSidebar
      class="bg-elevated/25"
      resizable
      side="right"
    >
      <template #header>
        <UButton
          block
          :icon="appConfig.ui.icons.plus"
          to="/app/chat"
          variant="soft"
        >
          {{ t('chat.newChat') }}
        </UButton>
      </template>

      <UNavigationMenu
        :items="navigationItems"
        orientation="vertical"
        :ui="{ link: 'overflow-hidden' }"
      >
        <template #chat-trailing="{ item }">
          <div class="-mr-1.25 flex translate-x-full transition-transform group-hover:translate-x-0">
            <UButton
              class="p-0.5 text-muted hover:bg-accented/50 hover:text-primary focus-visible:bg-accented/50"
              color="neutral"
              :icon="appConfig.ui.icons.close"
              size="xs"
              tabindex="-1"
              variant="ghost"
              @click.stop.prevent="onDeleteChat(item.id)"
            />
          </div>
        </template>
      </UNavigationMenu>
    </UDashboardSidebar>
  </NuxtLayout>
</template>

<script setup>
import { LazyModalConfirm } from '#components'

const appConfig = useAppConfig()
const route = useRoute()
const { t, d } = useI18n()

// Fetch chats.
const { client } = useRemote()

const {
  data: chats,
  refetch: refetchChats
} = client.chat.useFindMany(() => ({
  orderBy: {
    updatedAt: 'desc'
  },

  select: {
    id: true,
    title: true,
    updatedAt: true,
    createdAt: true
  }
}))

const getGroupConfig = (chatDate, diff, monthLabels) => {
  if (diff === 0) {
    return { id: 'today', label: t('chat.groups.today') }
  }

  if (diff === 1) {
    return { id: 'yesterday', label: t('chat.groups.yesterday') }
  }

  if (diff <= 7) {
    return { id: 'last-week', label: t('chat.groups.lastWeek') }
  }

  if (diff <= 30) {
    return { id: 'last-month', label: t('chat.groups.lastMonth') }
  }

  const year = chatDate.getFullYear()
  const month = String(chatDate.getMonth() + 1).padStart(2, '0')
  const id = `${year}-${month}`

  if (!monthLabels[id]) {
    monthLabels[id] = d(chatDate, 'monthYear')
  }

  return { id, label: monthLabels[id] }
}

// Group chats by date.
const groupedChats = computed(() => {
  if (!chats.value) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayTime = today.getTime()
  const dayMs = 86400000

  const groups = []
  const groupsIndex = {}
  const monthLabels = {}

  for (const chat of chats.value) {
    const date = new Date(chat.updatedAt || chat.createdAt || Date.now())
    date.setHours(0, 0, 0, 0)

    const diff = Math.floor((todayTime - date.getTime()) / dayMs)
    const { id, label } = getGroupConfig(date, diff, monthLabels)

    if (!groupsIndex[id]) {
      const group = { id, label, items: [] }

      groupsIndex[id] = group
      groups.push(group)
    }

    groupsIndex[id].items.push(chat)
  }

  return groups
})

// Delete.
const overlay = useOverlay()
const { notifySuccess, notifyError } = useNotify()
const deleteChat = client.chat.useDelete()

const isDeleting = ref(false)

const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: t('chat.delete.title'),
    description: t('chat.delete.description'),
    loading: isDeleting.value
  }
})

async function onDeleteChat(id) {
  const instance = deleteModal.open()
  const result = await instance.result

  if (!result) {
    return
  }

  try {
    isDeleting.value = true

    await deleteChat.mutateAsync({
      where: { id }
    })

    notifySuccess({
      title: t('chat.delete.success')
    })

    await refetchChats()
  }

  catch {
    notifyError({
      title: t('chat.delete.error')
    })
  }

  finally {
    isDeleting.value = false
  }

  if (route.params.id === id) {
    navigateTo('/app/chat')
  }
}

// Navigation items.
const navigationItems = computed(() =>
  groupedChats.value.flatMap(group => [
    {
      label: group.label,
      type: 'label'
    },

    ...group.items.map(item => ({
      active: route.params.id === item.id,
      class: !item.title ? 'italic opacity-50' : '',
      id: item.id,
      label: item.title || t('chat.untitled'),
      slot: 'chat',
      title: item.title || t('chat.untitled'),
      to: `/app/chat/${item.id}`
    }))
  ])
)
</script>
