<template>
  <div class="flex items-center min-h-screen justify-center p-4">
    <div class="landing-grid absolute inset-0 z-[-1] mask-[radial-gradient(100%_100%_at_top_right,white,transparent)]" />

    <div
      class="flex flex-col space-y-8 w-full"
      :class="wide ? 'max-w-3xl' : 'max-w-md'"
    >
      <header class="mb-16">
        <NuxtLink to="/">
          <UColorModeImage
            :alt="t('brand.name')"
            class="h-8 mx-auto"
            dark="/images/dark/aluq.svg"
            light="/images/light/aluq.svg"
          />
        </NuxtLink>
      </header>

      <main class="relative">
        <div class="absolute blur-2xl bg-radial from-(--ui-primary)/10 rounded-full size-full -z-10" />

        <Transition
          mode="out-in"
          name="slide-up"
        >
          <slot />
        </Transition>
      </main>

      <footer class="flex justify-between items-center">
        <div class="text-center text-dimmed text-xs">
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
