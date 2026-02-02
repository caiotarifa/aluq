import { z } from 'zod'

export default z.string()
  .min(8)
  .max(64)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[^A-Za-z0-9]/)
