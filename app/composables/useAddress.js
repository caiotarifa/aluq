export function useAddress(address) {
  const { locale } = useI18n()

  const displayNames = computed(() =>
    new Intl.DisplayNames([locale.value], { type: 'region' })
  )

  function countryName(countryCode) {
    if (!countryCode) return ''
    return displayNames.value.of(countryCode) || countryCode
  }

  function stateName(stateCode, availableStates) {
    if (!stateCode) return ''

    const foundState = availableStates.find(state =>
      state.iso3166_2 === stateCode
    )

    return foundState?.name || stateCode
  }

  const { data: states } = useFetch(
    () => toValue(address)?.country
      ? `/api/geo/${toValue(address).country}/states`
      : null,

    {
      key: `geo-states-${useId()}`,
      default: () => [],
      watch: [() => toValue(address)?.country],
      $fetch: (url, options) => url ? $fetch(url, options) : []
    }
  )

  const summary = computed(() => {
    const resolvedAddress = toValue(address)
    if (!resolvedAddress) return ''

    return [
      resolvedAddress.addressLine1,
      resolvedAddress.addressLine2,
      resolvedAddress.addressLine3,
      resolvedAddress.city,
      stateName(resolvedAddress.state, states.value),
      countryName(resolvedAddress.country),
      resolvedAddress.postalCode
    ].filter(Boolean).join(', ')
  })

  const lines = computed(() => {
    const resolvedAddress = toValue(address)
    if (!resolvedAddress) return null

    const join = (...parts) => parts.filter(Boolean).join(', ')

    return {
      first: join(
        resolvedAddress.addressLine1,
        resolvedAddress.addressLine2
      ),

      second: join(
        resolvedAddress.addressLine3,
        resolvedAddress.city,
        stateName(resolvedAddress.state, states.value)
      ),

      third: join(
        resolvedAddress.postalCode,
        countryName(resolvedAddress.country)
      )
    }
  })

  return {
    states,
    summary,
    lines
  }
}
