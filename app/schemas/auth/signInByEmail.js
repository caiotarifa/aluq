import { z } from 'zod'
import * as f from '~/schemas/fields'

export default z.object({
  email: f.email,
  password: f.password,
  rememberMe: z.boolean().optional()
})
