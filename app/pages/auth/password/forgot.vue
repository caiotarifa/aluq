<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <UAuthForm
        v-if="!isEmailSent"
        description="Informe o seu e-mail para receber o link de redefinição de senha."
        :fields
        :schema="authForgotPasswordSchema"
        :submit="submitButton"
        title="Esqueci minha senha"
        @submit="onSubmit"
      />

      <template v-else>
        <div class="text-center">
          <UIcon
            name="i-tabler-mail-fast"
            class="size-12 text-primary"
          />

          <h2 class="text-2xl font-bold">
            Verifique o seu e-mail
          </h2>

          <p class="mt-2 text-sm text-muted">
            Enviamos um link de redefinição de senha para o seu e-mail. Verifique sua caixa de entrada e siga as instruções.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="text-center text-sm text-muted">
          Lembrou a senha?

          <NuxtLink
            to="/auth/sign-in"
            class="text-primary hover:underline"
          >
            Voltar para o login.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { authForgotPasswordSchema } from '~/schemas/auth'

definePageMeta({
  auth: { only: 'guest' }
})

useSeoMeta({
  title: 'Esqueci minha senha'
})

// Route.
const route = useRoute()

// State.
const isEmailSent = ref(false)

// Fields.
const fields = [
  {
    name: 'email',
    type: 'text',
    inputmode: 'email',
    label: 'E-mail',
    placeholder: 'Digite o seu e-mail',
    defaultValue: route.query.email
  }
]

// Auth.
const { isSendingResetEmail, forgotPassword } = useAuth()

async function onSubmit(event) {
  await forgotPassword(event.data)
  isEmailSent.value = true
}

// Submit button.
const appConfig = useAppConfig()

const submitButton = computed(() => {
  if (isSendingResetEmail.value) {
    return {
      label: 'Enviando...',
      loading: true
    }
  }

  return {
    label: 'Enviar link',
    trailingIcon: appConfig.ui.icons.arrowRight
  }
})
</script>
