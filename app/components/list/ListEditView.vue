<template>
  <USlideover
    v-model:open="open"
    :description="t('listEditView.description')"
    :title="t('listEditView.title')"
    :ui="{ footer: 'justify-end' }"
    @update:open="resetState"
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

        <DraggableList
          v-model="localProperties"
          class="space-y-1"
        >
          <template #default="{ item: property, drag }">
            <div
              class="group flex items-center gap-2 py-1.5 text-muted transition-colors"
              :class="property.visible ? 'hover:text-default' : 'opacity-50'"
            >
              <UIcon
                v-bind="drag"
                class="size-4 text-dimmed"
                :name="appConfig.ui.icons.drag"
              />

              <span class="flex-1 truncate text-sm">
                {{ property.label }}
              </span>

              <div class="flex items-center gap-2">
                <UTooltip
                  v-if="property.visible"
                  :text="property.pinned ? t('listEditView.unpin') : t('listEditView.pin')"
                >
                  <UButton
                    class="transition-opacity"
                    :class=" property.pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
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
            </div>
          </template>
        </DraggableList>
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
const props = defineProps({
  entity: {
    type: Object,
    required: true
  },

  view: {
    type: String,
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

const isSaving = ref(false)

// Views.
const viewConfig = computed(() =>
  props.entity.views?.[props.view] || {}
)

const viewTypeOptions = [
  {
    value: 'table',
    label: t('listEditView.viewTypes.table'),
    icon: 'i-tabler-table'
  }
]

const localViewType = ref(viewConfig.value.type || 'table')

// Properties.
const entityProperties = computed(() => {
  const result = []

  for (const key in props.entity.properties) {
    result.push({
      key,
      label: props.entity.properties[key].label || key,
      type: props.entity.properties[key].type
    })
  }

  return result
})

function buildLocalProperties() {
  const viewProperties = viewConfig.value.properties || []
  const pinnedLeft = viewConfig.value.ui?.pinned?.left || []

  const propertyMap = new Map()

  for (const property of entityProperties.value) {
    propertyMap.set(property.key, {
      ...property,

      visible: viewProperties.includes(property.key),
      pinned: pinnedLeft.includes(property.key)
    })
  }

  const orderedProperties = []

  for (const key of viewProperties) {
    if (propertyMap.has(key)) {
      orderedProperties.push(
        propertyMap.get(key)
      )

      propertyMap.delete(key)
    }
  }

  for (const [, property] of propertyMap) {
    orderedProperties.push(property)
  }

  return orderedProperties
}

const localProperties = ref(buildLocalProperties())

// State.
function resetState() {
  localViewType.value = viewConfig.value.type || 'table'
  localProperties.value = buildLocalProperties()
}

// Visibility.
const allVisible = computed(() =>
  localProperties.value.every(property => property.visible)
)

const noneVisible = computed(() =>
  localProperties.value.every(property => !property.visible)
)

const visibleCount = computed(() =>
  localProperties.value.filter(property => property.visible).length
)

function showAll() {
  for (const property of localProperties.value) {
    property.visible = true
  }
}

function hideAll() {
  for (const property of localProperties.value) {
    property.visible = false
  }
}

function toggleVisibility(key) {
  const property = localProperties.value.find(item =>
    item.key === key
  )

  if (property) {
    property.visible = !property.visible
  }

  if (!property.visible) {
    property.pinned = false
  }
}

function togglePin(key) {
  const property = localProperties.value.find(item =>
    item.key === key
  )

  if (property) {
    property.pinned = !property.pinned
  }
}

// Actions.
function close() {
  open.value = false
}

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
      view: props.view,

      config: {
        ...viewConfig.value,

        type: localViewType.value,
        properties,

        ui: {
          ...viewConfig.value.ui,

          pinned: {
            ...viewConfig.value.ui?.pinned,
            left: pinnedLeft
          }
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
