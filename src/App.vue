<template>
  <v-app>
    <SidebarNav />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SidebarNav from './components/SidebarNav.vue'
</script>

<style scoped></style>
