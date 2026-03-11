<template>
  <NuxtLayout name="app">
    <AppPage>
      <div class="space-y-2">
        <div>
          <InputDate v-model="date" />

          <pre>{{ date }}</pre>
        </div>

        <div>
          <InputDate
            v-model="dateRange"
            range
          />

          <pre>{{ dateRange }}</pre>
        </div>

        <div>
          <InputTime v-model="time" />

          <pre>{{ time }}</pre>
        </div>

        <div>
          <InputPhone v-model="phone" />

          <pre>{{ phone }}</pre>
        </div>

        <div>
          <InputCurrency v-model="currency" />

          <pre>{{ currency }}</pre>
        </div>

        <div>
          <InputCountry v-model="country" />

          <pre>{{ country }}</pre>
        </div>

        <div>
          <DisplayEmail model-value="caiotarifa@gmail.com" />
        </div>

        <div>
          <DisplayPhone model-value="+5516988311731" />
        </div>

        <div>
          <DisplayCurrency
            currency="BRL"
            :model-value="1250.50"
          />
        </div>

        <div>
          <DisplayCountry model-value="BR" />
        </div>

        <div>
          <InputAddress v-model="address1" />
        </div>

        <div>
          <InputAddress
            v-model="address"
            class="w-full"
          />
        </div>

        <div>
          <DisplayAddress :model-value="address" />
        </div>
      </div>
    </AppPage>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  auth: { only: 'user' }
})

const date = ref('2024-06-15')
const dateRange = ref([null, null])
const time = ref('')

const phone = ref('+5516988311731')
const currency = ref(1250.50)

const country = ref('BR')

const address1 = ref(null)
const address = ref(null)
</script>
