<template>
  <UDropdownMenu
    :content="{ align: 'center', collisionPadding: 12 }"
    :items
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="currentUser"
      block
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      color="neutral"
      :square="collapsed"
      :trailing-icon="collapsed ? undefined : 'i-tabler-selector'"
      :ui="{ trailingIcon: 'text-dimmed' }"
      variant="ghost"
    />

    <template #language>
      <ULocaleSelect
        class="w-full"
        :content="{ side: 'right' }"
        :locales="[en, pt_br]"
        :model-value="locale"
        side="right"
        :trailing-icon="appConfig.ui.icons.chevronRight"
        :ui="{ base: 'ps-8', leading: 'ps-1.5' }"
        variant="ghost"
        @update:model-value="setLocale($event)"
      />
    </template>
  </UDropdownMenu>
</template>

<script setup>
import { en, pt_br } from '@nuxt/ui/locale'

const props = defineProps({
  avatar: {
    type: String,
    default: undefined
  },

  collapsed: {
    type: Boolean,
    default: false
  },

  description: {
    type: String,
    default: undefined
  },

  name: {
    type: String,
    required: true
  }
})

const appConfig = useAppConfig()
const colorMode = useColorMode()
const { locale, setLocale } = useI18n()

const currentUser = computed(() => ({
  label: props.collapsed ? undefined : props.name,

  avatar: {
    alt: props.name,
    src: props.avatar
  }
}))

const colorModeIcon = computed(() =>
  colorMode.value === 'dark'
    ? appConfig.ui.icons.dark
    : appConfig.ui.icons.light
)

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const items = computed(() => [
  [
    {
      type: 'label',
      label: props.name,
      description: props.description
    }
  ],

  [
    {
      label: 'Meus dados',
      icon: 'i-tabler-adjustments',
      to: '/users/me'
    }
  ],

  [
    {
      icon: colorModeIcon.value,
      label: colorMode.value === 'dark' ? 'Tema escuro' : 'Tema claro',
      onSelect: toggleColorMode
    },
    {
      class: 'p-0',
      slot: 'language',
      onSelect: event => event.preventDefault()
    }
  ],

  [
    {
      label: 'Desconectar',
      icon: 'i-tabler-logout',
      to: '/auth/logout'
    }
  ]
])
</script>
