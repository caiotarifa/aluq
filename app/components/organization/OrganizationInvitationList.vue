<template>
  <div class="space-y-3">
    <UAlert
      v-for="invitation in invitations"
      :key="invitation.id"
      :actions="getActions(invitation)"
      :avatar="{ alt: invitation.organizationName }"
      class="ring-primary/25 transition-opacity"
      :class="{ 'opacity-50 pointer-events-none': loading && !isSelected(invitation) }"
      color="neutral"
      orientation="vertical"
      :title="invitation.organizationName"
      :variant="isExpired(invitation) ? 'soft' : 'outline'"
    >
      <template #description>
        <span
          v-if="isExpired(invitation)"
          class="text-error italic"
        >
          Convite expirado.
        </span>

        <span
          v-else
          class="italic"
        >
          {{ roleLabel(invitation.role) }}
        </span>
      </template>
    </UAlert>
  </div>
</template>

<script setup>
defineProps({
  invitations: {
    type: Array,
    required: true
  }
})

const loading = defineModel('loading', {
  type: [Boolean, String],
  default: false
})

const emit = defineEmits([
  'accept',
  'reject'
])

const roleLabels = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro'
}

function roleLabel(role) {
  return roleLabels[role] || 'Membro'
}

function isExpired(invitation) {
  return new Date(invitation.expiresAt) < new Date()
}

function isSelected({ id }) {
  return [`${id}:accept`, `${id}:reject`].includes(loading.value)
}

function getActions(invitation) {
  if (isExpired(invitation)) {
    return []
  }

  const isLoadingAccept = loading.value === `${invitation.id}:accept`
  const isLoadingReject = loading.value === `${invitation.id}:reject`

  return [
    {
      color: 'neutral',
      label: 'Recusar',
      leadingIcon: 'i-tabler-x',
      variant: 'subtle',
      loading: isLoadingReject,
      disabled: isLoadingAccept,
      onClick: () => {
        if (loading.value) return
        emit('reject', invitation)
      }
    },
    {
      label: 'Aceitar',
      leadingIcon: 'i-tabler-check',
      variant: 'subtle',
      loading: isLoadingAccept,
      disabled: isLoadingReject,
      onClick: () => {
        if (loading.value) return
        emit('accept', invitation)
      }
    }
  ]
}
</script>
