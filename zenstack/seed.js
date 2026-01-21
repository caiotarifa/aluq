import 'dotenv/config'
import { faker } from '@faker-js/faker'

import { auth } from '../server/utils/auth.js'
import { db } from '../server/utils/db.js'

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function maybe(value) {
  return Math.random() > 0.5 ? value : null
}

function randomRole() {
  return faker.helpers.arrayElement(['admin', 'member', 'owner'])
}

function randomInvitationStatus() {
  return faker.helpers.arrayElement([
    'pending',
    'accepted',
    'rejected',
    'canceled'
  ])
}

/* -------------------------------------------------------------------------- */
/* Clean Database                                                             */
/* -------------------------------------------------------------------------- */

async function cleanDatabase() {
  console.log('Cleaning database...')

  await db.businessUnit.deleteMany()
  await db.invitation.deleteMany()
  await db.member.deleteMany()
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.verification.deleteMany()
  await db.organization.deleteMany()
  await db.user.deleteMany()

  console.log('Database cleaned!')
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

async function createUsers() {
  console.log('Creating users...')

  const { user: adminUser } = await auth.api.signUpEmail({
    body: {
      name: 'Admin User',
      email: 'admin@admin.com',
      password: 'Admin123!'
    }
  })

  await db.user.update({
    where: { id: adminUser.id },
    data: {
      emailVerified: true,
      role: 'admin',
      phone: maybe(faker.phone.number()),
      image: maybe(faker.image.avatar())
    }
  })

  const otherUsers = []

  for (let index = 0; index < 5; index++) {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Admin123!'
      }
    })

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: faker.datatype.boolean(),
        role: maybe(randomRole()),
        banned: maybe(faker.datatype.boolean()),
        banReason: maybe(faker.lorem.sentence()),
        banExpires: maybe(faker.date.future()),
        phone: maybe(faker.phone.number()),
        image: maybe(faker.image.avatar())
      }
    })

    otherUsers.push(user)
  }

  console.log(`Created ${otherUsers.length + 1} users!`)

  return { adminUser, otherUsers }
}

/* -------------------------------------------------------------------------- */
/* Organizations                                                              */
/* -------------------------------------------------------------------------- */

async function createOrganizations(adminUser) {
  console.log('Creating organizations...')

  const organizationsData = [
    {
      name: 'Acme Corporation',
      slug: 'acme',
      defaultLocale: 'pt-BR',
      defaultCurrencyCode: 'BRL'
    },
    {
      name: 'Globex Industries',
      slug: 'globex',
      defaultLocale: 'en-US',
      defaultCurrencyCode: 'USD'
    },
    {
      name: 'Umbrella Corp',
      slug: 'umbrella',
      defaultLocale: 'pt-BR',
      defaultCurrencyCode: 'BRL'
    }
  ]

  const organizations = []

  for (const data of organizationsData) {
    const organization = await db.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        logo: maybe(faker.image.url()),
        metadata: maybe(JSON.stringify({ industry: 'Technology' })),
        defaultLocale: data.defaultLocale,
        defaultCurrencyCode: data.defaultCurrencyCode
      }
    })

    await db.member.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        role: 'owner'
      }
    })

    organizations.push(organization)
  }

  console.log(`Created ${organizations.length} organizations!`)

  return organizations
}

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

async function addMembersToOrganizations(users, organizations) {
  console.log('Adding members to organizations...')

  let memberCount = 0

  for (const user of users) {
    const selectedOrganizations = faker.helpers.arrayElements(
      organizations,
      { min: 1, max: 2 }
    )

    for (const organization of selectedOrganizations) {
      await db.member.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: randomRole()
        }
      })

      memberCount++
    }
  }

  console.log(`Added ${memberCount} members!`)
}

/* -------------------------------------------------------------------------- */
/* Invitations                                                                */
/* -------------------------------------------------------------------------- */

async function createInvitations(adminUser, organizations) {
  console.log('Creating invitations...')

  const invitations = []

  for (const organization of organizations) {
    const count = faker.number.int({ min: 1, max: 3 })

    for (let index = 0; index < count; index++) {
      invitations.push({
        organizationId: organization.id,
        email: faker.internet.email().toLowerCase(),
        role: maybe(randomRole()),
        status: randomInvitationStatus(),
        expiresAt: faker.date.future(),
        inviterId: adminUser.id
      })
    }
  }

  await db.invitation.createMany({ data: invitations })

  console.log(`Created ${invitations.length} invitations!`)
}

/* -------------------------------------------------------------------------- */
/* Business Units                                                             */
/* -------------------------------------------------------------------------- */

async function createBusinessUnits(organizations) {
  console.log('Creating business units...')

  const businessUnits = []

  for (const organization of organizations) {
    const count = faker.number.int({ min: 20, max: 500 })

    for (let index = 0; index < count; index++) {
      businessUnits.push({
        organizationId: organization.id,
        isActive: faker.datatype.boolean({ probability: 0.8 }),
        name: faker.company.name(),
        legalName: maybe(faker.company.name() + ' LTDA'),
        taxId: maybe(faker.string.numeric(14))
      })
    }
  }

  await db.businessUnit.createMany({ data: businessUnits })

  console.log(`Created ${businessUnits.length} business units!`)
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log('Starting seed...\n')

  await cleanDatabase()

  const { adminUser, otherUsers } = await createUsers()
  const organizations = await createOrganizations(adminUser)

  await addMembersToOrganizations(otherUsers, organizations)
  await createInvitations(adminUser, organizations)
  await createBusinessUnits(organizations)

  console.log('\nSeed completed successfully!')
  console.log('\nAdmin credentials:')
  console.log('  Email: admin@admin.com')
  console.log('  Password: Admin123!')
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
