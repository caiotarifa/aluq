<template>
  <NuxtLayout name="auth">
    <AuthCard class="text-center">
      <UIcon
        v-if="isSigningOut"
        :name="appConfig.ui.icons.loading"
        class="size-12 animate-spin text-muted"
      />

      <UIcon
        v-else
        :name="appConfig.ui.icons.success"
        class="size-12 text-green-500"
      />

      <h2 class="text-2xl font-bold">
        {{ isSigningOut ? 'Saindo...' : 'Até logo!' }}
      </h2>

      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ isSigningOut ? 'Aguarde enquanto finalizamos sua sessão.' : 'Você foi desconectado com sucesso.' }}
      </p>

      <template #footer>
        <div class="text-sm text-muted text-center">
          Deseja entrar novamente?

          <NuxtLink
            to="/auth/sign-in"
            class="text-primary hover:underline"
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
