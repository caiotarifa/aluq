<template>
  <div class="space-y-3">
    <UAlert
      v-for="invitation in invitations"
      :key="invitation.id"
      :title="invitation.organizationName"
      :description="roleLabel(invitation.role)"
      :avatar="{ alt: invitation.organizationName }"
      color="neutral"
      variant="outline"
      orientation="vertical"
      :actions="getActions(invitation)"
    />
  </div>
</template>

<script setup>
defineProps({
  invitations: {
    type: Array,
    required: true
  }
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

function getActions(invitation) {
  return [
    {
      color: 'neutral',
      label: 'Recusar',
      leadingIcon: 'i-tabler-x',
      variant: 'subtle',
      onClick: () => emit('reject', invitation)
    },
    {
      label: 'Aceitar',
      leadingIcon: 'i-tabler-check',
      variant: 'subtle',
      onClick: () => emit('accept', invitation)
    }
  ]
}
</script>
