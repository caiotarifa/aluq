import * as v from 'valibot'

export default v.pipe(
  v.string(),

  v.minLength(8),
  v.maxLength(64),

  v.regex(/[a-z]/),
  v.regex(/[A-Z]/),
  v.regex(/[0-9]/),
  v.regex(/[^A-Za-z0-9]/)
)
