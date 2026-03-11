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

    <UTooltip
      v-for="(action, index) in actions"
      :key="index"
      :text="action.title"
    >
      <UButton
        color="primary"
        size="xs"
        variant="link"
        v-bind="removeAttrs(action, ['title'])"
        @click.stop
      />
    </UTooltip>
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

function removeAttrs(object, keys) {
  const result = {}

  for (const key in object) {
    if (!keys.includes(key)) {
      result[key] = object[key]
    }
  }

  return result
}
</script>
