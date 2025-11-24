<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card elevation="4" class="mx-auto" max-width="800">
          <v-card-title class="text-h5 font-weight-bold"> List of Forms </v-card-title>
          <v-card-subtitle>
            View available forms and their deployment status for the class.
          </v-card-subtitle>
          <v-divider></v-divider>
          <v-list lines="two">
            <v-list-item
              v-for="form in forms"
              :key="form.id"
              :title="form.name"
              :subtitle="form.description"
            >
              <template v-slot:append>
                <v-chip
                  :color="form.deployed ? 'success' : 'warning'"
                  :text="form.deployed ? 'Deployed' : 'Not Deployed'"
                  size="small"
                ></v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const forms = ref([
  {
    id: 1,
    name: 'Student Feedback Form',
    description: 'Collect feedback from students on course content.',
    deployed: true,
  },
  {
    id: 2,
    name: 'Attendance Tracker',
    description: 'Daily attendance form for the class.',
    deployed: false,
  },
  {
    id: 3,
    name: 'Quiz Submission',
    description: 'Form for submitting weekly quizzes.',
    deployed: true,
  },
  {
    id: 4,
    name: 'Project Proposal',
    description: 'Submit ideas for group projects.',
    deployed: false,
  },
  {
    id: 5,
    name: 'Event Registration',
    description: 'Register for upcoming class events.',
    deployed: true,
  },
])
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
