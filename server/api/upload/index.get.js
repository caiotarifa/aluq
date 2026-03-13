export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const pathname = await requirePathname(event, session)

  return serveFile(event, pathname)
})
