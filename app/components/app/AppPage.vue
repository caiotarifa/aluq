<template>
  <NuxtLayout name="app">
    <UDashboardPanel :ui>
      <template #header>
        <UDashboardNavbar>
          <template #left>
            <div class="py-0">
              <h1
                v-if="title"
                class="text-2xl"
              >
                {{ title }}
              </h1>

              <USkeleton
                v-else
                class="my-1.5 h-6 w-48"
              />

              <UBreadcrumb
                :items="breadcrumbItems"
                separator-icon="i-tabler-slash"
              />
            </div>
          </template>

          <template #right>
            <div class="flex gap-2">
              <UButton
                v-for="(action, index) in mainActions"
                :key="index"
                color="neutral"
                size="lg"
                variant="soft"
                v-bind="action"
              />

              <UDropdownMenu
                v-if="dropdownActions.length"
                :items="dropdownActions"
                :ui="{ content: 'w-48' }"
              >
                <UButton
                  color="neutral"
                  icon="i-tabler-dots"
                  size="lg"
                  variant="ghost"
                />
              </UDropdownMenu>
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <main
          id="main"
          class="flex-1"
          role="main"
        >
          <slot />
        </main>
      </template>
    </UDashboardPanel>
  </NuxtLayout>
</template>

<script setup>
const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  },

  breadcrumb: {
    type: Array,
    default: () => []
  },

  badge: {
    type: [Number, String],
    default: ''
  },

  menuItems: {
    type: Array,
    default: () => []
  },

  title: {
    type: String,
    default: ''
  },

  ui: {
    type: Object,
    default: () => ({})
  }
})

// Title.
useHead({
  title: props.title
})

// Breadcrumb.
const breadcrumbItems = computed(() => {
  const home = { icon: 'i-tabler-home', to: '/' }

  if (props.breadcrumb.length) {
    return [home, ...props.breadcrumb]
  }

  return [home, { label: props.title }]
})

// Actions.
const mainActions = computed(() =>
  props.actions[0]
)

const dropdownActions = computed(() =>
  props.actions.slice(1)
)
</script>
