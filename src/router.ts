import { createRouter, createWebHistory } from 'vue-router'
import ClassView from './views/ClassView.vue'
import WBLAdmin from './views/WBLAdmin.vue'
import StudentProfile from './views/StudentProfile.vue'
import Gradebook from './views/Gradebook.vue'
import Assignments from './views/Assignments.vue'
import Settings from './views/Settings.vue'
import ClassManager from './components/ClassManager.vue'
import FileUpload from './views/FileUpload.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

const routes = [
  // Public / guest routes
  { path: '/', component: Login, name: 'login', meta: { title: 'Login', guestOnly: true } },
  {
    path: '/home',
    component: Home,
    name: 'home',
    meta: { requiresAuth: true },
  },
  // Protected routes
  {
    path: '/classes',
    component: ClassManager,
    name: 'classes',
    meta: { title: 'Classes', requiresAuth: true },
  },
  {
    path: '/classes/:id',
    component: ClassView,
    name: 'class-view',
    meta: { title: 'Class Admin', requiresAuth: true },
    props: true,
  },
  {
    path: '/wbl-admin',
    component: WBLAdmin,
    name: 'wbladmin',
    meta: { title: 'WBL Types', requiresAuth: true },
  },
  {
    path: '/students/:id',
    component: StudentProfile,
    name: 'student-profile',
    meta: { title: 'Student Profile', requiresAuth: true },
    props: true,
  },
  {
    path: '/gradebook',
    component: Gradebook,
    meta: { requiresAuth: true },
  },
  {
    path: '/assignments',
    component: Assignments,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    component: Settings,
    name: 'settings',
    meta: { title: 'Settings', requiresAuth: true },
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
router.beforeEach(async (to) => {
  const requiresAuth = to.meta.requiresAuth
  const guestOnly = to.meta.guestOnly

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
    return { name: 'classes' }
  }
})

export default router
