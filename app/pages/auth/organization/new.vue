<template>
  <NuxtLayout
    name="auth"
    wide
  >
    <AuthCard>
      <div class="space-y-6">
        <header class="text-center">
          <h1 class="text-xl font-semibold text-highlighted">
            Criar organização
          </h1>

          <p class="mt-1 text-sm text-muted">
            Preencha os dados abaixo para criar sua nova organização.
          </p>
        </header>

        <UForm
          class="space-y-4"
          :schema="createOrganizationSchema"
          :state="formState"
          @submit="onSubmit"
        >
          <UFormField
            label="Nome da organização"
            name="name"
          >
            <UInput
              v-model="formState.name"
              autofocus
              placeholder="Minha Empresa"
              @update:model-value="generateSlug"
            />
          </UFormField>

          <UFormField
            label="Slug"
            name="slug"
          >
            <UInput
              v-model="formState.slug"
              placeholder="minha-empresa"
            />
          </UFormField>

          <div class="flex gap-3 pt-4">
            <UButton
              block
              color="neutral"
              to="/auth/organization"
              variant="soft"
            >
              Cancelar
            </UButton>

            <UButton
              block
              :loading="isCreatingOrganization"
              type="submit"
            >
              <template #leading>
                <UIcon name="i-tabler-plus" />
              </template>

              {{ isCreatingOrganization ? 'Criando...' : 'Criar organização' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { deburr } from 'es-toolkit/string'
import { createOrganizationSchema } from '~/schemas/organization'

definePageMeta({
  auth: { only: 'user' }
})

useSeoMeta({
  title: 'Criar organização'
})

const router = useRouter()

const {
  isCreatingOrganization,
  createOrganization,
  setActiveOrganization
} = useOrganization()

// Form state.
const formState = reactive({
  name: '',
  slug: ''
})

// Generate slug from name.
function generateSlug(name) {
  formState.slug = deburr(name).toLowerCase().replace(/\s+/g, '-')
}

// Submit form.
async function onSubmit() {
  const organization = await createOrganization(formState)

  await setActiveOrganization(organization.id)
  router.push('/')
}
</script>
