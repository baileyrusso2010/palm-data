<template>
  <v-container fluid class="pa-4 students-page">
    <!-- Context Bar -->
    <v-row class="mb-3">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div class="d-flex align-center text-subtitle-2 font-weight-medium">
          <span class="mr-2">District: {{ district }}</span>
          <span class="mx-2 text-medium-emphasis">·</span>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                size="small"
                class="text-none px-1 text-subtitle-2 font-weight-medium"
                color="primary"
              >
                School: {{ schoolStore.school?.name || 'All Schools' }}
                <v-icon end size="small">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" width="200">
              <v-list-item @click="schoolStore.setSchool(null)" value="all">
                <v-list-item-title>All Schools</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1"></v-divider>
              <v-list-item
                v-for="school in schools"
                :key="school.id"
                :value="school.id"
                @click="schoolStore.setSchool(school)"
              >
                <v-list-item-title>{{ school.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-col>
    </v-row>

    <!-- 3 Graphs Section -->
    <div class="mb-6">
      <div class="text-h6 font-weight-bold mb-4 px-1">Overview</div>
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Attendance Trend</div>
                <div class="text-caption text-medium-emphasis">Last 7 Days</div>
              </div>
              <v-icon color="primary" size="24">mdi-calendar-check</v-icon>
            </div>
            <div class="chart-wrapper">
              <Line :data="attendanceData" :options="commonOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Grade Distribution</div>
                <div class="text-caption text-medium-emphasis">Current Term</div>
              </div>
              <v-icon color="success" size="24">mdi-chart-bar</v-icon>
            </div>
            <div class="chart-wrapper">
              <Bar :data="gradesData" :options="commonOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Risk Drivers</div>
                <div class="text-caption text-medium-emphasis">High Risk Factors</div>
              </div>
              <v-icon color="error" size="24">mdi-alert-circle</v-icon>
            </div>
            <div class="chart-wrapper">
              <Bar :data="riskDriversData" :options="riskOptions" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Course Cards Section -->
    <div>
      <div class="d-flex align-center justify-space-between mb-4 px-1">
        <div class="text-h6 font-weight-bold">Courses</div>
        <v-btn variant="text" size="small" color="primary">View All Courses</v-btn>
      </div>

      <v-row>
        <v-col v-for="course in courses" :key="course.id" cols="12" sm="6" md="4" lg="2">
          <v-card
            elevation="2"
            class="course-card d-flex flex-column"
            @click="navigateToCourse(course)"
          >
            <div class="pa-4 pb-2">
              <div class="d-flex justify-space-between align-start mb-2">
                <v-avatar size="32" :color="course.color" variant="tonal" class="rounded-lg">
                  <span class="text-subtitle-2">{{ course.alias.substring(0, 2) }}</span>
                </v-avatar>
                <v-icon size="20" color="medium-emphasis">mdi-dots-vertical</v-icon>
              </div>
              <div class="text-subtitle-1 font-weight-bold text-truncate mb-1">
                {{ course.alias }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ course.period }} · {{ course.room }}
              </div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ course.students }} Students
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Line } from 'vue-chartjs'
import { useSchoolStore } from '@/stores/school'

const schoolStore = useSchoolStore()
const schools = ref([])
const district = ref('')

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import api from '@/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const router = useRouter()

const navigateToCourse = (course) => {
  router.push({ name: 'class', params: { id: course.id } })
}

onMounted(async () => {
  Promise.all([getSchools(), getCourses(), getDistrict()])
})

async function getSchools() {
  await api.get('/schools/district/1').then((response) => {
    schools.value = response.data
  })
}

async function getCourses() {
  await api.get('/course-instances/summary').then((response) => {
    courses.value = response.data
  })
}

async function getDistrict() {
  await api.get('/districts/1').then((response) => {
    district.value = response.data.name
  })
}

// Common chart options for cleaner look
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      titleFont: { family: "'Inter', sans-serif", size: 13 },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
      padding: 10,
      cornerRadius: 4,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#64748b' },
    },
    y: {
      border: { display: false },
      grid: { color: '#f1f5f9', drawBorder: false },
      ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#64748b' },
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
}

// Specific options for the horizontal bar chart
const riskOptions = {
  ...commonOptions,
  indexAxis: 'y',
}

// MOCK DATA

// 1. Attendance Data (Line Chart)
const attendanceData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Attendance %',
      data: [92, 94, 91, 95, 93],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
    },
  ],
}

// 2. Grades Data (Bar Chart)
const gradesData = {
  labels: ['A', 'B', 'C', 'D', 'F'],
  datasets: [
    {
      label: 'Students',
      data: [45, 62, 28, 12, 5],
      backgroundColor: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
      borderRadius: 4,
      barThickness: 20,
    },
  ],
}

// 3. Risk Drivers Data (Horizontal Bar Chart)
const riskDriversData = {
  labels: ['Attendance', 'Behav', 'Course', 'SEL'], // Shortened labels
  datasets: [
    {
      label: 'Students',
      data: [14, 7, 12, 3],
      backgroundColor: '#64748b',
      borderRadius: 4,
      barThickness: 16,
    },
  ],
}

// 4. Courses Data (10 items)
const courses = ref([])
</script>

<style scoped>
.pa-4 {
  background: #ffffff; /* Lighter background */
  max-height: 100vh;
}

.students-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.text-subtitle-2 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-card {
  border: 1px solid #e2e8f0;
  border-radius: 4px; /* Slightly more rounded */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s ease-in-out;
}

.v-card:hover {
  border-color: #cbd5e1;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

.course-card {
  height: fit-content;
  max-height: 180px;
  cursor: pointer;
}

.text-h6 {
  font-size: 1.1rem !important;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.text-subtitle-1 {
  font-size: 15px;
  line-height: 1.2;
  color: #1e293b;
}

.chart-wrapper {
  height: 200px;
  width: 100%;
  position: relative;
}
</style>
