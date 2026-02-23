<template>
  <UFieldGroup class="rounded-md ring ring-accented ring-inset focus-within:ring-2 focus-within:ring-primary">
    <div class="self-center pl-2.5 text-sm text-dimmed">
      {{ currencySymbol }}
    </div>

    <UInput
      v-bind="$attrs"
      v-model="display"
      v-maska="maskaOptions"
      inputmode="numeric"
      variant="none"
    />

    <USelectMenu
      v-model="currencyCode"
      :filter-fields="['name', 'id']"
      :items="currenciesList"
      :search-input="{ placeholder: t('inputCurrency.searchCurrency') }"
      :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
      value-key="id"
      variant="none"
    >
      <template #leading>
        {{ selectedCurrency?.flag || '🏳️' }}
      </template>

      <template #item-leading="{ item }">
        {{ item.flag }}
      </template>

      <template #item-label="{ item }">
        {{ item.name }}
      </template>

      <template #item-trailing="{ item }">
        <span class="text-dimmed">
          {{ item.id }}
        </span>
      </template>
    </USelectMenu>
  </UFieldGroup>
</template>

<script setup>
import { vMaska } from 'maska/vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  currencies: {
    type: Array,
    default: () => [
      'ARS', 'AUD', 'BRL', 'CAD', 'CLP',
      'CNY', 'EUR', 'GBP', 'IDR', 'INR',
      'JPY', 'KRW', 'MXN', 'PYG', 'RUB',
      'SAR', 'TRY', 'USD', 'UYU', 'ZAR'
    ]
  },

  defaultCurrency: {
    type: String,
    default: 'BRL'
  }
})

const model = defineModel({
  type: Number,
  default: null
})

const currency = defineModel('currency', {
  type: String,
  default: undefined
})

const { t, locale } = useI18n()

const currencyCode = computed({
  get: () => currency.value || props.defaultCurrency,

  set: (value) => {
    currency.value = value
  }
})

const displayNames = computed(() =>
  new Intl.DisplayNames([locale.value], { type: 'currency' })
)

const currenciesList = computed(() => {
  const mapped = props.currencies.map(code => ({
    id: code,
    label: code,
    flag: getCountryFlag(code.substring(0, 2)),
    name: displayNames.value.of(code) || code
  }))

  return mapped.sort((a, b) => a.name.localeCompare(b.name))
})

const selectedCurrency = computed(() =>
  currenciesList.value.find(item => item.id === currencyCode.value)
)

const currencyFormatter = computed(() => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currencyCode.value,
    currencyDisplay: 'narrowSymbol'
  })
})

const fractionDigits = computed(() =>
  currencyFormatter.value?.resolvedOptions().maximumFractionDigits ?? 2
)

const currencySymbol = computed(() =>
  currencyFormatter.value?.formatToParts(0).find(part =>
    part.type === 'currency'
  )?.value || currencyCode.value
)

const numberFormatter = computed(() =>
  new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: fractionDigits.value,
    maximumFractionDigits: fractionDigits.value
  })
)

function formatDisplay(value) {
  if (value == null) return ''
  return numberFormatter.value.format(value)
}

const display = ref(formatDisplay(model.value))
const lastParsed = ref(model.value)

const maskaOptions = computed(() => ({
  number: {
    locale: locale.value,
    fraction: fractionDigits.value
  },

  onMaska: ({ unmasked }) => {
    const parsed = unmasked ? parseFloat(unmasked) : null

    lastParsed.value = parsed

    if (model.value !== parsed) {
      model.value = parsed
    }
  }
}))

// Reformat on external model change or currency switch.
watch(
  () => [model.value, currencyCode.value],

  ([newValue], [, oldCurrency]) => {
    if (newValue !== lastParsed.value || currencyCode.value !== oldCurrency) {
      lastParsed.value = newValue
      display.value = formatDisplay(newValue)
    }
  }
)
</script>
