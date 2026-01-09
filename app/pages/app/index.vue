<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Index APP
      </h1>

      <div class="mt-4">
        <strong>Organização:</strong>
        <br> {{ organizationName || 'Nenhuma' }}
        <br> {{ activeOrganizationId || 'Sem ID' }}
      </div>
    </div>

    <UCard
      v-if="activeOrganizationId"
      class="max-w-md"
    >
      <template #header>
        <h2 class="font-semibold">
          Convidar membro
        </h2>
      </template>

      <div class="space-y-4">
        <UInput
          v-model="inviteEmail"
          placeholder="Email do membro"
          type="email"
        />

        <USelect
          v-model="inviteRole"
          :options="roleOptions"
        />

        <UButton
          block
          :loading="isInviting"
          @click="sendInvite"
        >
          Enviar convite
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  auth: { only: 'user' }
})

const { activeOrganizationId, client } = useAuth()
const { notifySuccess, notifyError } = useNotify()

// Fetch organizations.
const {
  data: organizations
} = await useAsyncData('organizations', async () => {
  const { client } = useAuth()
  const result = await client.organization.list()

  return result.data || []
})

const organizationName = computed(() => {
  if (!activeOrganizationId.value || !organizations.value) return null

  return organizations.value.find(organization =>
    organization.id === activeOrganizationId.value
  )?.name
})

// Invite member
const inviteEmail = ref('')
const inviteRole = ref('member')
const isInviting = ref(false)

const roleOptions = [
  { label: 'Membro', value: 'member' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Proprietário', value: 'owner' }
]

async function sendInvite() {
  if (!inviteEmail.value || !activeOrganizationId.value) return

  isInviting.value = true

  try {
    const result = await client.organization.inviteMember({
      email: inviteEmail.value,
      role: inviteRole.value,
      organizationId: activeOrganizationId.value
    })

    if (result.error) {
      throw new Error(result.error.message || 'Erro ao enviar convite')
    }

    notifySuccess({
      title: 'Convite enviado com sucesso!'
    })

    inviteEmail.value = ''
  }
  catch (error) {
    notifyError({
      description: error.message || 'Erro ao enviar convite'
    })
  }
  finally {
    isInviting.value = false
  }
}
</script>
