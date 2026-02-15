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
          size="xs"
          variant="ghost"
          @click="clearSorts"
        />
      </header>

      <DragDropProvider @drag-end="onDragEnd">
        <div class="space-y-2 p-4">
          <SortableItem
            v-for="(sort, index) in model"
            :id="sort.property"
            :key="sort.property"
            class="flex items-center gap-2"
            :index="index"
          >
            <template #default="{ drag }">
              <UIcon
                v-if="canDrag"
                :ref="drag"
                class="size-4 cursor-grab text-dimmed active:cursor-grabbing"
                :name="appConfig.ui.icons.drag"
              />

              <USelectMenu
                class="w-full flex-1"
                :icon="entity.properties[sort.property]?.icon"
                :items="getAvailablePropertiesFor(sort.property)"
                :model-value="sort.property"
                size="sm"
                :ui="{ content: 'min-w-fit' }"
                value-key="key"
                variant="soft"
                @update:model-value="updateSort(sort.property, { property: $event })"
              />

              <USelect
                class="w-34"
                :icon="directionsMap[sort.direction]"
                :items="directions"
                :model-value="sort.direction"
                size="sm"
                variant="soft"
                @update:model-value="updateSort(sort.property, { direction: $event })"
              />

              <UButton
                color="neutral"
                :icon="appConfig.ui.icons.close"
                size="sm"
                variant="ghost"
                @click="removeSort(sort.property)"
              />
            </template>
          </SortableItem>
        </div>
      </DragDropProvider>

      <footer
        v-if="hasAvailableProperties && canAddMore"
        class="border-t border-default"
      >
        <USelectMenu
          v-model:open="isSelectOpen"
          class="w-full rounded-t-none px-4 py-2"
          :icon="appConfig.ui.icons.plus"
          :items="availableProperties"
          :model-value="null"
          placeholder="Adicionar ordenação"
          :trailing-icon="false"
          :ui="{
            content: 'min-w-fit',
            trailingIcon: 'text-muted',
            placeholder: 'text-muted'
          }"
          variant="ghost"
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
    :trailing-icon="false"
    :ui="{ content: 'min-w-fit' }"
    :variant="buttonVariant"
    @update:model-value="addSort"
  />
</template>

<script setup>
import { DragDropProvider } from '@dnd-kit/vue'
import { arrayMove } from '@dnd-kit/helpers'

const props = defineProps({
  defaultDirection: {
    type: String,
    default: 'asc',
    validator: value => ['asc', 'desc'].includes(value)
  },

  entity: {
    type: Object,
    required: true
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

// Sorts.
const sortsCount = computed(() => model.value.length)
const hasSorts = computed(() => sortsCount.value > 0)
const canAddMore = computed(() => sortsCount.value < props.max)
const canDrag = computed(() => sortsCount.value > 1)

function onDragEnd(event) {
  const { source, target } = event.operation
  if (!source || !target) return

  model.value = arrayMove(
    model.value,
    source.sortable.initialIndex,
    target.sortable.index
  )
}

function addSort(item) {
  if (!item || !canAddMore.value) return

  const exists = model.value.some(
    sort => sort.property === item.key
  )

  if (exists) return

  model.value = [
    ...model.value,
    { property: item.key, direction: props.defaultDirection }
  ]

  isSelectOpen.value = false
  isPopoverOpen.value = true
}

function updateSort(property, updates) {
  for (const sort of model.value) {
    if (sort.property !== property) continue

    Object.assign(sort, updates)
    break
  }

  model.value = [...model.value]
}

function removeSort(property) {
  model.value = model.value.filter(
    sort => sort.property !== property
  )
}

function clearSorts() {
  model.value = []
}

// Properties.
const sortableProperties = computed(() => {
  const result = {}

  for (const key in props.entity.properties) {
    const property = props.entity.properties[key]

    if (property.sortable !== false) {
      result[key] = property
    }
  }

  return result
})

const propertyItems = computed(() => {
  const result = []

  for (const key in sortableProperties.value) {
    const property = sortableProperties.value[key]

    result.push({
      key,
      label: property.label,
      icon: property.icon
    })
  }

  return result
})

const availableProperties = computed(() =>
  propertyItems.value.filter(item =>
    !model.value.some(sort => sort.property === item.key)
  )
)

const hasAvailableProperties = computed(() =>
  availableProperties.value.length > 0
)

function getAvailablePropertiesFor(currentProperty) {
  return propertyItems.value.filter(item =>
    item.key === currentProperty
    || !model.value.some(sort => sort.property === item.key)
  )
}

// Popover & Select.
const isPopoverOpen = ref(false)
const isSelectOpen = ref(false)

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

const directionsMap = {
  asc: 'i-tabler-sort-ascending',
  desc: 'i-tabler-sort-descending'
}

// Button.
const buttonColor = computed(() =>
  hasSorts.value ? 'primary' : 'neutral'
)

const buttonIcon = computed(() => {
  if (sortsCount.value === 1) {
    return directionsMap[model.value[0].direction]
  }

  return 'i-tabler-arrows-sort'
})

const buttonLabel = computed(() => {
  if (sortsCount.value === 1) {
    const { property } = model.value[0]
    return sortableProperties.value[property]?.label || property
  }

  if (sortsCount.value > 1) {
    return `${sortsCount.value} selecionados`
  }

  return 'Ordenar'
})

const buttonVariant = computed(() =>
  hasSorts.value ? 'subtle' : 'soft'
)
</script>
