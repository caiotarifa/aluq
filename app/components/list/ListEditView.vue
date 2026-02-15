<template>
  <USlideover
    v-model:open="open"
    :description="t('listEditView.description')"
    :title="t('listEditView.title')"
    :ui="{ footer: 'justify-end' }"
    @after:enter="resetState"
  >
    <template #body>
      <section class="space-y-2">
        <header class="text-xs font-medium tracking-wide text-highlighted uppercase">
          {{ t('listEditView.viewType') }}
        </header>

        <URadioGroup
          v-model="localViewType"
          indicator="hidden"
          :items="viewTypeOptions"
          orientation="horizontal"
          :ui="{ label: 'text-dimmed', item: 'p-2 w-1/4' }"
          variant="card"
        >
          <template #label="{ item }">
            <div
              class="flex flex-col items-center gap-1"
              :class="item.value === localViewType ? 'text-primary' : ''"
            >
              <UIcon
                class="size-4"
                :name="item.icon"
              />

              <span class="font-medium">
                {{ item.label }}
              </span>
            </div>
          </template>
        </URadioGroup>
      </section>

      <section class="my-6 space-y-2 border-t border-default pt-4">
        <header class="flex items-center gap-2 text-xs font-medium tracking-wide text-highlighted uppercase">
          {{ t('listEditView.properties') }}

          <div class="ml-auto flex gap-1">
            <UTooltip :text="t('listEditView.showAll')">
              <UButton
                color="neutral"
                :disabled="allVisible"
                icon="i-tabler-eye"
                size="xs"
                variant="ghost"
                @click="showAll"
              />
            </UTooltip>

            <UTooltip :text="t('listEditView.hideAll')">
              <UButton
                color="neutral"
                :disabled="noneVisible"
                icon="i-tabler-eye-off"
                size="xs"
                variant="ghost"
                @click="hideAll"
              />
            </UTooltip>
          </div>
        </header>

        <div>
          <template
            v-for="group in propertyGroups"
            :key="group.key"
          >
            <DragDropProvider
              v-if="group.items.length > 0"
              @drag-end="group.onDragEnd"
            >
              <SortableItem
                v-for="(property, index) in group.items"
                :id="property.key"
                :key="property.key"
                class="group flex items-center gap-2 py-1.5 text-muted transition-colors"
                :class="property.pinned || property.visible ? 'hover:text-default' : 'opacity-50'"
                :index="index"
              >
                <template #default="{ drag }">
                  <UIcon
                    :ref="drag"
                    class="size-4 cursor-grab text-dimmed active:cursor-grabbing"
                    :name="appConfig.ui.icons.drag"
                  />

                  <span class="flex-1 truncate text-sm">
                    {{ property.label }}
                  </span>

                  <div class="flex items-center gap-2">
                    <UTooltip
                      v-if="property.pinned || property.visible"
                      :text="property.pinned ? t('listEditView.unpin') : t('listEditView.pin')"
                    >
                      <UButton
                        class="transition-opacity"
                        :class="property.pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                        :color="property.pinned ? 'primary' : 'neutral'"
                        :icon="property.pinned ? 'i-tabler-pinned-filled' : 'i-tabler-pin'"
                        size="xs"
                        variant="ghost"
                        @click="togglePin(property.key)"
                      />
                    </UTooltip>

                    <USwitch
                      :model-value="property.visible"
                      size="xs"
                      @update:model-value="toggleVisibility(property.key)"
                    />
                  </div>
                </template>
              </SortableItem>
            </DragDropProvider>
          </template>
        </div>
      </section>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        :label="t('actions.cancel')"
        variant="soft"
        @click="close"
      />

      <UButton
        :disabled="visibleCount === 0"
        :label="t('listEditView.apply')"
        :loading="isSaving"
        @click="apply"
      />
    </template>
  </USlideover>
</template>

<script setup>
import { DragDropProvider } from '@dnd-kit/vue'
import { arrayMove } from '@dnd-kit/helpers'

const props = defineProps({
  entity: {
    type: Object,
    required: true
  },

  query: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update'
])

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const { t } = useI18n()
const appConfig = useAppConfig()

