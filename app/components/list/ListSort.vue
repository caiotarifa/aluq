<template>
  <UPopover
    v-if="hasSorts"
    v-model:open="isPopoverOpen"
    :content="{ align: 'end' }"
    :ui="{ content: 'text-sm min-w-58' }"
  >
    <UButton
      :color="buttonColor"
      :icon="buttonIcon"
      :label="buttonLabel"
      :variant="buttonVariant"
    />

    <template #content>
      <header class="flex justify-between border-b border-default px-4 py-2 font-semibold">
        <div>
          Ordenar por
        </div>

        <UButton
          class="text-muted"
          color="neutral"
          label="Limpar"
          variant="ghost"
          size="xs"
          @click="clearSorts"
        />
      </header>

      <DraggableList
        v-model="model"
        class="space-y-2 p-4"
        :item="{ class: 'flex items-center gap-2' }"
      >
        <template #default="{ item: sort, index, drag }">
          <UIcon
            v-if="canDrag"
            v-bind="drag"
            :name="appConfig.ui.icons.drag"
            class="size-4 cursor-grab text-dimmed active:cursor-grabbing"
          />

          <USelectMenu
            :model-value="getFieldByKey(sort.key)"
            class="flex-1"
            :items="getAvailableFieldsForSort(sort.key)"
            variant="soft"
            size="sm"
            :ui="{ content: 'min-w-fit' }"
            @update:model-value="updateSortField(index, $event)"
          />

          <USelect
            class="w-30"
            :items="directions"
            :model-value="sort.direction"
            variant="soft"
            size="sm"
            @update:model-value="updateSortDirection(index, $event)"
          />

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="appConfig.ui.icons.close"
            @click="removeSort(sort.key)"
          />
        </template>
      </DraggableList>

      <footer
        v-if="hasAvailableFields && canAddMore"
        class="border-t border-default"
      >
        <USelectMenu
          v-model:open="isSelectOpen"
          :model-value="null"
          class="w-full rounded-t-none px-4 py-2"
          :icon="appConfig.ui.icons.plus"
          :items="availableFields"
          placeholder="Adicionar ordenação"
          variant="ghost"
          :trailing-icon="false"
          :ui="{
            content: 'min-w-fit',
            trailingIcon: 'text-muted',
            placeholder: 'text-muted'
          }"
          @update:model-value="addSort"
        />
      </footer>
    </template>
  </UPopover>

  <USelectMenu
    v-else
    :content="{ align: 'end' }"
    :icon="buttonIcon"
    :items="availableFields"
    :model-value="null"
    :placeholder="buttonLabel"
    :variant="buttonVariant"
    :trailing-icon="false"
    :ui="{ content: 'min-w-fit' }"
    @update:model-value="addSort"
  />
</template>

<script setup>
const props = defineProps({
  defaultDirection: {
    type: String,
    default: 'asc',
    validator: value => ['asc', 'desc'].includes(value)
  },

  fields: {
    type: Array,
    default: () => []
  },

  max: {
    type: Number,
    default: Infinity
  }
})

// Model.
const model = defineModel({
  type: Array,
  default: () => []
})

// Composables.
const appConfig = useAppConfig()

// Select.
const isSelectOpen = ref(false)

// Sorts.
const hasSorts = computed(() =>
  model.value.length > 0
)

const sortsCount = computed(() =>
  model.value.length
)

const canAddMore = computed(() =>
  model.value.length < props.max
)

function addSort(field) {
  if (!field || !canAddMore.value) return

  const exists = model.value.some(sort => sort.key === field.key)
  if (exists) return

  model.value = [
    ...model.value,
    { key: field.key, label: field.label, direction: props.defaultDirection }
  ]

  isSelectOpen.value = false
  openPopover()
}

function removeSort(key) {
  model.value = model.value.filter(sort => sort.key !== key)
}

function clearSorts() {
  model.value = []
}

function updateSortField(index, field) {
  if (!field) return

  const newSorts = [...model.value]

  newSorts[index] = {
    ...newSorts[index],
    key: field.key,
    label: field.label
  }

  model.value = newSorts
}

function updateSortDirection(index, direction) {
  const newSorts = [...model.value]

  newSorts[index] = {
    ...newSorts[index],
    direction
  }

  model.value = newSorts
}

// Drag.
const canDrag = computed(() =>
  sortsCount.value > 1
)

// Fields.
const fieldsMap = computed(() =>
  new Map(props.fields.map(field => [field.key, field]))
)

function getFieldByKey(key) {
  return fieldsMap.value.get(key) || null
}

const availableFields = computed(() =>
  props.fields.filter(field =>
    !model.value.some(sort => sort.key === field.key)
  )
)

function getAvailableFieldsForSort(currentKey) {
  return props.fields.filter(field =>
    field.key === currentKey || !model.value.some(sort => sort.key === field.key)
  )
}

const hasAvailableFields = computed(() =>
  availableFields.value.length > 0
)

// Button.
const buttonColor = computed(() =>
  hasSorts.value ? 'primary' : 'neutral'
)

const buttonIcon = computed(() => {
  if (sortsCount.value === 1) {
    return model.value[0].direction === 'asc'
      ? 'i-tabler-sort-ascending'
      : 'i-tabler-sort-descending'
  }

  return 'i-tabler-arrows-sort'
})

const buttonLabel = computed(() => {
  if (sortsCount.value === 1) {
    return model.value[0].label
  }

  if (sortsCount.value > 1) {
    return `${sortsCount.value} selecionados`
  }

  return 'Ordenar'
})

const buttonVariant = computed(() =>
  hasSorts.value ? 'subtle' : 'soft'
)

// Popover.
const isPopoverOpen = ref(false)

function openPopover() {
  isPopoverOpen.value = true
}

// Directions.
const directions = [
  {
    label: 'Crescente',
    value: 'asc',
    icon: 'i-tabler-sort-ascending'
  },
  {
    label: 'Decrescente',
    value: 'desc',
    icon: 'i-tabler-sort-descending'
  }
]
</script>
