import { z } from 'zod'

export default z.string()
  .trim()
  .min(3)
  .regex(/^[a-z0-9-]+$/)
  .regex(/^[a-z0-9].*[a-z0-9]$/)
