import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import Century from './views/Century.vue'
import SkillAssessment from './views/SkillAssessment.vue'
import CTEIndustry from './views/CTEIndustry.vue'
import FormView from './views/FormView.vue'
import StudentForm from './views/StudentForm.vue'

const routes = [
  // Public / guest routes
  { path: '/', component: Login, name: 'login', meta: { title: 'Login', guestOnly: true } },
  {
    path: '/home',
    component: CTEIndustry,
    name: 'home',
    meta: { requiresAuth: true },
  },
  {
    path: '/nys',
    component: Century,
    meta: { requiresAuth: true },
  },
  {
    path: '/century',
    component: SkillAssessment,
    meta: { requiresAuth: true },
  },
  {
    path: '/form',
    component: FormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/student-form',
    component: StudentForm,
    meta: { requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Global auth / guest routing guard
router.beforeEach(async (to: RouteLocationNormalized) => {
  // In development mode, skip all auth checks and send users past Login
  if (import.meta.env.DEV) {
    // If the route is guestOnly (e.g., Login), send them to a sane default
    if (to.meta.guestOnly) {
      return { name: 'home' }
    }
    // Otherwise, allow navigation without checking auth
    return true
  }

  const requiresAuth = Boolean(to.meta.requiresAuth)
  const guestOnly = Boolean(to.meta.guestOnly)

  // Helper to check auth quickly
  async function isSignedIn() {
    try {
      await getCurrentUser()
      // Optionally attempt to fetch session (ensures tokens not expired)
      await fetchAuthSession()
      return true
    } catch {
      return false
    }
  }

  const signedIn = await isSignedIn()

  if (requiresAuth && !signedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (guestOnly && signedIn) {
    // If user came from a redirect param (unlikely), respect it, else go to a default
    return { name: 'home' }
  }
})

export default router
