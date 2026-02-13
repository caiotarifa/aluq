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
            :is="getComponent(filter.component?.component)"
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
import { InputText } from '#components'

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

const localFilters = ref(
  model.value.map(f => ({ ...f }))
)

const syncModel = useDebounceFn(() => {
  model.value = localFilters.value.map(
    ({ property, operator, value }) => ({ property, operator, value })
  )
}, props.debounceTime)

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
  InputText
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
  const usedProperties = localFilters.value.map(
    filter => filter.property
  )

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
const filters = computed(() => localFilters.value.map((filter) => {
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
    component: propertyConfig.resolveFilterInput?.(propertyConfig, filter)
  })
}))

function addFilter(item) {
  const propertyConfig = filterableProperties.value[item.key]

  localFilters.value = [...localFilters.value, {
    property: item.key,
    operator: propertyConfig.defaultOperator,
    value: propertyConfig.defaultValue
  }]

  syncModel()
}

function updateFilter(property, updates) {
  const copy = localFilters.value.slice()
  const index = copy.findIndex(
    filter => filter.property === property
  )

  if (~index) {
    Object.assign(copy[index], updates)
    localFilters.value = copy
  }

  syncModel()
}

function removeFilter(property) {
  const copy = localFilters.value.slice()
  const index = copy.findIndex(
    filter => filter.property === property
  )

  if (~index) {
    copy.splice(index, 1)
    localFilters.value = copy
  }

  syncModel()
}

function clearFilters() {
  localFilters.value = []
  syncModel()
}
</script>
