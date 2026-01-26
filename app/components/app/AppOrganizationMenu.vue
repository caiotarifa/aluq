<template>
  <UDropdownMenu
    :content="{ align: 'center', collisionPadding: 12 }"
    :disabled="loading"
    :items
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="currentOrganization"
      block
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      color="neutral"
      :disabled="loading"
      :loading
      :square="collapsed"
      :trailing-icon="collapsed ? undefined : 'i-tabler-selector'"
      :ui="{ trailingIcon: 'text-dimmed' }"
      variant="ghost"
    />
  </UDropdownMenu>
</template>

<script setup>
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },

  loading: {
    type: Boolean,
    default: false
  },

  organizations: {
    type: Array,
    required: true
  }
})

const model = defineModel({
  type: [String, Number],
  required: false
})

const { t } = useI18n()

const organizationItems = computed(() =>
  props.organizations.map(organization => ({
    label: organization.name,
    value: organization.id,

    avatar: {
      alt: organization.name,
      src: organization?.logo
    }
  }))
)

const currentOrganization = computed(() =>
  organizationItems.value.find(
    organization => organization.value === model.value
  )
)

const items = computed(() => [
  organizationItems.value.map(item => ({
    ...item,
    type: 'checkbox',
    checked: item.value === model.value,
    onSelect: () => { model.value = item.value }
  })),

  [
    {
      label: t('appOrganizationMenu.createOrganization'),
      icon: 'i-tabler-plus'
    },
    {
      label: t('appOrganizationMenu.manageOrganizations'),
      icon: 'i-tabler-settings'
    }
  ]
])
</script>
