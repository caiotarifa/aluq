import * as v from 'valibot'

export default v.pipe(
  v.string(),
  v.email()
)
