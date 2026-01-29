<template>
  <header class="text-center">
    <div
      class="mx-auto flex size-18 items-center justify-center rounded-full"
      :class="backgroundClass"
    >
      <UIcon
        class="size-8"
        :class="[textClass, loading ? 'animate-spin' : '']"
        :name="loading ? 'i-tabler-loader-2' : icon"
      />
    </div>

    <h4 class="mt-4 text-lg font-medium">
      {{ title }}
    </h4>

    <p
      v-if="description"
      class="mt-1 text-sm text-dimmed"
    >
      {{ description }}
    </p>
  </header>
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    default: 'primary'
  },

  description: {
    type: String,
    default: ''
  },

  icon: {
    type: String,
    default: 'i-tabler-circle-check'
  },

  loading: {
    type: Boolean,
    default: false
  },

  title: {
    type: String,
    required: true
  }
})

const colorClasses = {
  primary: {
    background: 'bg-primary/10',
    text: 'text-primary'
  },

  success: {
    background: 'bg-success/10',
    text: 'text-success'
  },

  error: {
    background: 'bg-error/10',
    text: 'text-error'
  },

  warning: {
    background: 'bg-warning/10',
    text: 'text-warning'
  },

  neutral: {
    background: 'bg-neutral/10',
    text: 'text-neutral'
  }
}

const backgroundClass = computed(() =>
  colorClasses[props.color]?.background || colorClasses.primary.background
)

const textClass = computed(() =>
  colorClasses[props.color]?.text || colorClasses.primary.text
)
</script>
