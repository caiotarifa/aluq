import * as v from 'valibot'
import { slug } from '~/schemas/fields'

export default v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2)
  ),

  slug
})
