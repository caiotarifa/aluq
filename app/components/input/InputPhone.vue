<template>
  <UFieldGroup>
    <USelectMenu
      v-model="country"
      :filter-fields="['name', 'callingCode']"
      :items="countries"
      :search-input="{ placeholder: t('inputPhone.searchCountry') }"
      :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }"
      value-key="id"
    >
      <template #leading>
        {{ selectedFlag }}
      </template>

      <template #item-leading="{ item }">
        {{ item.flag }}
      </template>

      <template #item-label="{ item }">
        {{ item.name }}
      </template>

      <template #item-trailing="{ item }">
        <span class="text-dimmed">
          +{{ item.callingCode }}
        </span>
      </template>
    </USelectMenu>

    <UInput
      v-bind="$attrs"
      :maxlength="maxLength"
      :model-value="nationalNumber"
      :placeholder
      type="tel"
      @update:model-value="updateNationalNumber"
    />
  </UFieldGroup>
</template>

<script setup>
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberWithError,
  getExampleNumber
} from 'libphonenumber-js'

import examples from 'libphonenumber-js/mobile/examples'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  defaultCountry: {
    type: String,
    default: 'BR'
  }
})

const { t, locale } = useI18n()

const country = ref(props.defaultCountry)
const digits = ref('')

const countries = computed(() => {
  const displayNames = new Intl.DisplayNames(
    [locale.value],
    { type: 'region' }
  )

  const list = []

  for (const id of getCountries()) {
    const callingCode = getCountryCallingCode(id)

    list.push({
      id,
      label: `+${callingCode}`,
      name: displayNames.of(id) || id,
      callingCode,
      flag: getCountryFlag(id)
    })
  }

  list.sort((a, b) => a.name.localeCompare(b.name))

  return list
})

const selectedCountry = computed(() =>
  countries.value.find(item => item.id === country.value)
)

const selectedFlag = computed(() =>
  selectedCountry.value?.flag || '🏳️'
)

const exampleFormatted = computed(() => {
  if (!country.value) return null

  try {
    const example = getExampleNumber(country.value, examples)

    return example ? example.formatNational() : null
  }
  catch {
    return null
  }
})

const maxLength = computed(() =>
  exampleFormatted.value?.length
)

const placeholder = computed(() =>
  exampleFormatted.value?.replace(/\d/g, '_')
)

function extractDigits(value) {
  return value.replace(/\D/g, '')
}

function formatNational(rawDigits, countryCode) {
  if (!countryCode || !rawDigits) return rawDigits || ''

  const formatter = new AsYouType(countryCode)

  return formatter.input(rawDigits)
}

const nationalNumber = computed(() =>
  formatNational(digits.value, country.value)
)

function buildE164(rawDigits, countryCode) {
  if (!countryCode || !rawDigits) return ''

  const callingCode = getCountryCallingCode(countryCode)

  return `+${callingCode}${rawDigits}`
}

function updateNationalNumber(value) {
  digits.value = extractDigits(value)
  model.value = buildE164(digits.value, country.value)
}

function parseE164(e164) {
  if (!e164) {
    country.value = props.defaultCountry
    digits.value = ''
    return
  }

  try {
    const parsed = parsePhoneNumberWithError(e164)

    if (parsed?.country) {
      country.value = parsed.country
      digits.value = parsed.nationalNumber
      return
    }
  }
  catch {
    // Invalid E.164
  }

  digits.value = extractDigits(e164)
}

const model = defineModel({
  type: String,
  default: '',

  get(e164) {
    parseE164(e164)
    return e164
  },

  set() {
    return buildE164(digits.value, country.value)
  }
})

// Initialize from initial value.
parseE164(model.value)

// Rebuild E.164 when country changes.
watch(country, () => {
  if (!digits.value) return
  model.value = buildE164(digits.value, country.value)
})
</script>
