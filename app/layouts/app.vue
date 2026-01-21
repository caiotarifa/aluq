<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      v-model:open="open"
      class="bg-elevated/25"
      collapsible
      resizable
      :ui="{
        footer: 'lg:border-t lg:border-default flex-col px-0',
        header: 'justify-between'
      }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          class="block h-6"
          :class="{ 'text-center': collapsed }"
          to="/app"
        >
          <UColorModeImage
            :alt="t('brand.name')"
            class="mx-auto h-6"
            dark="/images/dark/aluq.svg"
            light="/images/light/aluq.svg"
          />

          <UDashboardSidebarCollapse
            v-if="!collapsed"
            class="p-0 opacity-25 hover:opacity-50"
          />
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          class="bg-transparent ring-default"
          :collapsed
        />

        <UNavigationMenu
          :collapsed
          :items="menu"
          orientation="vertical"
          popover
          tooltip
        />

        <UNavigationMenu
          class="mt-auto"
          :collapsed
          :items="links"
          orientation="vertical"
          tooltip
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="w-full px-4 py-2 lg:border-b lg:border-default">
          <div
            v-if="!collapsed"
            class="px-3 text-[0.6rem] tracking-wider text-dimmed uppercase"
          >
            Organização
          </div>

          <AppOrganizationMenu
            :collapsed
            :loading="isFetchingOrganizations || isSettingActiveOrganization"
            :model-value="activeOrganizationId"
            :organizations
            @update:model-value="onChangeOrganization"
          />
        </div>

        <div class="w-full px-4">
          <AppUserMenu
            :collapsed
            :description="currentUser?.email"
            :name="currentUser?.name"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup>
const open = ref(false)
const { t } = useI18n()

const { activeOrganizationId, currentUser } = useAuth()

const {
  organizations,
  fetchOrganizations,
  setActiveOrganization,

  isFetchingOrganizations,
  isSettingActiveOrganization
} = useOrganization()

// Fetch organizations.
await useAsyncData('app:organizations', () =>
  fetchOrganizations()
)

// Change organization.
async function onChangeOrganization(organizationId) {
  await setActiveOrganization(organizationId)
  location.reload()
}

// Menu.
const menu = [
  {
    label: 'Dashboard',
    icon: 'i-tabler-dashboard',
    to: '/app'
  },

  {
    label: 'Clientes',
    icon: 'i-tabler-users',
    to: '/app/customers'
  },

  {
    label: 'Vendas',
    icon: 'i-tabler-cash',

    children: [
      {
        label: 'Orçamentos',
        icon: 'i-tabler-shopping-cart',
        to: '/app/quotes'
      },

      {
        label: 'Reservas',
        icon: 'i-tabler-calendar-dollar',
        to: '/app/bookings'
      },

      {
        label: 'Aluguéis',
        icon: 'i-tabler-credit-card-pay',
        to: '/app/rentals'
      }
    ]
  },

  {
    label: 'Operações',
    icon: 'i-tabler-truck',

    children: [
      {
        label: 'Expedição',
        icon: 'i-tabler-truck-loading',
        to: '/app/dispatches'
      },

      {
        label: 'Retiradas',
        icon: 'i-tabler-package-export',
        to: '/app/check-outs'
      },

      {
        label: 'Devoluções',
        icon: 'i-tabler-package-import',
        to: '/app/check-ins'
      }
    ]
  },

  {
    label: 'Inventário',
    icon: 'i-tabler-box',

    children: [
      {
        label: 'Catálogo',
        icon: 'i-tabler-library',
        to: '/app/products'
      },

      {
        label: 'Itens',
        icon: 'i-tabler-package',
        to: '/app/assets'
      },

      {
        label: 'Conjuntos',
        icon: 'i-tabler-assembly',
        to: '/app/sets'
      },

      {
        label: 'Categorias',
        icon: 'i-tabler-tags',
        to: '/app/categories'
      }
    ]
  },

  {
    label: 'Financeiro',
    icon: 'i-tabler-wallet',

    children: [
      {
        label: 'Faturas',
        icon: 'i-tabler-file-invoice',
        to: '/app/invoices'
      },

      {
        label: 'Recebíveis',
        icon: 'i-tabler-cash-banknote-move-back',
        to: '/app/receivables'
      }
    ]
  },

  {
    label: 'Relatórios',
    icon: 'i-tabler-chart-bar',
    to: '/app/reports'
  },

  {
    label: 'Configurações',
    icon: 'i-tabler-settings',

    children: [
      {
        label: 'Empresas',
        icon: 'i-tabler-building-store',
        to: '/app/business-units'
      },

      {
        label: 'Unidades',
        icon: 'i-tabler-map-pin',
        to: '/app/locations'
      },

      {
        label: 'Preços',
        icon: 'i-tabler-businessplan',
        to: '/app/prices'
      },

      {
        label: 'Usuários',
        icon: 'i-tabler-user-circle',
        to: '/app/users'
      }
    ]
  }
]

const links = [
  {
    label: 'Assinatura',
    icon: 'i-tabler-crown',
    to: '/app/subscription'
  },
  {
    label: 'Suporte',
    icon: 'i-tabler-lifebuoy',
    to: '/app/help'
  }
]
</script>
