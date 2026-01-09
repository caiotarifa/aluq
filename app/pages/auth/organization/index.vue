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

          <p class="text-sm text-muted mt-1">
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
  setActiveOrganization,
  acceptInvitation,
  rejectInvitation
} = useOrganization()

const { fetchSession } = useAuth()

const redirectTo = computed(() =>
  route.query.redirect || '/app'
)

// Fetch organizations.
const {
  data: organizations,
  pending: isFetchingOrganizations
} = await useAsyncData('organizations', async () => {
  const { client } = useAuth()
  const result = await client.organization.list()

  return result.data || []
})

// Fetch invitations.
const {
  data: invitations,
  pending: isFetchingInvitations,
  refresh: refreshInvitations
} = await useAsyncData('invitations', async () => {
  const { client } = useAuth()
  const result = await client.organization.listUserInvitations()

  return result.data || []
})

const isLoadingOrganization = ref(false)

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
  const { id: organizationId } = await acceptInvitation(id)
  await setActiveOrganization(organizationId)
  await fetchSession()

  router.push(redirectTo.value)
}

async function onRejectInvitation({ id }) {
  await rejectInvitation(id)
  await refreshInvitations()
}
</script>
