import { blob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname')

  if (!pathname) {
    throw createError({ status: 404, message: 'Not Found' })
  }

  return blob.serve(event, pathname)
})
