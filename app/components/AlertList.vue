<template>
  <UAlert>
    <template #description>
      {{ description }}

      <ul
        v-if="items.length > 0"
        class="mt-2 space-y-1 text-xs"
      >
        <li
          v-for="(item, index) in visibleItems"
          :key="index"
          class="flex items-start gap-2"
        >
          <UIcon
            class="mt-px size-3.5 shrink-0"
            name="i-tabler-point"
          />
          <span>{{ item }}</span>
        </li>

        <li
          v-if="hiddenCount > 0"
          class="opacity-50"
        >
          {{ t('alertList.more', { count: hiddenCount }) }}
        </li>
      </ul>
    </template>
  </UAlert>
</template>

<script setup>
const { t } = useI18n()

const props = defineProps({
  description: {
    type: String,
    default: ''
  },

  items: {
    type: Array,
    default: () => []
  },

  limit: {
    type: Number,
    default: 5
  }
})

const visibleItems = computed(() =>
  props.items.slice(0, props.limit)
)

const hiddenCount = computed(() =>
  Math.max(0, props.items.length - props.limit)
)
</script>
