<template>
  <div class="flex flex-wrap items-center gap-2">
    <UPopover
      v-for="filter in filters"
      :key="filter.key"
      :content="{ align: 'start' }"
      :ui="{ content: 'text-sm min-w-72' }"
    >
      <UButton
        :class="isEmpty(filter.value) ? 'bg-elevated/50 text-dimmed hover:bg-elevated' : ''"
        :color="isEmpty(filter.value) ? 'neutral' : 'primary'"
        :icon="filter.property?.icon"
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
              v-if="filter.property?.icon"
              class="size-4"
              :name="filter.property.icon"
            />

            {{ filter.property?.label }}
          </div>

          <UButton
            class="text-muted"
            color="neutral"
            :label="t('listFilter.remove')"
            size="xs"
            variant="ghost"
            @click="removeFilter(filter.key)"
          />
        </header>

        <div class="space-x-2 p-4">
          <USelect
            :items="filter.operators"
            :model-value="filter?.operator"
            size="sm"
            :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
            variant="soft"
            @update:model-value="updateFilter(filter.key, { operator: $event })"
          />

          <component
            :is="getComponent(filter.component?.componentName)"
            autofocus
            :model-value="filter.value"
            size="sm"
            variant="soft"
            v-bind="filter.component?.props"
            @update:model-value="updateFilter(filter.key, { value: $event })"
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
  const usedKeys = model.value.map(filter => filter.key)
  const results = []

  for (const key in filterableProperties.value) {
    const property = filterableProperties.value[key]

    if (!usedKeys.includes(key)) {
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
  const property = filterableProperties.value[filter.key]

  const operatorConfig = property.operators?.find(
    operator => operator.value === filter.operator
  )

  return Object.assign(filter, {
    label: isEmpty(filter.value) || !isFunction(operatorConfig?.mask)
      ? property.label
      : operatorConfig.mask(property.label, filter.value),

    property,

    operators: property.operators,

    component: property.resolveFilterInput?.(filter)
  })
}))

function addFilter(filter) {
  const property = filterableProperties.value[filter.key]

  model.value.push({
    key: filter.key,
    operator: property.defaultOperator,
    value: property.defaultValue
  })
}

function updateFilter(key, updates) {
  const index = model.value.findIndex(filter => filter.key === key)

  if (~index) {
    for (const key in updates) {
      model.value[index][key] = updates[key]
    }
  }
}

function removeFilter(key) {
  const index = model.value.findIndex(filter => filter.key === key)

  if (~index) {
    model.value.splice(index, 1)
  }
}

function clearFilters() {
  model.value = []
}
</script>
