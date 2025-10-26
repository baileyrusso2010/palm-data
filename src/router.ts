import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import FileUpload from './views/FileUpload.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import OnBoarding from './views/OnBoarding.vue'
import ClassCreation from './views/ClassCreation.vue'
import ClassView from './views/ClassView.vue'
import StudentProfile from './views/StudentProfile.vue'
import PDFView from './views/PDFView.vue'
import ProgramData from './views/ProgramData.vue'

const routes = [
  // Public / guest routes
  { path: '/', component: Login, name: 'login', meta: { title: 'Login', guestOnly: true } },
  {
    path: '/home',
    component: PDFView,
    name: 'home',
    meta: { requiresAuth: true },
  },
  {
    path: '/pdf_view',
    component: PDFView,
    meta: { requiresAuth: true },
  },
  {
    path: '/program_data',
    component: ProgramData,
    meta: { requiresAuth: true },
  },
  {
    path: '/class_view',
    component: ClassView,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: StudentProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/class_creation',
    component: ClassCreation,
    meta: { requiresAuth: true },
  },
  {
    path: '/onboard',
    component: OnBoarding,
    meta: { requiresAuth: true },
  },
  {
    path: '/upload',
    component: FileUpload,
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
