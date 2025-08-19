import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Classes from './views/Classes.vue'

const routes = [
  { path: '/', component: Home, name: 'home' },
  { path: '/classes', component: Classes, name: 'classes' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
