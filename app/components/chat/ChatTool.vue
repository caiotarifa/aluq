<template>
  <div class="my-8 rounded-md border border-default bg-elevated/25 p-4">
    <header
      v-if="title"
      class="flex items-center justify-between border-b border-default pb-4"
    >
      <slot
        :actions
        name="header"
        :title
      >
        <h3
          v-if="title"
          class="text-sm text-dimmed"
        >
          {{ title }}
        </h3>

        <div
          class="flex gap-2"
        >
          <slot name="actions">
            <UButton
              v-for="(action, index) in actions"
              :key="index"
              color="neutral"
              size="xs"
              variant="soft"
              v-bind="action"
            />
          </slot>
        </div>
      </slot>
    </header>

    <div class="space-y-4 pt-4">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    default: () => []
  },

  title: {
    type: String,
    required: true
  }
})
</script>
