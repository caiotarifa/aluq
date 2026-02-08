<template>
  <div class="flex flex-wrap items-center gap-2">
    <UPopover
      v-for="filter in filters"
      :key="filter.property"
      :content="{ align: 'start' }"
      :ui="{ content: 'text-sm min-w-72' }"
    >
      <UButton
        :class="isEmpty(filter.value) ? 'bg-elevated/50 text-dimmed hover:bg-elevated' : ''"
        :color="isEmpty(filter.value) ? 'neutral' : 'primary'"
        :icon="filter.propertyConfig?.icon"
        :trailing-icon="appConfig.ui.icons.chevronDown"
        :variant="isEmpty(filter.value) ? 'soft' : 'subtle'"
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

        <div class="space-x-2 p-4">
          <USelect
            :items="filter.operators"
            :model-value="filter?.operator"
            size="sm"
            :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
            variant="soft"
            @update:model-value="updateFilter(filter.property, { operator: $event })"
          />

          <component
            :is="getComponent(filter.component?.componentName)"
            autofocus
            :model-value="filter.value"
            size="sm"
            variant="soft"
            v-bind="filter.component?.props"
            @update:model-value="updateFilter(filter.property, { value: $event })"
          />
        </div>
      </template>
    </UPopover>

    <USelectMenu
      v-if="availableProperties.length && model.length < max"
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
      v-if="model.length"
      color="neutral"
      :label="t('listFilter.clearFilters')"
      size="sm"
      variant="link"
      @click="clearFilters"
    />
  </div>
</template>

<script setup>
import { InputFilterText } from '#components'

const props = defineProps({
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

// Component mapping.
const componentMap = {
  InputFilterText
}

function getComponent(name) {
  return componentMap[name] || 'div'
}

// Utils.
function isEmpty(value) {
  return [null, undefined, ''].includes(value)
}

function isFunction(value) {
  return typeof value === 'function'
}

// Available properties.
const availableProperties = computed(() => {
  const usedProperties = model.value.map(filter => filter.property)
  const results = []

  for (const key in filterableProperties.value) {
    const property = filterableProperties.value[key]

    if (!usedProperties.includes(key)) {
      results.push({
        key,
        label: property.label,
        icon: property.icon
      })
    }
  }

  return results
})

// Filters.
const filters = computed(() => model.value.map((filter) => {
  const propertyConfig = filterableProperties.value[filter.property]

  const operatorConfig = propertyConfig.operators?.find(
    operator => operator.value === filter.operator
  )

  return Object.assign(filter, {
    label: isEmpty(filter.value) || !isFunction(operatorConfig?.mask)
      ? propertyConfig.label
      : operatorConfig.mask(propertyConfig.label, filter.value),

    propertyConfig,

    operators: propertyConfig.operators,

    component: propertyConfig.resolveFilterInput?.(filter)
  })
}))

function addFilter(item) {
  const propertyConfig = filterableProperties.value[item.key]

  model.value.push({
    property: item.key,
    operator: propertyConfig.defaultOperator,
    value: propertyConfig.defaultValue
  })
}

function updateFilter(property, updates) {
  const index = model.value.findIndex(filter => filter.property === property)

  if (~index) {
    for (const field in updates) {
      model.value[index][field] = updates[field]
    }
  }
}

function removeFilter(property) {
  const index = model.value.findIndex(filter => filter.property === property)

  if (~index) {
    model.value.splice(index, 1)
  }
}

function clearFilters() {
  model.value = []
}
</script>
