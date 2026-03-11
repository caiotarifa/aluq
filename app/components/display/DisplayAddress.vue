<template>
  <div v-if="formatted">
    <p v-if="formatted.first">
      {{ formatted.first }}
    </p>

    <p
      v-if="formatted.second"
      class="text-sm text-dimmed"
    >
      {{ formatted.second }}
    </p>

    <p
      v-if="formatted.third"
      class="text-sm text-dimmed"
    >
      {{ formatted.third }}
    </p>
  </div>

  <span v-else>
    –
  </span>
</template>

<script setup>
const model = defineModel({
  type: Object,
  default: null
})

const { lines: formatted } = useAddress(() => model.value)
</script>
