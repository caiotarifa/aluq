import * as v from 'valibot'
import * as f from '~/schemas/fields'

export default v.object({
  email: f.email,
  password: f.password
})
