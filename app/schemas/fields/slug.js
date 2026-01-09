import * as v from 'valibot'

export default v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3),
  v.regex(/^[a-z0-9-]+$/),
  v.regex(/^[a-z0-9].*[a-z0-9]$/)
)
