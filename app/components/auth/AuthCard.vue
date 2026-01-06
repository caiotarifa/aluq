<template>
  <UCard
    class="backdrop-blur bg-white/25 dark:bg-white/2"
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
