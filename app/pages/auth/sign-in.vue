<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <UAuthForm
        ref="authForm"
        description="Insira seus dados para acessar sua conta."
        :fields
        :schema="authSignInByEmailSchema"
        :submit="submitButton"
        title="Bem-vindo"
        @submit="onSubmit"
      >
        <template #footer>
          <NuxtLink
            class="text-primary hover:underline"
            :to="forgotPasswordLink"
          >
            Esqueci minha senha
          </NuxtLink>
        </template>
      </UAuthForm>

      <template #footer>
        <div class="text-center text-sm text-muted">
          Não tem uma conta?

          <NuxtLink
            class="text-primary hover:underline"
            to="/auth/sign-up"
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
  auth: { only: 'guest' }
})

useSeoMeta({
  title: 'Entrar'
})

// Auth form ref.
const authForm = useTemplateRef('authForm')

// Forgot password link.
const forgotPasswordLink = computed(() => {
  const email = authForm.value?.state?.email?.trim()

  if (email) {
    return `/auth/password/forgot?email=${encodeURIComponent(email)}`
  }

  return '/auth/password/forgot'
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
  },

  {
    name: 'rememberMe',
    label: 'Manter conectado',
    type: 'checkbox'
  }
]

// Auth.
const { isSigningIn, signInByEmail, isEmailVerified } = useAuth()
const route = useRoute()
const router = useRouter()

async function onSubmit(event) {
  await signInByEmail(event.data)

  if (!isEmailVerified.value) {
    return router.push('/auth/email-verification')
  }

  const redirectTo = route.query.redirect || '/app'
  return router.push(redirectTo)
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
