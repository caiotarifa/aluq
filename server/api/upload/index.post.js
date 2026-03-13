export default defineEventHandler(async (event) => {
  const session = await requireSession(event)
  const result = await uploadFile(event, session)

  setResponseStatus(event, 201)

  return result
})
