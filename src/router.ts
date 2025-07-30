import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import ClassDetail from './views/ClassDetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/class/:id', component: ClassDetail, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
