export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const pathname = await requirePathname(event, session)

  await deleteFile(pathname)

  return sendNoContent(event)
})
