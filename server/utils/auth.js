import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'

import { zenstackAdapter } from '@zenstackhq/better-auth'

import { db } from './db'

export const auth = betterAuth({
  appName: 'Aluq',

  plugins: [
    admin(),

    organization()
  ],

  database: zenstackAdapter(db, {
    provider: 'sqlite'
  }),

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

    sendResetPassword: async ({ user, url, token }) => {
      console.log('Send reset password:', { user, url, token })
    }
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url, token }) => {
      console.log('Send verification email:', { user, url, token })
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
