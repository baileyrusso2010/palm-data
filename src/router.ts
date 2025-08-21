import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Classes from './views/Classes.vue'
import ClassView from './views/ClassView.vue'
import WBLAdmin from './views/WBLAdmin.vue'

const routes = [
  { path: '/', component: Home, name: 'home', meta: { title: 'Programs' } },
  { path: '/classes', component: Classes, name: 'classes', meta: { title: 'Classes' } },
  {
    path: '/classes/:id',
    component: ClassView,
    name: 'class-view',
    meta: { title: 'Class Admin' },
    props: true,
  },
  {
    path: '/wbl-admin',
    component: WBLAdmin,
    name: 'wbladmin',
    meta: { title: 'WBL Types' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
