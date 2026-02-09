<template>
  <NuxtLayout name="auth">
    <AuthCard>
      <div class="space-y-4 text-center">
        <UIcon
          :class="['size-12', currentStatus.iconClass]"
          :name="currentStatus.icon"
        />

        <h2 class="text-2xl font-bold">
          {{ currentStatus.title }}
        </h2>

        <p class="text-sm text-muted">
          {{ currentStatus.description }}

          <strong
            v-if="!isVerifying && !verificationFailed && currentUser?.email"
            class="text-default"
          >
            {{ currentUser.email }}
          </strong>
        </p>

        <UButton
          v-if="!isVerifying"
          block
          :disabled="!canResend"
          :loading="isSendingVerificationEmail"
          @click="resend"
        >
          {{ canResend ? 'Reenviar e-mail de verificação' : `Reenviar em ${countdown}s` }}
        </UButton>
      </div>

      <template #footer>
        <div class="text-center text-sm text-muted">
          Quer usar outro e-mail?

          <NuxtLink
            class="text-primary hover:underline"
            to="/auth/sign-out"
          >
            Sair e criar nova conta.
          </NuxtLink>
        </div>
      </template>
    </AuthCard>
  </NuxtLayout>
</template>

<script setup>
import { useCountdown } from '@vueuse/core'

definePageMeta({
  auth: { only: 'unverified' }
})

useSeoMeta({
  title: 'Verificar e-mail'
})

const COUNTDOWN_DURATION = 60

// Router.
const router = useRouter()

const token = computed(() =>
  useRoute().query.token
)

// Auth.
const {
  currentUser,
  isSendingVerificationEmail,
  sendVerificationEmail,
  verifyEmail,
  fetchSession
} = useAuth()

// Countdown with cookie persistence.
const countdownEnd = useCookie('email_verification_countdown_end')

function getRemaining() {
  const end = countdownEnd.value || 0
  return Math.max(0, Math.ceil((end - Date.now()) / 1000))
}

const {
  remaining: countdown,
  start: startCountdown
} = useCountdown(0, {
  onComplete: () => { countdownEnd.value = null }
})

// Mounted.
onMounted(() => {
  const remaining = getRemaining()
  if (remaining > 0) startCountdown(remaining)
})

// Token.
const { status: verificationStatus } = useAsyncData(
  'email-verification',

  async () => {
    if (!token.value) return null

    await verifyEmail(token.value)
    await fetchSession()

    router.push('/app')
    return true
  },

  {
    watch: [token]
  }
)

const isVerifying = computed(() =>
  verificationStatus.value === 'pending' && !!token.value
)

const verificationFailed = computed(() =>
  verificationStatus.value === 'error'
)

// Status.
const appConfig = useAppConfig()

const statusConfig = {
  verifying: {
    icon: appConfig.ui.icons.loading,
    iconClass: 'text-primary animate-spin',
    title: 'Verificando seu e-mail',
    description: 'Aguarde enquanto confirmamos seu e-mail...'
  },

  failed: {
    icon: appConfig.ui.icons.error,
    iconClass: 'text-error',
    title: 'Falha na verificação',
    description: 'O link é inválido ou expirou. Solicite um novo.'
  },

  pending: {
    icon: 'i-tabler-mail-fast',
    iconClass: 'text-primary',
    title: 'Verifique seu e-mail',
    description: 'Enviamos um link de verificação para'
  }
}

const currentStatus = computed(() => {
  if (isVerifying.value) return statusConfig.verifying
  if (verificationFailed.value) return statusConfig.failed
  return statusConfig.pending
})

// Resend.
const canResend = computed(() =>
  countdown.value === 0
)

async function resend() {
  if (!canResend.value || !currentUser.value?.email) return

  const result = await sendVerificationEmail(currentUser.value.email)
  const duration = result?.retryAfter || COUNTDOWN_DURATION

  countdownEnd.value = Date.now() + duration * 1000
  startCountdown(duration)
}
</script>
