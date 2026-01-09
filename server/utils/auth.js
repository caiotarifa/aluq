import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'

import { zenstackAdapter } from '@zenstackhq/better-auth'

import { db } from './db'
import { sendMail } from './mailer'

export const auth = betterAuth({
  appName: 'Aluq',

  plugins: [
    admin(),

    organization()
  ],

  database: zenstackAdapter(db, {
    provider: 'sqlite'
  }),

  // TODO: create getInitialOrganization logic hook for betterAuth.
  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (session) => {
  //         const organization = await getInitialOrganization(session.userId)

  //         return {
  //           data: {
  //             ...session,
  //             activeOrganizationId: organization?.id
  //           }
  //         }
  //       }
  //     }
  //   }
  // },

  emailAndPassword: {
    enabled: true,

    sendResetPassword: ({ user, url }) => {
      sendMail({
        to: user.email,
        subject: 'Redefinir sua senha',

        html: resetPassword({
          name: user.name,
          url
        })
      })
    }
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: ({ user, url }) => {
      sendMail({
        to: user.email,
        subject: 'Verifique seu e-mail',

        html: emailVerification({
          name: user.name,
          url
        })
      })
    }
  },

  rateLimit: {
    enabled: true,

    customRules: {
      '/send-verification-email': {
        window: 60,
        max: 1
      }
    }
  }
})
