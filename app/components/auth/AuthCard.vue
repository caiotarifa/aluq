<template>
  <UCard
    class="bg-white/25 backdrop-blur-sm dark:bg-white/2"
    variant="soft"
  >
    <slot />

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UCard>
</template>
