import { blob } from 'hub:blob'
import { auth } from '#server/utils/auth'

const maxFileSize = 10 * 1024 * 1024 // 10 MB.

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export async function requireSession(event) {
  const result = await auth.api.getSession({
    headers: event.headers
  })

  if (!result) {
    throw createError({
      status: 401,
      message: 'Unauthorized'
    })
  }

  return result.session
}

export async function requirePathname(event, session) {
  const { pathname } = getQuery(event)

  if (!pathname || typeof pathname !== 'string') {
    throw createError({
      status: 400,
      message: 'Missing pathname'
    })
  }

  // Verify ownership via blob metadata.
  const item = await blob.head(pathname)

  if (!item) {
    throw createError({
      status: 404,
      message: 'File not found'
    })
  }

  const meta = item.customMetadata || {}
  const organizationId = session.activeOrganizationId

  if (meta.organizationId !== organizationId) {
    throw createError({
      status: 403,
      message: 'Forbidden'
    })
  }

  return pathname
}

export async function uploadFile(event, session) {
  const formData = await readFormData(event)
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw createError({
      status: 400,
      message: 'No file provided'
    })
  }

  // Validate MIME type.
  if (!allowedTypes.includes(file.type)) {
    throw createError({
      status: 400,
      message: 'File type not allowed'
    })
  }

  // Validate size.
  if (file.size > maxFileSize) {
    throw createError({
      status: 400,
      message: 'File too large'
    })
  }

  // Build pathname: {uuid}.{ext}
  const extension = file.name.split('.').pop() || 'bin'
  const id = crypto.randomUUID()
  const pathname = `${id}.${extension}`

  // Upload to blob storage.
  await blob.put(pathname, file, {
    contentType: file.type,

    customMetadata: {
      originalName: file.name,
      organizationId: session.activeOrganizationId,
      userId: session.userId
    }
  })

  return {
    pathname,
    originalName: file.name,
    contentType: file.type,
    size: file.size
  }
}

export async function deleteFile(pathname) {
  await blob.del(pathname)
}
