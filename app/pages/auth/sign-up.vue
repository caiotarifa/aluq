<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <UAuthForm
        description="Crie sua conta para começar a usar nossa plataforma."
        :fields
        :schema="authSignUpByEmailSchema"
        :submit="submitButton"
        title="Criar conta"
        @submit="onSubmit"
      />

      <template #footer>
        <div class="text-center text-sm text-muted">
          Já tem uma conta?

          <NuxtLink
            to="/auth/sign-in"
            class="text-sm text-primary hover:underline"
          >
            Faça login.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { authSignUpByEmailSchema } from '~/schemas/auth'

definePageMeta({
  auth: { only: 'guest' }
})

useSeoMeta({
  title: 'Cadastre-se'
})

// Fields.
const fields = [
  {
    name: 'name',
    type: 'text',
    label: 'Nome'
  },

  {
    name: 'email',
    type: 'text',
    inputmode: 'email',
    label: 'E-mail'
  },

  {
    name: 'password',
    label: 'Senha',
    type: 'password'
  },

  {
    name: 'passwordConfirm',
    label: 'Confirmar senha',
    type: 'password'
  }
]

// Auth.
const { isSigningUp, signUpByEmail } = useAuth()
const router = useRouter()

async function onSubmit(event) {
  await signUpByEmail(event.data)
  router.push('/auth/email-verification')
}

// Submit button.
const appConfig = useAppConfig()

const submitButton = computed(() => {
  if (isSigningUp.value) {
    return {
      label: 'Criando conta...',
      loading: true
    }
  }

  return {
    label: 'Criar conta',
    trailingIcon: appConfig.ui.icons.arrowRight
  }
})
</script>
