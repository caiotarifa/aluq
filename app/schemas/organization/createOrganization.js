import { z } from 'zod'
import { slug } from '~/schemas/fields'

export default z.object({
  name: z.string().min(2),
  slug
})
