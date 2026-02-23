<template>
  <span
    class="inline-flex items-center gap-1"
  >
    <UIcon
      v-if="icon"
      class="size-4 align-middle text-neutral-500"
      :name="icon"
    />

    <NuxtLink
      class="underline decoration-dotted transition-colors not-hover:decoration-neutral-500 hover:text-primary"
      :to
    >
      <slot />
    </NuxtLink>

    <UButton
      v-for="(action, index) in actions"
      :key="index"
      color="primary"
      size="xs"
      variant="link"
      v-bind="action"
      @click.stop
    />
  </span>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    default: () => []
  },

  icon: {
    type: String,
    default: ''
  },

  to: {
    type: String,
    required: true
  }
})
</script>
