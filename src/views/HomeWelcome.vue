<template>
  <div class="home-page">
    <header class="dashboard-header">
      <h1>Welcome</h1>
    </header>
    <v-container class="py-10" fluid>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6" class="text-center">
          <v-card elevation="2" rounded="xl" class="pa-10">
            <div class="text-h5 font-weight-600">Welcome to Palm Data</div>
            <div class="text-body-2 text-medium-emphasis mt-2">
              Use the sidebar to navigate. You can search students, manage forms, and more.
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
// Simple welcome page
</script>

<style scoped>
.home-page {
  background: #fafafa;
  min-height: 100vh;
}
.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #222b45;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
.font-weight-600 {
  font-weight: 600;
}
</style>
