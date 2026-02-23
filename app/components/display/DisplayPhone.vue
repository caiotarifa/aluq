<template>
  <ActionLink
    v-if="model"
    :actions
    icon="i-tabler-phone"
    :to="`tel:${model}`"
  >
    {{ formatted }}
  </ActionLink>

  <span v-else>
    –
  </span>
</template>

<script setup>
import { parsePhoneNumberWithError } from 'libphonenumber-js'

const model = defineModel({
  type: String,
  default: ''
})

const parsed = computed(() => {
  if (!model.value) return null

  try {
    return parsePhoneNumberWithError(model.value)
  }

  catch {
    return null
  }
})

const formatted = computed(() => {
  if (!parsed.value) {
    return model.value
  }

  const calling = `+${parsed.value.countryCallingCode}`
  const national = parsed.value.formatNational()

  return `${calling} ${national}`
})

const whatsappUrl = computed(() => {
  const digits = model.value.replace(/\D/g, '')
  return `https://wa.me/${digits}`
})

const actions = computed(() => [
  {
    icon: 'i-tabler-brand-whatsapp',
    target: '_blank',
    to: whatsappUrl.value
  }
])
</script>
