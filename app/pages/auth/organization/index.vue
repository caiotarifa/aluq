<template>
  <NuxtLayout
    name="auth"
    wide
  >
    <AuthCard>
      <div class="space-y-6">
        <header class="text-center">
          <h1 class="text-xl font-semibold text-highlighted">
            {{ hasOrganizations ? 'Organizações' : 'Vamos começar...' }}
          </h1>

          <p class="mt-1 text-sm text-muted">
            Selecione ou crie uma organização para continuar.
          </p>
        </header>

        <div
          v-if="isLoading"
          class="flex justify-center py-8"
        >
          <UIcon
            class="size-6 animate-spin text-muted"
            name="i-tabler-loader-2"
          />
        </div>

        <template v-else-if="hasOrganizations">
          <OrganizationList
            v-model:loading="isLoadingOrganization"
            :organizations
            :to="redirectTo"
            @select="onSelectOrganization"
          />

          <div class="text-center">
            <UButton
              :icon="appConfig.ui.icons.plus"
              to="/auth/organization/new"
              variant="subtle"
            >
              Criar organização
            </UButton>
          </div>
        </template>

        <div
          v-else
          class="grid gap-6 md:grid-cols-2"
        >
          <UCard variant="outline">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  icon="i-tabler-users-group"
                  size="lg"
                />

                <h2 class="font-medium text-highlighted">
                  Entrar em uma organização
                </h2>
              </div>

              <p class="text-sm text-muted">
                Aceite um convite para começar a colaborar em uma organização existente.
              </p>

              <OrganizationInvitationList
                v-if="hasInvitations"
                v-model:loading="isLoadingInvitation"
                :invitations
                @accept="onAcceptInvitation"
                @reject="onRejectInvitation"
              />

              <UFieldGroup
                v-else
                class="w-full"
              >
                <UInput
                  class="w-full"
                  :value="userEmail"
                  readonly
                />

                <CopyButton
                  :button="{ variant: 'subtle' }"
                  :compact="false"
                  :text="userEmail"
                />
              </UFieldGroup>
            </div>
          </UCard>

          <UCard variant="outline">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  icon="i-tabler-building"
                  size="lg"
                />

                <h2 class="font-medium text-highlighted">
                  Criar uma organização
                </h2>
              </div>

              <p class="text-sm text-muted">
                Inicie uma nova organização para gerenciar sua equipe e seus aluguéis.
              </p>

              <UButton
                block
                :icon="appConfig.ui.icons.plus"
                to="/auth/organization/new"
                variant="subtle"
              >
                Criar organização
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  auth: { only: 'user' }
})

useSeoMeta({
  title: 'Organizações'
})

const appConfig = useAppConfig()
const router = useRouter()
const route = useRoute()

const {
  userEmail,
  organizations,
  isFetchingOrganizations,
  fetchOrganizations,
  setActiveOrganization,
  acceptInvitation,
  rejectInvitation
} = useOrganization()

const { fetchSession } = useAuth()

const redirectTo = computed(() =>
  route.query.redirect || '/app'
)

// Fetch organizations.
await useAsyncData('auth:organizations', () =>
  fetchOrganizations()
)

// Fetch invitations.
// Only get the latest invitation per organization.
const {
  data: invitations,
  pending: isFetchingInvitations,
  refresh: refreshInvitations
} = await useAsyncData('auth:invitations', async () => {
  const { client } = useAuth()
  const result = await client.organization.listUserInvitations()
  const allInvitations = result.data || []
  const byOrganization = {}

  const memberOrganizationIds = new Set(
    organizations.value?.map(({ id }) => id) || []
  )

  for (const invitation of allInvitations) {
    const { organizationId } = invitation

    if (memberOrganizationIds.has(organizationId)) {
      continue
    }

    const existing = byOrganization[organizationId]

    if (
      !existing
      || new Date(invitation.expiresAt) > new Date(existing.expiresAt)
    ) {
      byOrganization[organizationId] = invitation
    }
  }

  return Object.values(byOrganization).filter(
    invitation => invitation.status === 'pending'
  )
})

const isLoadingOrganization = ref(false)
const isLoadingInvitation = ref(false)

const isLoading = computed(() =>
  isFetchingOrganizations.value || isFetchingInvitations.value
)

const hasOrganizations = computed(() =>
  organizations.value && organizations.value.length > 0
)

const hasInvitations = computed(() =>
  invitations.value && invitations.value.length > 0
)

async function onSelectOrganization({ id }) {
  isLoadingOrganization.value = id

  try {
    await setActiveOrganization(id)
    await fetchSession()

    router.push(redirectTo.value)
  }
  finally {
    isLoadingOrganization.value = false
  }
}

async function onAcceptInvitation({ id }) {
  isLoadingInvitation.value = `${id}:accept`

  try {
    const { id: organizationId } = await acceptInvitation(id)
    await setActiveOrganization(organizationId)
    await fetchSession()

    router.push(redirectTo.value)
  }
  finally {
    isLoadingInvitation.value = false
  }
}

async function onRejectInvitation({ id }) {
  isLoadingInvitation.value = `${id}:reject`

  try {
    await rejectInvitation(id)
    await refreshInvitations()
  }
  finally {
    isLoadingInvitation.value = false
  }
}
</script>
