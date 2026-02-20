<template>
  <div class="flex flex-wrap items-center gap-2">
    <UPopover
      v-for="filter in filters"
      :key="filter.property"
      :content="{ align: 'start' }"
      :ui="{ content: 'text-sm min-w-72' }"
    >
      <UButton
        :class="isValueEmpty(filter.value) ? 'bg-elevated/50 text-dimmed hover:bg-elevated' : ''"
        :color="isValueEmpty(filter.value) ? 'neutral' : 'primary'"
        :icon="filter.propertyConfig?.icon"
        :trailing-icon="appConfig.ui.icons.chevronDown"
        :variant="isValueEmpty(filter.value) ? 'soft' : 'subtle'"
      >
        <MDC
          tag="span"
          unwrap="p"
          :value="filter.label"
        />
      </UButton>

      <template #content>
        <header class="flex justify-between border-b border-default px-4 py-2 font-semibold">
          <div class="flex items-center gap-2">
            <UIcon
              v-if="filter.propertyConfig?.icon"
              class="size-4"
              :name="filter.propertyConfig.icon"
            />

            {{ filter.propertyConfig?.label }}
          </div>

          <UButton
            class="text-muted"
            color="neutral"
            :label="t('listFilter.remove')"
            size="xs"
            variant="ghost"
            @click="removeFilter(filter.property)"
          />
        </header>

        <div class="flex items-center gap-2 p-4">
          <USelect
            :items="filter.operators"
            :model-value="filter.operator"
            size="sm"
            :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
            variant="soft"
            @update:model-value="updateFilter(filter.property, { operator: $event })"
          />

          <component
            :is="getComponent(filter.component.component)"
            v-if="filter.component"
            autofocus
            class="flex-1"
            :model-value="filter.value"
            size="sm"
            variant="soft"
            v-bind="filter.component.props"
            @update:model-value="updateFilter(filter.property, { value: $event })"
          />
        </div>
      </template>
    </UPopover>

    <USelectMenu
      v-if="availableProperties.length && localFilters.length < max"
      :content="{ align: 'start' }"
      :icon="appConfig.ui.icons.plus"
      :items="availableProperties"
      :model-value="null"
      :placeholder="t('listFilter.filter')"
      :trailing-icon="false"
      :ui="{ content: 'min-w-fit' }"
      variant="soft"
      @update:model-value="addFilter"
    />

    <UButton
      v-if="localFilters.length"
      color="neutral"
      :label="t('listFilter.clearFilters')"
      size="sm"
      variant="link"
      @click="clearFilters"
    />
  </div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core'
import {
  InputRelation,
  InputText
} from '#components'

const props = defineProps({
  debounceTime: {
    type: Number,
    default: 500
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
const { t } = useI18n()

// Component mapping.
const componentMap = {
  InputRelation,
  InputText
}

function getComponent(name) {
  return componentMap[name] || 'div'
}

// Utils.
function isValueEmpty(value) {
  if (Array.isArray(value)) {
    return value.every(item => item == null || item === '')
  }

  return value == null || value === ''
}

// Local state.
function cloneFilters(filters = []) {
  const results = []

  for (const filter of filters) {
    results.push({ ...filter })
  }

  return results
}

const localFilters = ref(cloneFilters(model.value))

const syncModel = useDebounceFn(() => {
  const results = []

  for (const { property, operator, value } of localFilters.value) {
    results.push({ property, operator, value })
  }

  model.value = results
}, props.debounceTime)

watch(model, (value) => {
  localFilters.value = cloneFilters(value)
}, { deep: true })

// Properties.
const filterableProperties = computed(() => {
  const result = {}

  for (const key in props.entity.properties) {
    const property = props.entity.properties[key]

    if (property.filterable !== false) {
      result[key] = property
    }
  }

  return result
})

const availableProperties = computed(() => {
  const used = new Set()

  for (const filter of localFilters.value) {
    used.add(filter.property)
  }

  const results = []

  for (const key in filterableProperties.value) {
    if (used.has(key)) continue

    const property = filterableProperties.value[key]

    results.push({
      key,
      label: property.label,
      icon: property.icon
    })
  }

  return results
})

// Filters.
const filters = computed(() => {
  const results = []

  for (const filter of localFilters.value) {
    const propertyConfig = filterableProperties.value[filter.property]
    const operatorConfig = propertyConfig.operators?.find(
      operator => operator.value === filter.operator
    )

    const label = isValueEmpty(filter.value)
      || typeof operatorConfig?.mask !== 'function'
      ? propertyConfig.label
      : operatorConfig.mask(propertyConfig.label, filter.value)

    results.push({
      ...filter,
      label,
      propertyConfig,
      operators: propertyConfig.operators,
      component: propertyConfig.resolveFilterInput?.(propertyConfig, filter)
    })
  }

  return results
})

// Actions.
function addFilter(item) {
  const propertyConfig = filterableProperties.value[item.key]

  localFilters.value.push({
    property: item.key,
    operator: propertyConfig.defaultOperator,
    value: propertyConfig.defaultValue
  })

  syncModel()
}

function updateFilter(property, updates) {
  for (const filter of localFilters.value) {
    if (filter.property !== property) continue

    Object.assign(filter, updates)
    break
  }

  syncModel()
}

function removeFilter(property) {
  const index = localFilters.value.findIndex(filter =>
    filter.property === property
  )

  if (index !== -1) {
    localFilters.value.splice(index, 1)
  }

  syncModel()
}

function clearFilters() {
  localFilters.value = []
  syncModel()
}
</script>
