<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="pa-6" elevation="2">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h3 font-weight-bold text-primary mb-2">CTE School Dashboard</h1>
              <p class="text-h6 text-medium-emphasis">
                Career and Technical Education Program Overview
              </p>
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="fetchData"
              :loading="loading"
            >
              Refresh Data
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading" class="justify-center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="text-h6 mt-4">Loading school data...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error" class="justify-center">
      <v-col cols="12" md="6">
        <v-alert type="error" variant="outlined" :text="error" class="mb-4"></v-alert>
        <div class="text-center">
          <v-btn color="primary" @click="fetchData"> Try Again </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- School Data Display -->
    <div v-else-if="schoolData">
      <!-- School Information Card -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="pa-6" elevation="2">
            <v-card-title class="text-h4 text-primary d-flex align-center">
              <v-icon class="mr-3" size="large">mdi-school</v-icon>
              {{ schoolData.name }}
            </v-card-title>
            <v-card-subtitle class="text-h6 mt-2">
              School ID: {{ schoolData.id }} | Total Classes: {{ schoolData.Classes.length }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- Classes Data Table -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="bg-primary text-white pa-4">
              <v-icon class="mr-3">mdi-table</v-icon>
              Classes & Staff Information
            </v-card-title>

            <v-data-table
              :headers="headers"
              :items="schoolData.Classes"
              :items-per-page="10"
              class="elevation-0"
              item-key="id"
            >
              <template v-slot:item.name="{ item }">
                <router-link
                  :to="`/class/${item.id}`"
                  class="text-primary font-weight-medium"
                  style="text-decoration: none; cursor: pointer"
                >
                  <v-icon size="small" class="mr-2">mdi-book-open-variant</v-icon>
                  {{ item.name }}
                </router-link>
              </template>

              <template v-slot:item.Staff.email="{ item }">
                <a :href="`mailto:${item.Staff.email}`" class="text-decoration-none text-primary">
                  <v-icon size="small" class="mr-1">mdi-email</v-icon>
                  {{ item.Staff.email }}
                </a>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mt-6">
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="primary" variant="outlined">
            <v-icon size="48" class="mb-2">mdi-book-education</v-icon>
            <div class="text-h4 font-weight-bold">{{ schoolData.Classes.length }}</div>
            <div class="text-subtitle-1">Total Classes</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="success" variant="outlined">
            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">{{ uniqueStaffCount }}</div>
            <div class="text-subtitle-1">Unique Staff Members</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-center" color="info" variant="outlined">
            <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
            <div class="text-h4 font-weight-bold">{{ avgClassesPerStaff }}</div>
            <div class="text-subtitle-1">Avg Classes per Staff</div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'

interface Staff {
  id: number
  email: string
}

interface Class {
  id: number
  name: string
  Staff: Staff
}

interface CteSchool {
  id: number
  name: string
  Classes: Class[]
}

interface ApiResponse {
  cteSchool: CteSchool
}

const schoolData = ref<CteSchool | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Table headers configuration - only class name and staff email
const headers = [
  { title: 'Class Name', key: 'name', align: 'start' as const, sortable: true },
  { title: 'Staff Email', key: 'Staff.email', align: 'start' as const, sortable: true },
]

// Computed properties for statistics
const uniqueStaffCount = computed(() => {
  if (!schoolData.value) return 0
  const staffIds = new Set(schoolData.value.Classes.map((cls) => cls.Staff.id))
  return staffIds.size
})

const avgClassesPerStaff = computed(() => {
  if (!schoolData.value || uniqueStaffCount.value === 0) return 0
  return Math.round((schoolData.value.Classes.length / uniqueStaffCount.value) * 10) / 10
})

function fetchData() {
  loading.value = true
  error.value = null

  axios
    .get<ApiResponse>('http://localhost:3000/api/cte-school/1/summary')
    .then((response) => {
      console.log('Data fetched:', response.data)
      schoolData.value = response.data.cteSchool
    })
    .catch((err) => {
      console.error('Error fetching data:', err)
      error.value = 'Failed to load school data. Please try again.'
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped></style>
