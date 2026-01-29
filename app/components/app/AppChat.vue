<template>
  <NuxtLayout name="app">
    <UDashboardPanel
      class="relative"
      :ui="{ body: 'pb-0 sm:pb-0' }"
    >
      <slot />
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
          variant="soft"
        >
          Novo Chat
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

// Chats.
const chats = computed(() => [
  {
    id: 'chat-0',
    label: 'Sem título',
    updatedAt: '2026-01-28T12:00:00Z'
  },
  {
    id: 'chat-1',
    label: 'Planejamento de Viagem',
    updatedAt: '2026-01-28T10:15:00Z'
  },
  {
    id: 'chat-2',
    label: 'Ideias para Blog',
    updatedAt: '2026-01-27T09:30:00Z'
  },
  {
    id: 'chat-3',
    label: 'Projeto de Aplicativo',
    updatedAt: '2026-01-18T08:45:00Z'
  },
  {
    id: 'chat-4',
    label: 'Lista de Compras',
    updatedAt: '2026-01-01T14:20:00Z'
  },
  {
    id: 'chat-5',
    label: 'Pesquisa de Mercado',
    updatedAt: '2025-12-15T11:10:00Z'
  },
  {
    id: 'chat-6',
    label: 'Roteiro de Filme',
    updatedAt: '2025-11-30T10:00:00Z'
  }
])

const groupedChats = computed(() => {
  const now = new Date()

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const groupsMap = new Map()

  const getGroupKey = (chatDate) => {
    const diff = Math.floor(
      (today - chatDate) / (1000 * 60 * 60 * 24)
    )

    if (diff === 0) {
      return { id: 'today', label: 'Hoje' }
    }

    if (diff === 1) {
      return { id: 'yesterday', label: 'Ontem' }
    }

    if (diff <= 7) {
      return { id: 'last-week', label: 'Esta semana' }
    }

    if (diff <= 30) {
      return { id: 'last-month', label: 'Este mês' }
    }

    const year = chatDate.getFullYear()
    const month = chatDate.getMonth()

    const monthName = chatDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })

    const capitalizedMonth = monthName.charAt(0).toUpperCase()
      + monthName.slice(1)

    return {
      id: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: capitalizedMonth
    }
  }

  for (const chat of chats.value) {
    const chatDate = new Date(chat.updatedAt)
    chatDate.setHours(0, 0, 0, 0)

    const { id, label } = getGroupKey(chatDate)

    if (!groupsMap.has(id)) {
      groupsMap.set(id, { id, label, items: [] })
    }

    groupsMap.get(id).items.push(chat)
  }

  return Array.from(groupsMap.values())
})

const navigationItems = computed(() => groupedChats.value?.flatMap(group => [
  {
    label: group.label,
    type: 'label'
  },

  ...group.items.map(item => ({
    ...item,
    slot: 'chat',
    icon: undefined,
    class: item.label === 'Sem título' ? 'italic' : ''
  }))
]))
</script>
