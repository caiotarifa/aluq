import { getCitiesOfState } from '@countrystatecity/countries'

export default defineCachedEventHandler(async (event) => {
  const country = getRouterParam(event, 'country')
  const state = getRouterParam(event, 'state')

  if (!country || country.length !== 2) {
    throw createError({
      statusCode: 400,
      message: 'Invalid country code'
    })
  }

  if (!state) {
    throw createError({
      statusCode: 400,
      message: 'Invalid state code'
    })
  }

  const cities = await getCitiesOfState(
    country.toUpperCase(),
    state.toUpperCase()
  )

  return cities.map(city => ({
    name: city.name
  }))
}, {
  maxAge: 60 * 60 * 24,
  name: 'geo-cities',
  getKey: (event) => {
    const country = getRouterParam(event, 'country')
    const state = getRouterParam(event, 'state')
    return `${country}-${state}`
  }
})
