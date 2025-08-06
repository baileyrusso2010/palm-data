<template>
  <v-navigation-drawer app permanent width="240" color="white" class="sidebar-nav">
    <div class="sidebar-header d-flex align-center mb-8 pa-4">
      <v-icon size="40" color="primary">mdi-school</v-icon>
      <span class="sidebar-title ml-3">CTE Dashboard</span>
    </div>
    <v-divider></v-divider>
    <v-list nav dense>
      <v-list-item to="/" prepend-icon="mdi-home" title="Home" />
      <v-list-item to="/classes" prepend-icon="mdi-book-education" title="Classes" />
      <v-list-item to="/settings" prepend-icon="mdi-geaer-icon" title="Settings" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
// No script needed for static nav
</script>

<style scoped>
.sidebar-nav {
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 16px rgba(59, 130, 246, 0.06);
}
.sidebar-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 1px;
}
</style>
