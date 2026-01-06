import * as v from 'valibot'
import * as f from '~/schemas/fields'

export default v.object({
  newPassword: f.password
})
