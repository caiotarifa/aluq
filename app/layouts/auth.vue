<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="landing-grid absolute inset-0 z-[-1] mask-[radial-gradient(100%_100%_at_top_right,white,transparent)]" />

    <div
      class="flex w-full flex-col space-y-8"
      :class="wide ? 'max-w-3xl' : 'max-w-md'"
    >
      <header class="mb-16">
        <NuxtLink to="/">
          <UColorModeImage
            :alt="t('brand.name')"
            class="mx-auto h-8"
            dark="/images/dark/aluq.svg"
            light="/images/light/aluq.svg"
          />
        </NuxtLink>
      </header>

      <main class="relative">
        <div class="absolute -z-10 size-full rounded-full bg-radial from-(--ui-primary)/10 blur-2xl" />

        <Transition
          mode="out-in"
          name="slide-up"
        >
          <slot />
        </Transition>
      </main>

      <footer class="flex items-center justify-between">
        <div class="text-center text-xs text-dimmed">
          © {{ currentYear }}, <strong>{{ t('brand.name') }}</strong>.
        </div>

        <UButton
          color="neutral"
          label="Privacidade"
          size="xs"
          to="/privacy"
          variant="link"
        />
      </footer>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wide: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.landing-grid {
  background-size: 100px 100px;
  background-image:
    linear-gradient(to right, var(--ui-bg-accented) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-bg-accented) 1px, transparent 1px);
}

.dark {
  .landing-grid {
    background-image:
      linear-gradient(to right, var(--ui-bg-elevated) 1px, transparent 1px),
      linear-gradient(to bottom, var(--ui-bg-elevated) 1px, transparent 1px);
  }
}
</style>
