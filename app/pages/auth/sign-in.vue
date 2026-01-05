<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <UAuthForm
        description="Insira seus dados para acessar sua conta."
        :fields
        :schema="authSignInByEmailSchema"
        :submit="submitButton"
        title="Bem-vindo"
        @submit="onSubmit"
      >
        <template #footer>
          <NuxtLink
            to="/auth/forgot-password"
            class="text-primary hover:underline"
          >
            Esqueci minha senha
          </NuxtLink>
        </template>
      </UAuthForm>

      <template #footer>
        <div class="text-sm text-muted text-center">
          Não tem uma conta?

          <NuxtLink
            to="/auth/sign-up"
            class="text-primary hover:underline"
          >
            Cadastre-se aqui.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { authSignInByEmailSchema } from '~/schemas/auth'

definePageMeta({
  middleware: ['guest']
})

useSeoMeta({
  title: 'Entrar'
})

// Fields.
const fields = [
  {
    name: 'email',
    type: 'text',
    inputmode: 'email',
    label: 'E-mail',
    placeholder: 'Digite o seu e-mail'
  },

  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite a sua senha'
  }
]

// Auth.
const { isSigningIn, signInByEmail } = useAuth()
const router = useRouter()

async function onSubmit(event) {
  const { data } = event

  await signInByEmail(data)
  router.push('/app')
}

// Submit button.
const appConfig = useAppConfig()

const submitButton = computed(() => {
  if (isSigningIn.value) {
    return {
      label: 'Entrando...',
      loading: true
    }
  }

  return {
    label: 'Entrar',
    trailingIcon: appConfig.ui.icons.arrowRight
  }
})
</script>
