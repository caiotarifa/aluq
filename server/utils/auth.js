import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'

import { zenstackAdapter } from '@zenstackhq/better-auth'

import { db } from './db'

export const auth = betterAuth({
  appName: 'Loca1',

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
    enabled: true
  }
})
