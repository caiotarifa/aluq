<template>
  <USelectMenu
    v-model="model"
    :filter-fields="['label', 'id']"
    :items="countries"
    :search-input="{ placeholder: t('inputCountry.searchCountry') }"
    :ui="{ content: 'w-fit' }"
    value-key="id"
  >
    <template #leading>
      {{ selectedFlag }}
    </template>

    <template #item-leading="{ item }">
      {{ item.flag }}
    </template>

    <template #item-trailing="{ item }">
      <span class="text-dimmed">
        {{ item.id }}
      </span>
    </template>
  </USelectMenu>
</template>

<script setup>
import { getCountries } from 'libphonenumber-js'

const model = defineModel({
  type: String,
  default: undefined
})

const { t, locale } = useI18n()

const displayNames = computed(() =>
  new Intl.DisplayNames([locale.value], { type: 'region' })
)

const countries = computed(() => {
  const list = []

  for (const id of getCountries()) {
    const label = displayNames.value.of(id) || id
    list.push({ id, label, flag: getCountryFlag(id) })
  }

  list.sort((a, b) => a.label.localeCompare(b.label))

  return list
})

const selectedFlag = computed(() =>
  model.value ? getCountryFlag(model.value) : null
)
</script>
