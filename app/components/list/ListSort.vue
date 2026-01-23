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
        <template #default="{ item: sort, drag }">
          <UIcon
            v-if="canDrag"
            v-bind="drag"
            :name="appConfig.ui.icons.drag"
            class="size-4 cursor-grab text-dimmed active:cursor-grabbing"
          />

          <USelectMenu
            :model-value="sort.property"
            class="flex-1"
            :items="getAvailablePropertiesFor(sort.property)"
            value-key="key"
            variant="soft"
            size="sm"
            :ui="{ content: 'min-w-fit' }"
            @update:model-value="updateSortProperty(sort.property, $event)"
          />

          <USelect
            class="w-30"
            :items="directions"
            :model-value="sort.direction"
            variant="soft"
            size="sm"
            @update:model-value="updateSortDirection(sort.property, $event)"
          />

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="appConfig.ui.icons.close"
            @click="removeSort(sort.property)"
          />
        </template>
      </DraggableList>

      <footer
        v-if="hasAvailableProperties && canAddMore"
        class="border-t border-default"
      >
        <USelectMenu
          v-model:open="isSelectOpen"
          :model-value="null"
          class="w-full rounded-t-none px-4 py-2"
          :icon="appConfig.ui.icons.plus"
          :items="availableProperties"
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
    :items="availableProperties"
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

  properties: {
    type: Object,
    default: () => ({})
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
const sortsCount = computed(() => model.value.length)
const hasSorts = computed(() => sortsCount.value > 0)
const canAddMore = computed(() => sortsCount.value < props.max)

function addSort(item) {
  if (!item || !canAddMore.value) return

  const exists = model.value.some(sort => sort.property === item.key)
  if (exists) return

  model.value = [
    ...model.value,
    { property: item.key, direction: props.defaultDirection }
  ]

  isSelectOpen.value = false
  openPopover()
}

function removeSort(property) {
  model.value = model.value.filter(sort => sort.property !== property)
}

function clearSorts() {
  model.value = []
}

function updateSortProperty(oldProperty, newProperty) {
  if (!newProperty || oldProperty === newProperty) return

  model.value = model.value.map(sort =>
    sort.property === oldProperty ? { ...sort, property: newProperty } : sort
  )
}

function updateSortDirection(property, direction) {
  model.value = model.value.map(sort =>
    sort.property === property ? { ...sort, direction } : sort
  )
}

// Drag.
const canDrag = computed(() =>
  sortsCount.value > 1
)

// Properties.
const propertyItems = computed(() => {
  const result = []

  for (const key in props.properties) {
    result.push({ key, label: props.properties[key].label })
  }

  return result
})

const availableProperties = computed(() =>
  propertyItems.value.filter(item =>
    !model.value.some(sort => sort.property === item.key)
  )
)

function getAvailablePropertiesFor(currentProperty) {
  return propertyItems.value.filter(item =>
    item.key === currentProperty
    || !model.value.some(sort => sort.property === item.key)
  )
}

const hasAvailableProperties = computed(() =>
  availableProperties.value.length > 0
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
    const { property } = model.value[0]
    return props.properties[property]?.label || property
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
