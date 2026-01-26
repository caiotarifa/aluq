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
const { locale, setLocale, t } = useI18n()

const currentUser = computed(() => ({
  label: props.collapsed ? undefined : props.name,

  avatar: {
    alt: props.name,
    src: props.avatar
  }
}))

const isDarkMode = computed(() =>
  colorMode.value === 'dark'
)

const colorModeIcon = computed(() =>
  isDarkMode.value ? appConfig.ui.icons.light : appConfig.ui.icons.dark
)

function toggleColorMode() {
  colorMode.preference = isDarkMode.value ? 'light' : 'dark'
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
      label: t('appUserMenu.profile'),
      icon: 'i-tabler-adjustments',
      to: '/users/me'
    }
  ],

  [
    {
      icon: colorModeIcon.value,
      label: t(`appUserMenu.${isDarkMode.value ? 'light' : 'dark'}Theme`),
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
      label: t('appUserMenu.signOut'),
      icon: 'i-tabler-logout',
      to: '/auth/logout'
    }
  ]
])
</script>
