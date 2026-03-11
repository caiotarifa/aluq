import {
  getStatesOfCountry,
  searchCitiesByName
} from '@countrystatecity/countries'

export default defineCachedEventHandler(async (event) => {
  const { q } = getQuery(event)

  if (!q || typeof q !== 'string' || q.trim().length < 3) {
    return []
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')

  url.searchParams.set('q', q.trim())
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')

  // TODO: replace with organization's viewbox.
  url.searchParams.set('viewbox', '-48.3103,-20.6775,-47.3103,-21.6775')
  url.searchParams.set('bounded', '0')

  const results = await $fetch(url.toString(), {
    headers: { 'Accept-Language': 'pt-BR,pt,en' }
  })

  if (!Array.isArray(results)) return []

  const mapped = []

  for (const result of results) {
    const address = result.address || {}
    const countryCode = (address.country_code || '').toUpperCase()

    const suburb = address.suburb || address.neighbourhood || ''
    const city = address.city || address.town || address.village || ''
    const postalCode = address.postcode || ''

    const road = address.road || ''
    const houseNumber = address.house_number || ''
    const addressLine1 = houseNumber ? `${road}, ${houseNumber}` : road

    // Resolve state via ISO 3166-2.
    const iso3166Key = findIsoKey(address)

    const stateCode = iso3166Key
      ? await resolveState(countryCode, iso3166Key)
      : null

    // Resolve city name via library.
    const cityName = stateCode
      ? await resolveCity(countryCode, stateCode, city)
      : city

    const name = address.amenity
      || address.building
      || address.tourism
      || address.leisure
      || address.shop
      || ''

    const label = [
      name,
      addressLine1,
      suburb,
      cityName,
      address.state,
      address.country,
      postalCode
    ].filter(Boolean).join(', ')

    mapped.push({
      label,
      name,
      country: countryCode,
      state: stateCode,
      city: cityName,
      postalCode,
      addressLine1,
      addressLine2: '',
      addressLine3: suburb,
      latitude: result.lat || '',
      longitude: result.lon || ''
    })
  }

  return mapped
}, {
  maxAge: 60 * 60 * 24,
  name: 'geo-search',
  getKey: event => getQuery(event).q || ''
})

// Nominatim returns ISO3166-2-lvl4, lvl6, lvl8 etc.
function findIsoKey(address) {
  for (const key in address) {
    if (key.startsWith('ISO3166-2-')) {
      return address[key]
    }
  }

  return null
}

// isoValue = 'BR-SP', extract 'SP'.
async function resolveState(countryCode, isoValue) {
  const parts = isoValue.split('-')
  const stateIso2 = parts.length > 1 ? parts.slice(1).join('-') : parts[0]

  const states = await getStatesOfCountry(countryCode)
  const match = states.find(state => state.iso2 === stateIso2)

  if (match) {
    return match.iso3166_2 || `${countryCode}-${match.iso2}`
  }

  return isoValue
}

async function resolveCity(countryCode, stateIso3166, cityName) {
  if (!cityName) return ''

  // Extract iso2 from iso3166_2 (e.g. 'BR-SP' → 'SP').
  const parts = stateIso3166.split('-')
  const stateIso2 = parts.length > 1 ? parts.slice(1).join('-') : parts[0]

  try {
    const matches = await searchCitiesByName(countryCode, stateIso2, cityName)

    if (matches?.length > 0) {
      return matches[0].name
    }
  }
  catch {
    // Fallback to Nominatim name.
  }

  return cityName
}
