import * as v from 'valibot'
import * as f from '~/schemas/fields'

export default v.object({
  token: f.token,
  newPassword: f.password
})
