import * as v from 'valibot'
import * as f from '~/schemas/fields'

export default v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.minLength(2)
    ),

    email: f.email,
    password: f.password,
    passwordConfirm: f.password
  }),

  v.forward(
    v.partialCheck(
      [['password'], ['passwordConfirm']],
      input => input.password === input.passwordConfirm
    ),
    ['passwordConfirm']
  )
)
