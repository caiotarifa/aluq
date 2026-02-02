import { z } from 'zod'
import * as f from '~/schemas/fields'

export default z.object({
  name: z.string().min(2),
  email: f.email,
  password: f.password,
  passwordConfirm: f.password
}).refine(
  data => data.password === data.passwordConfirm,
  { path: ['passwordConfirm'] }
)
