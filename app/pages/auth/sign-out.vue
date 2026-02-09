<template>
  <NuxtLayout name="auth">
    <AuthCard class="text-center">
      <UIcon
        v-if="isSigningOut"
        class="size-12 animate-spin text-muted"
        :name="appConfig.ui.icons.loading"
      />

      <UIcon
        v-else
        class="size-12 text-green-500"
        :name="appConfig.ui.icons.success"
      />

      <h2 class="text-2xl font-bold">
        {{ isSigningOut ? 'Saindo...' : 'Até logo!' }}
      </h2>

      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ isSigningOut ? 'Aguarde enquanto finalizamos sua sessão.' : 'Você foi desconectado com sucesso.' }}
      </p>

      <template #footer>
        <div class="text-center text-sm text-muted">
          Deseja entrar novamente?

          <NuxtLink
            class="text-primary hover:underline"
            to="/auth/sign-in"
          >
            Fazer login.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
definePageMeta({
  auth: { verifiedEmail: false }
})

useSeoMeta({
  title: 'Saindo...'
})

const appConfig = useAppConfig()
const { isSigningOut, signOut } = useAuth()
const router = useRouter()

onMounted(async () => {
  await signOut()

  setTimeout(() => {
    router.push('/auth/sign-in')
  }, 5000)
})
</script>
