import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomeWelcome from './views/home/HomeWelcome.vue'
import Login from './views/auth/Login.vue'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import FormView from './views/forms/FormView.vue'
import StudentForm from './views/students/StudentForm.vue'
import SkillView from './views/classes/SkillView.vue'
import StudentProfile from './views/students/StudentProfile.vue'
import StudentSearch from './views/students/StudentSearch.vue'
import StudentGrading from './views/grading/StudentGrading.vue'
import ClassView from './views/classes/ClassView.vue'
import GradeBook from './views/grading/GradeBook.vue'
import FormConfig from './views/forms/FormConfig.vue'
import GradingForm from './views/grading/GradingForm.vue'
import FormList from './views/forms/FormList.vue'
import FormTest from './views/forms/FormTest.vue'
import WblStudent from './views/wbl/WblStudent.vue'
import UploadData from './views/admin/UploadData.vue'
import BreakDown from './views/data/BreakDown.vue'
import CreateRubric from './views/forms/CreateRubric.vue'
import Home from './views/home/Home.vue'

const routes = [
  // Public / guest routes
  { path: '/', component: Login, name: 'login', meta: { title: 'Login', guestOnly: true } },
  {
    path: '/home',
    component: Home,
    name: 'home',
    meta: { requiresAuth: true },
  },
  {
    path: '/grading/:studentId',
    component: StudentGrading,
    name: 'grading',
    meta: { requiresAuth: true },
  },
  {
    path: '/form-view',
    component: FormView,
    meta: { requiresAuth: true },
  },
  {
    path: '/rubric/create',
    component: CreateRubric,
    meta: { requiresAuth: true },
  },
  {
    path: '/skills',
    component: SkillView,
    meta: { requiresAuth: true },
  },
  {
    path: '/class/:id',
    name: 'class',
    component: ClassView,
    meta: { requiresAuth: true },
  },
  {
    path: '/gradebook',
    component: GradeBook,
    meta: { requiresAuth: true },
  },
  {
    path: '/student/:id',
    component: StudentProfile,
    name: 'student-profile',
    meta: { requiresAuth: true },
  },
  {
    path: '/breakdown',
    component: BreakDown,
    name: 'breakdown',
    meta: { requiresAuth: true },
  },
  {
    path: '/students',
    component: StudentSearch,
    name: 'student-search',
    meta: { requiresAuth: true },
  },
  {
    path: '/form-test/:id',
    component: FormTest,
    meta: { requiresAuth: true },
  },
  {
    path: '/upload',
    component: UploadData,
    meta: { requiresAuth: true },
  },
  {
    path: '/wbl/hours/:token',
    component: WblStudent,
    meta: { requiresAuth: false },
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
