<template>
  <div class="auth-wrapper">
    <div class="auth-card" :class="{ loading: loading }">
      <div class="card-header">
        <h1 class="title" v-if="step === 'login'">Sign in</h1>
        <h1 class="title" v-else>Set new password</h1>
        <p class="subtitle" v-if="step === 'login'">Access your account to continue</p>
        <p class="subtitle" v-else>Complete the required password update</p>
      </div>

      <form v-if="step === 'login'" @submit.prevent="login" novalidate>
        <div class="field-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model.trim="username"
            :disabled="loading"
            autocomplete="username"
            placeholder="you@example.com"
            @keyup.enter="login"
          />
        </div>
        <div class="field-group">
          <label for="password" class="pw-label">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              :disabled="loading"
              autocomplete="current-password"
              placeholder="••••••••"
              @keyup.enter="login"
            />
            <button
              type="button"
              class="pw-toggle"
              @click="toggleShowPassword"
              :disabled="loading"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>
        </div>
        <div class="actions">
          <button class="primary" type="submit" :disabled="disableSubmit">
            <span v-if="!loading">Sign in</span>
            <span v-else class="spinner" aria-live="polite"></span>
          </button>
        </div>
      </form>

      <form v-else @submit.prevent="completeNewPassword" novalidate>
        <div class="field-group">
          <label for="newPassword">New password</label>
          <input
            id="newPassword"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            :disabled="loading"
            placeholder="Create a strong password"
            autocomplete="new-password"
          />
          <small class="hint">8+ chars, mix upper/lower, number, symbol.</small>
        </div>
        <div class="actions">
          <button type="submit" class="primary" :disabled="!isNewPasswordValid || loading">
            <span v-if="!loading">Update password</span>
            <span v-else class="spinner"></span>
          </button>
          <button type="button" class="ghost" @click="resetToLogin" :disabled="loading">
            Back
          </button>
        </div>
      </form>

      <transition name="fade">
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </transition>
    </div>
  </div>
</template>

<script>
import { signIn, confirmSignIn, fetchAuthSession } from 'aws-amplify/auth'
import router from '../router'
import { authFetch } from '../authFetch'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      newPassword: '',
      step: 'login', // 'login' | 'resetPassword'
      loading: false,
      showPassword: false,
      showNewPassword: false,
      error: '',
    }
  },
  computed: {
    disableSubmit() {
      return this.loading || !this.username || !this.password
    },
    isNewPasswordValid() {
      // Basic strength heuristic
      const p = this.newPassword
      return (
        /[A-Z]/.test(p) &&
        /[a-z]/.test(p) &&
        /\d/.test(p) &&
        /[^A-Za-z0-9]/.test(p) &&
        p.length >= 8
      )
    },
  },
  methods: {
    async login() {
      if (this.disableSubmit) return
      this.error = ''
      this.loading = true
      try {
        const result = await signIn({
          username: this.username,
          password: this.password,
        })

        if (result.isSignedIn) {
          await this.handlePostSignIn()
          return
        }

        const step = result.nextStep?.signInStep
        if (step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          this.step = 'resetPassword'
          this.$nextTick(() => {
            const el = document.getElementById('newPassword')
            el && el.focus()
          })
        } else {
          console.info('Unhandled next step', step)
        }
      } catch (err) {
        this.error = err?.message || 'Login failed'
      } finally {
        this.loading = false
      }
    },
    async completeNewPassword() {
      if (!this.isNewPasswordValid) return
      this.error = ''
      this.loading = true
      try {
        await confirmSignIn({ challengeResponse: this.newPassword })
        await this.handlePostSignIn()
      } catch (err) {
        this.error = err?.message || 'Password update failed'
      } finally {
        this.loading = false
      }
    },
    async handlePostSignIn() {
      const redirect = this.$route?.query?.redirect
      if (redirect && typeof redirect === 'string') {
        router.push(redirect)
      } else {
        router.push({ name: 'home' })
      }
    },
    toggleShowPassword() {
      this.showPassword = !this.showPassword
    },
    resetToLogin() {
      this.step = 'login'
      this.newPassword = ''
      this.error = ''
    },
  },
}
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 30%, #1f2937, #111827);
  padding: 2rem;
  color: #fff;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #1f2430;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2.25rem 2rem 2.5rem;
  position: relative;
  box-shadow:
    0 8px 32px -8px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}
.card-header {
  margin-bottom: 1.75rem;
}
.title {
  margin: 0 0 0.25rem;
  font-size: 1.85rem;
  letter-spacing: -0.5px;
  font-weight: 600;
}
.subtitle {
  margin: 0;
  color: #9ca3af;
  font-size: 0.95rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #d1d5db;
}
input {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  font-size: 0.95rem;
  color: #f9fafb;
  transition:
    border-color 0.18s,
    background 0.18s,
    box-shadow 0.18s;
}
input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
}
input:disabled {
  opacity: 0.6;
}
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  width: 100%;
  padding-right: 3rem;
}
.pw-toggle {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  color: #9ca3af;
  transition:
    background 0.18s,
    color 0.18s;
}
.pw-toggle:hover:not(:disabled) {
  background: #1f2937;
  color: #f3f4f6;
}
.pw-toggle:disabled {
  cursor: not-allowed;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}
button.primary {
  flex: 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    filter 0.18s,
    transform 0.18s,
    box-shadow 0.18s;
  box-shadow: 0 4px 16px -4px rgba(99, 102, 241, 0.5);
}
button.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
}
button.primary:active:not(:disabled) {
  transform: translateY(0);
}
button.primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

button.ghost {
  background: transparent;
  color: #d1d5db;
  border: 1px solid #374151;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border-color 0.18s;
}
button.ghost:hover:not(:disabled) {
  background: #1f2937;
  border-color: #4b5563;
  color: #f3f4f6;
}
button.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  margin-top: 1.2rem;
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 0.75rem 0.9rem;
  font-size: 0.8rem;
  border-radius: 10px;
  line-height: 1.3;
}
.hint {
  color: #9ca3af;
  font-size: 0.7rem;
  margin-top: 0.2rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.75rem 1.4rem 2rem;
  }
  .title {
    font-size: 1.55rem;
  }
}
</style>
