<template>
  <div class="my-2 rounded-lg border border-default">
    <div
      v-if="isLoading"
      class="flex items-center gap-2 p-4 text-dimmed"
    >
      <UIcon
        name="i-tabler-loader-2"
        class="animate-spin"
      />

      <span>Buscando dados...</span>
    </div>

    <div
      v-else-if="errorText"
      class="p-4 text-error"
    >
      {{ errorText }}
    </div>

    <template v-else-if="output">
      <div
        v-if="output.status === 'error'"
        class="p-4 text-error"
      >
        {{ output.error?.message || 'Erro ao buscar dados.' }}
      </div>

      <template v-else>
        <div
          class="flex items-center justify-between
            border-b border-default px-4 py-2"
        >
          <span class="text-sm font-medium">
            {{ output.meta?.label || output.meta?.model }}
          </span>

          <span class="text-xs text-dimmed">
            {{ output.meta?.count }} registro(s)

            <template v-if="output.meta?.total">
              de {{ output.meta.total }}
            </template>
          </span>
        </div>

        <div
          v-if="!output.data?.length"
          class="p-4 text-dimmed"
        >
          Nenhum registro encontrado.
        </div>

        <UTable
          v-else
          :columns
          :data="output.data"
          class="max-h-96 overflow-auto"
        />
      </template>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  part: {
    type: Object,
    required: true
  }
})

const isLoading = computed(() =>
  props.part.state === 'input-streaming'
  || props.part.state === 'input-available'
  || props.part.state === 'approval-requested'
  || props.part.state === 'approval-responded'
)

const output = computed(() =>
  props.part.state === 'output-available'
    ? props.part.output
    : null
)

const errorText = computed(() =>
  props.part.state === 'output-error'
    ? props.part.errorText
    : null
)

const columns = computed(() => {
  const fields = output.value?.meta?.fields

  if (fields) {
    return Object.entries(fields).map(
      ([key, label]) => ({
        accessorKey: key,
        header: label
      })
    )
  }

  const data = output.value?.data
  if (!data?.length) return []

  return Object.keys(data[0])
    .filter(key => typeof data[0][key] !== 'object')
    .map(key => ({
      accessorKey: key,
      header: key
    }))
})
</script>
