<template>
  <div class="space-y-3">
    <UPageCard
      v-for="organization in organizations"
      :key="organization.id"
      class="cursor-pointer transition-opacity hover:outline hover:outline-primary"
      variant="outline"
      :class="{ 'pointer-events-none cursor-not-allowed opacity-50': loading && !isSelected(organization) }"
      @click="onSelect(organization)"
    >
      <div class="flex w-full items-center justify-between">
        <UUser
          :name="organization.name"
          :description="organization.slug"
          :avatar="{ alt: organization.name, src: organization.logo }"
          size="xl"
        />

        <UIcon
          v-if="loading && isSelected(organization)"
          class="size-5 animate-spin text-dimmed"
          name="i-tabler-loader-2"
        />

        <UIcon
          v-else
          class="size-5 text-dimmed"
          :name="appConfig.ui.icons.chevronRight"
        />
      </div>
    </UPageCard>
  </div>
</template>

<script setup>
defineProps({
  organizations: {
    type: Array,
    required: true
  }
})

const loading = defineModel('loading', {
  type: [Boolean, String],
  default: false
})

const emit = defineEmits([
  'select'
])

const appConfig = useAppConfig()

function isSelected(organization) {
  return loading.value === organization.id
}

function onSelect(organization) {
  if (loading.value) return
  emit('select', organization)
}
</script>
