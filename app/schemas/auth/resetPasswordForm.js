import { z } from 'zod'
import * as f from '~/schemas/fields'

export default z.object({
  newPassword: f.password
})
