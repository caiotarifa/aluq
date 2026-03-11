<template>
  <div v-bind="$attrs">
    <!-- Search -->
    <UFieldGroup v-if="!model">
      <UInputMenu
        ref="searchInput"
        v-model="selectedSuggestion"
        v-model:search-term="searchTerm"
        ignore-filter
        :items="suggestionItems"
        :loading="searching"
        :placeholder="t('inputAddress.searchPlaceholder')"
        trailing-icon=""
        :ui="{ content: 'min-w-fit' }"
        @update:model-value="onSuggestionSelect"
        @update:search-term="onSearchInput"
      />

      <UTooltip :text="t('inputAddress.fillManually')">
        <UButton
          class="px-2.5 text-muted"
          color="neutral"
          icon="i-tabler-pencil"
          size="xs"
          variant="subtle"
          @click="fillManually"
        />
      </UTooltip>
    </UFieldGroup>

    <!-- Display -->
    <div
      v-else
      class="relative flex -space-x-px"
    >
      <div
        class="relative flex min-w-0 flex-1 cursor-pointer items-center select-none"
        @click="openEditor"
      >
        <div class="w-full truncate rounded-l-md bg-default px-2.5 py-1.5 text-sm ring ring-accented ring-inset">
          {{ displayText }}
        </div>
      </div>

      <UTooltip :text="t('inputAddress.searchAgain')">
        <UButton
          class="rounded-l-none px-2.5 text-muted"
          color="neutral"
          icon="i-tabler-restore"
          size="xs"
          variant="subtle"
          @click="clearAddress"
        />
      </UTooltip>
    </div>
  </div>

  <!-- Edit -->
  <UModal
    v-model:open="editing"
    :description="t('inputAddress.editAddressDescription')"
    :title="t('inputAddress.editAddress')"
    :ui="{ footer: 'justify-end' }"
    @after:leave="resetFields"
  >
    <template #body>
      <UForm
        ref="addressForm"
        class="space-y-3"
        :schema="schema"
        :state="fields"
        @submit="confirmEditing"
      >
        <div class="grid grid-cols-2 gap-3">
          <UFormField
            :label="t('inputAddress.country')"
            name="country"
          >
            <InputCountry
              class="w-full"
              :model-value="fields.country"
              @update:model-value="onCountryChange"
            />
          </UFormField>

          <UFormField
            :label="t('inputAddress.postalCode')"
            name="postalCode"
          >
            <UInput
              class="w-full"
              :model-value="fields.postalCode"
              @update:model-value="updateField('postalCode', $event)"
            />
          </UFormField>
        </div>

        <UFormField
          :label="t('inputAddress.addressLine1')"
          name="addressLine1"
        >
          <UInput
            class="w-full"
            :model-value="fields.addressLine1"
            @update:model-value="updateField('addressLine1', $event)"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField
            :label="t('inputAddress.addressLine2')"
            name="addressLine2"
          >
            <UInput
              class="w-full"
              :model-value="fields.addressLine2"
              @update:model-value="updateField('addressLine2', $event)"
            />
          </UFormField>

          <UFormField
            :label="t('inputAddress.addressLine3')"
            name="addressLine3"
          >
            <UInput
              class="w-full"
              :model-value="fields.addressLine3"
              @update:model-value="updateField('addressLine3', $event)"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormField
            :label="t('inputAddress.state')"
            name="state"
          >
            <USelectMenu
              :key="fields.country"
              class="w-full"
              :disabled="!fields.country"
              :items="stateItems"
              :loading="loadingStates"
              :model-value="fields.state"
              :placeholder="t('inputAddress.searchState')"
              :search-input="{ placeholder: t('inputAddress.searchState') }"
              :ui="{ content: 'min-w-fit' }"
              value-key="value"
              @update:model-value="onStateChange"
            />
          </UFormField>

          <UFormField
            :label="t('inputAddress.city')"
            name="city"
          >
            <USelectMenu
              :key="fields.state"
              class="w-full"
              :disabled="!fields.state"
              :items="cityItems"
              :loading="loadingCities"
              :model-value="fields.city"
              :placeholder="t('inputAddress.searchCity')"
              :search-input="{ placeholder: t('inputAddress.searchCity') }"
              :ui="{ content: 'min-w-fit' }"
              value-key="value"
              @update:model-value="updateField('city', $event)"
            />
          </UFormField>
        </div>

        <button
          class="hidden"
          type="submit"
        />
      </UForm>
    </template>

    <template #footer>
      <UButton
        :label="t('actions.done')"
        @click="addressFormRef?.submit()"
      />
    </template>
  </UModal>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core'
