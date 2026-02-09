<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <UAuthForm
        description="Digite sua nova senha para redefinir o acesso à sua conta."
        :fields
        :schema="authResetPasswordFormSchema"
        :submit="submitButton"
        title="Redefinir senha"
        @submit="onSubmit"
      />

      <template #footer>
        <div class="text-center text-sm text-muted">
          Lembrou a senha?

          <NuxtLink
            class="text-primary hover:underline"
            to="/auth/sign-in"
          >
            Voltar para o login.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { authResetPasswordFormSchema } from '~/schemas/auth'

definePageMeta({
  auth: { only: 'guest' },

  validate(route) {
    return !!route.query.token
  }
})

useSeoMeta({
  title: 'Redefinir senha'
})

// Route.
const route = useRoute()
const router = useRouter()

// Token from query string.
const token = computed(() =>
  route.query.token
)

// Fields.
const fields = [
  {
    name: 'newPassword',
    label: 'Nova senha',
    type: 'password',
    placeholder: 'Digite a sua nova senha'
  }
]

// Auth.
const { isResettingPassword, resetPassword } = useAuth()

async function onSubmit(event) {
  await resetPassword({
    token: token.value,
    ...event.data
  })

  router.push('/auth/sign-in')
}

// Submit button.
const appConfig = useAppConfig()

const submitButton = computed(() => {
  if (isResettingPassword.value) {
    return {
      label: 'Redefinindo...',
      loading: true
    }
  }

  return {
    label: 'Redefinir senha',
    trailingIcon: appConfig.ui.icons.arrowRight
  }
})
</script>
