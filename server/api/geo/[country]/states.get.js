import { getStatesOfCountry } from '@countrystatecity/countries'

export default defineCachedEventHandler(async (event) => {
  const country = getRouterParam(event, 'country')

  if (!country || country.length !== 2) {
    throw createError({
      status: 400,
      message: 'Invalid country code'
    })
  }

  const states = await getStatesOfCountry(
    country.toUpperCase()
  )

  return states.map(state => ({
    iso2: state.iso2,
    iso3166_2: state.iso3166_2 || `${country.toUpperCase()}-${state.iso2}`,
    name: state.name
  }))
}, {
  maxAge: 60 * 60 * 24,
  name: 'geo-states',
  getKey: event => getRouterParam(event, 'country')
})