import { z } from 'zod'

defineOptions({
  inheritAttrs: false
})

const model = defineModel({
  type: Object,
  default: null
})

const { t } = useI18n()
const { summary: displayText } = useAddress(
  () => model.value
)

const schema = z.object({
  country: z.string().min(1),
  postalCode: z.string().min(1),
  addressLine1: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1)
})

// State.
const emptyFields = () => ({
  country: 'BR',
  postalCode: '',
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  state: null,
  city: '',
  latitude: '',
  longitude: ''
})

const addressFormRef = useTemplateRef('addressForm')
const searchInputRef = useTemplateRef('searchInput')

const fields = reactive(emptyFields())
const editing = ref(false)
const pendingFocus = ref(false)
const searchTerm = ref('')
const selectedSuggestion = ref(null)

// Cancellable fetch.
function useCancellableFetch() {
  const data = ref([])
  const loading = ref(false)

  const state = {
    controller: null
  }

  function cancel() {
    state.controller?.abort()
    state.controller = null

    data.value = []
    loading.value = false
  }

  async function load(url, options = {}) {
    state.controller?.abort()

    const local = new AbortController()

    state.controller = local
    loading.value = true

    try {
      data.value = await $fetch(url, {
        ...options,
        signal: local.signal
      }) || []
    }

    catch (error) {
      if (error?.name === 'AbortError') return
      data.value = []
    }

    finally {
      if (!local.signal.aborted) {
        loading.value = false
      }
    }
  }

  return {
    data,
    loading,

    cancel,
    load
  }
}

watch(searchInputRef, (input) => {
  if (!input || !pendingFocus.value) return
  pendingFocus.value = false
  input.inputRef?.focus()
})

// Search.
const search = useCancellableFetch()
const searching = search.loading

const suggestionItems = computed(() =>
  search.data.value
)

const debouncedSearch = useDebounceFn(
  (query) => {
    if (!query || query.length < 3) return
    search.load('/api/geo/search', { query: { q: query } })
  },

  400
)

function cancelSearch() {
  debouncedSearch('')
  search.cancel()
}

function onSearchInput(value) {
  if (!value || value.length < 3) {
    return cancelSearch()
  }

  searching.value = true
  debouncedSearch(value)
}

function onSuggestionSelect(suggestion) {
  if (!suggestion) return

  cancelSearch()
  selectedSuggestion.value = null
  searchTerm.value = ''
  populateFields(suggestion)
  editing.value = true
}

// Geographic data.
const states = useCancellableFetch()
const cities = useCancellableFetch()

const loadingStates = states.loading
const loadingCities = cities.loading

const stateItems = computed(() =>
  states.data.value.map(state => ({
    label: state.name,
    value: state.iso3166_2
  }))
)

const cityItems = computed(() =>
  cities.data.value.map(city => ({
    label: city.name,
    value: city.name
  }))
)

function loadCities(countryCode, stateCode) {
  if (!countryCode || !stateCode) return

  const parts = stateCode.split('-')

  const stateIso2 = parts.length > 1
    ? parts.slice(1).join('-')
    : parts[0]

  cities.load(`/api/geo/${countryCode}/${stateIso2}/cities`)
}

// Modal actions.
function fillManually() {
  cancelSearch()
  Object.assign(fields, emptyFields())

  states.cancel()
  cities.cancel()

  states.load(`/api/geo/${fields.country}/states`)
  editing.value = true
}

function openEditor() {
  populateFields(model.value)
  editing.value = true
}

function confirmEditing() {
  model.value = { ...fields }
  editing.value = false
}

function clearAddress() {
  cancelSearch()

  model.value = null
  pendingFocus.value = true
}

function resetFields() {
  states.cancel()
  cities.cancel()

  Object.assign(fields, emptyFields())
}

function populateFields(data) {
  states.cancel()
  cities.cancel()

  Object.assign(
    fields,
    data
      ? { ...emptyFields(), ...data }
      : emptyFields()
  )

  states.load(`/api/geo/${fields.country}/states`)

  if (fields.state) {
    loadCities(fields.country, fields.state)
  }
}

// Field updates inside the modal.
function updateField(key, value) {
  fields[key] = value
}

function onCountryChange(value) {
  cities.cancel()

  fields.country = value
  fields.state = null
  fields.city = ''

  states.load(`/api/geo/${value}/states`)
}

function onStateChange(value) {
  fields.state = value
  fields.city = ''

  loadCities(fields.country, value)
}
</script>