// Views.
const viewTypeOptions = [
  {
    value: 'table',
    label: t('listEditView.viewTypes.table'),
    icon: 'i-tabler-table'
  },
  {
    value: 'cards',
    label: t('listEditView.viewTypes.cards'),
    icon: 'i-tabler-layout-grid'
  }
]

const localViewType = ref(props.query.type || 'table')

// Properties.
const localProperties = ref([])

const pinnedProperties = computed(() => {
  const result = []

  for (const property of localProperties.value) {
    if (property.pinned) {
      result.push(property)
    }
  }

  return result
})

const unpinnedProperties = computed(() => {
  const result = []

  for (const property of localProperties.value) {
    if (!property.pinned) {
      result.push(property)
    }
  }

  return result
})

function buildProperties() {
  const viewProperties = props.query.properties || []
  const pinnedLeft = props.query.pinned || []

  const propertyMap = new Map()

  for (const key in props.entity.properties) {
    const { label, type } = props.entity.properties[key]

    propertyMap.set(key, {
      key,
      label: label || key,
      type,
      visible: viewProperties.includes(key),
      pinned: pinnedLeft.includes(key)
    })
  }

  const pinned = []
  const unpinned = []

  for (const key of viewProperties) {
    if (!propertyMap.has(key)) continue

    const property = propertyMap.get(key)
    propertyMap.delete(key)

    if (property.pinned) {
      pinned.push(property)
      continue
    }

    unpinned.push(property)
  }

  for (const property of propertyMap.values()) {
    unpinned.push(property)
  }

  localProperties.value = [...pinned, ...unpinned]
}

// Drag.
function onDragEnd(group, event) {
  const { source, target } = event.operation
  if (!source || !target) return

  const reordered = arrayMove(
    group,
    source.sortable.initialIndex,
    target.sortable.index
  )

  localProperties.value = group === pinnedProperties.value
    ? [...reordered, ...unpinnedProperties.value]
    : [...pinnedProperties.value, ...reordered]
}

const propertyGroups = computed(() => [
  {
    key: 'pinned',
    items: pinnedProperties.value,
    onDragEnd: event => onDragEnd(pinnedProperties.value, event)
  },
  {
    key: 'unpinned',
    items: unpinnedProperties.value,
    onDragEnd: event => onDragEnd(unpinnedProperties.value, event)
  }
])

// State.
function resetState() {
  localViewType.value = props.query.type || 'table'
  buildProperties()
}

// Visibility.
const allVisible = computed(() =>
  localProperties.value.every(property => property.visible)
)

const noneVisible = computed(() =>
  localProperties.value.every(property => !property.visible)
)

const visibleCount = computed(() => {
  let count = 0

  for (const property of localProperties.value) {
    if (property.visible) {
      count++
    }
  }

  return count
})

function showAll() {
  for (const property of localProperties.value) {
    property.visible = true
  }
}

function hideAll() {
  for (const property of localProperties.value) {
    property.visible = false
    property.pinned = false
  }
}

function toggleVisibility(key) {
  const property = localProperties.value.find(
    item => item.key === key
  )

  if (!property) return

  property.visible = !property.visible

  if (!property.visible && property.pinned) {
    property.pinned = false
  }
}

function togglePin(key) {
  const property = localProperties.value.find(
    item => item.key === key
  )

  if (!property) return

  property.pinned = !property.pinned

  localProperties.value = [
    ...pinnedProperties.value,
    ...unpinnedProperties.value
  ]
}

// Actions.
function close() {
  open.value = false
}

const isSaving = ref(false)

function apply() {
  isSaving.value = true

  try {
    const properties = []
    const pinnedLeft = []

    for (const property of localProperties.value) {
      if (!property.visible) continue

      properties.push(property.key)

      if (property.pinned) {
        pinnedLeft.push(property.key)
      }
    }

    emit('update', {
      view: props.query.view,

      config: {
        type: localViewType.value,
        properties,

        ui: {
          pinned: { left: pinnedLeft }
        }
      }
    })

    close()
  }

  finally {
    isSaving.value = false
  }
}
</script>
