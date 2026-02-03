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
      />
    </UDashboardSidebar>
  </NuxtLayout>
</template>

<script setup>
const appConfig = useAppConfig()
const route = useRoute()
const { t, d } = useI18n()

// Fetch chats.
const { client } = useRemote()

const { data: chats } = client.chat.useFindMany(() => ({
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

// Group chats by date.
const groupedChats = computed(() => {
  if (!chats.value) return []

  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const groupsMap = new Map()

  const getGroupKey = (chatDate) => {
    const diff = Math.floor(
      (today - chatDate) / (1000 * 60 * 60 * 24)
    )

    if (diff === 0) {
      return {
        id: 'today',
        label: t('chat.groups.today')
      }
    }

    if (diff === 1) {
      return {
        id: 'yesterday',
        label: t('chat.groups.yesterday')
      }
    }

    if (diff <= 7) {
      return {
        id: 'last-week',
        label: t('chat.groups.lastWeek')
      }
    }

    if (diff <= 30) {
      return {
        id: 'last-month',
        label: t('chat.groups.lastMonth')
      }
    }

    return {
      id: `${chatDate.getFullYear()}-${String(chatDate.getMonth() + 1).padStart(2, '0')}`,
      label: d(chatDate, 'monthYear')
    }
  }

  const sortedChats = [...chats.value].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt).getTime()
    const bTime = new Date(b.updatedAt || b.createdAt).getTime()

    return bTime - aTime
  })

  for (const chat of sortedChats) {
    const chatDate = new Date(chat.updatedAt || chat.createdAt)
    chatDate.setHours(0, 0, 0, 0)

    const { id, label } = getGroupKey(chatDate)

    if (!groupsMap.has(id)) {
      groupsMap.set(id, { id, label, items: [] })
    }

    groupsMap.get(id).items.push(chat)
  }

  return Array.from(groupsMap.values())
})

const navigationItems = computed(() =>
  groupedChats.value.flatMap(group => [
    {
      label: group.label,
      type: 'label'
    },

    ...group.items.map(item => ({
      label: item.title || t('chat.untitled'),
      title: item.title || t('chat.untitled'),
      to: `/app/chat/${item.id}`,
      class: !item.title ? 'italic opacity-50' : '',
      active: route.params.id === item.id
    }))
  ])
)
</script>
