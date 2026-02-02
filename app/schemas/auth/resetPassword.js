import { z } from 'zod'
import * as f from '~/schemas/fields'

export default z.object({
  token: z.string().min(1),
  newPassword: f.password
})
