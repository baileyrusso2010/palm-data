<template>
  <v-app>
    <SidebarNav v-if="!hideDrawer" v-model="drawer" @toggle-theme="toggleTheme" />
    <v-main color="background">
      <router-view />
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import SidebarNav from './components/SidebarNav.vue'

const drawer = ref(true)
const route = useRoute()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const staticTitles: Record<string, string> = {
  '/': 'Programs',
  '/classes': 'Classes',
}

const currentTitle = computed(() => {
  if (route.name === 'class-view') {
    return 'Class Admin'
  }
  return staticTitles[route.path] || 'App'
})

const hideDrawer = computed(() => {
  return /^\/wbl\/hours\/[^/]+$/.test(route.path)
})

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}
</script>

<style>
.v-list-item--active {
  background-color: rgba(0, 0, 0, 0.064) !important; /* Light theme */
  color: rgb(40, 6, 255) !important;
  /* color: var(--v-theme-primary) !important; */
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.064);
}

body {
  font-family: 'Helvetica', 'Arial', sans-serif;
}
</style>
