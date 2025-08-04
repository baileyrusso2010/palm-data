<template>
  <v-container fluid class="pa-6 bg-background">
    <!-- Unified Header/School Card -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card class="pa-8 header-school-card" elevation="10" rounded="xl">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div class="header-content d-flex align-center">
              <div>
                <h1 class="text-h2 font-weight-bold text-primary mb-2">
                  {{ schoolData?.name || 'Loading School...' }}
                </h1>
                <p class="text-h6 text-medium-emphasis mb-4">
                  Career and Technical Education Program Overview
                </p>

                <!-- School Info Section -->
                <div class="school-info-section mb-4">
                  <!-- Status Chips -->
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      color="teal"
                      variant="outlined"
                      prepend-icon="mdi-book-education"
                      size="small"
                    >
                      {{ schoolData?.Classes?.length || 0 }} Active Programs
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="header-actions">
              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                prepend-icon="mdi-refresh"
                @click="fetchData"
                :loading="loading"
                rounded="xl"
                class="refresh-btn"
              >
                Refresh Data
              </v-btn>
            </div>
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
      <!-- Classes Overview Section -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="4" lg="3">
          <div class="d-flex align-center mb-4">
            <v-icon size="32" color="primary" class="mr-3">mdi-book-education</v-icon>
            <h2 class="text-h4 font-weight-bold text-primary mb-0">Classes Overview</h2>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="cls in schoolData.Classes" :key="cls.id" cols="12" sm="6" md="4" lg="3">
          <div class="class-card-stack">
            <v-card
              class="class-card h-100 position-relative"
              elevation="6"
              hover
              @click="$router.push(`/class/${cls.id}`)"
            >
              <!-- Card Header with Gradient -->
              <div class="card-header pa-4">
                <div class="d-flex align-center justify-space-between">
                  <v-icon :color="getProgramColor(cls.id)" size="28">mdi-book-open-variant</v-icon>
                  <v-chip
                    :color="getProgramColor(cls.id)"
                    variant="elevated"
                    size="small"
                    class="text-white font-weight-bold"
                  >
                    {{ getFakeStudentCount(cls.id) }} Students
                  </v-chip>
                </div>
                <h3 class="text-h5 font-weight-bold text-white mt-3 mb-1">
                  {{ cls.name }}
                </h3>
                <p class="text-body-2 text-white mb-0">
                  {{ getFakeProgram(cls.id) }}
                </p>
              </div>

              <!-- Card Content -->
              <v-card-text class="pa-4 bg-card-content">
                <!-- Staff Information -->
                <div class="staff-info mb-3">
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="32" :color="getProgramColor(cls.id)" class="mr-3">
                      <span class="text-white font-weight-bold">
                        {{ getStaffInitials(cls.Staff?.email || '') }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        {{ getStaffName(cls.Staff?.email || '') }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Instructor</div>
                    </div>
                  </div>
                </div>

                <!-- Contact Info -->
                <div class="contact-info">
                  <v-chip
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-email"
                    :color="getProgramColor(cls.id)"
                    class="mb-2"
                    @click.stop="openEmail(cls.Staff?.email || '')"
                  >
                    {{ cls.Staff?.email || 'contact@school.edu' }}
                  </v-chip>
                </div>
              </v-card-text>

              <!-- Hover Effect Overlay -->
              <div class="card-overlay"></div>
            </v-card>
            <v-card
              class="quick-stats-card mt-3"
              :style="{
                boxShadow:
                  '0 0 0 0 rgba(0,0,0,0), 0 0 24px 2px var(--' +
                  getProgramColor(cls.id) +
                  ', #2563eb33)',
              }"
              elevation="8"
            >
              <v-card-text>
                <div class="quick-stats enhanced">
                  <v-row dense>
                    <v-col cols="4" class="text-center">
                      <div class="text-h6 font-weight-bold text-teal enhanced-stat">
                        {{ getFakeAttendance(cls.id) }}%
                      </div>
                      <div class="text-caption text-medium-emphasis">Attendance</div>
                    </v-col>
                    <v-col cols="4" class="text-center">
                      <div class="text-h6 font-weight-bold text-blue enhanced-stat">
                        {{ getFakeGrade(cls.id) }}%
                      </div>
                      <div class="text-caption text-medium-emphasis">Avg Grade</div>
                    </v-col>
                    <v-col cols="4" class="text-center">
                      <div class="text-h6 font-weight-bold text-amber enhanced-stat">
                        {{ getFakeProjects(cls.id) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">Projects</div>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row class="mt-8">
        <v-col cols="12" md="4">
          <div class="d-flex align-center mb-4">
            <v-icon size="32" color="primary" class="mr-3">mdi-chart-box</v-icon>
            <h2 class="text-h4 font-weight-bold text-primary mb-0">School Statistics</h2>
          </div>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card class="pa-6 text-center stat-card" elevation="6" rounded="xl">
            <div class="stat-icon-container mb-3">
              <v-icon size="48" color="blue">mdi-book-education</v-icon>
            </div>
            <div class="text-h3 font-weight-bold text-blue mb-2">
              {{ schoolData.Classes.length }}
            </div>
            <div class="text-h6 text-medium-emphasis">Total Classes</div>
            <div class="text-caption text-medium-emphasis mt-2">Active programs running</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-6 text-center stat-card" elevation="6" rounded="xl">
            <div class="stat-icon-container mb-3">
              <v-icon size="48" color="teal">mdi-account-group</v-icon>
            </div>
            <div class="text-h3 font-weight-bold text-teal mb-2">{{ uniqueStaffCount }}</div>
            <div class="text-h6 text-medium-emphasis">Unique Staff Members</div>
            <div class="text-caption text-medium-emphasis mt-2">Qualified instructors</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-6 text-center stat-card" elevation="6" rounded="xl">
            <div class="stat-icon-container mb-3">
              <v-icon size="48" color="purple">mdi-chart-line</v-icon>
            </div>
            <div class="text-h3 font-weight-bold text-purple mb-2">{{ avgClassesPerStaff }}</div>
            <div class="text-h6 text-medium-emphasis">Avg Classes per Staff</div>
            <div class="text-caption text-medium-emphasis mt-2">Workload distribution</div>
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
  name?: string
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

// Helper: Fake staff name and student count for demo
function getFakeStudentCount(classId: number) {
  return 18 + ((classId * 7) % 15)
}

// Helper: Generate fake program names
function getFakeProgram(classId: number) {
  const programs = [
    'Information Technology',
    'Automotive Technology',
    'Healthcare Sciences',
    'Construction Trades',
    'Culinary Arts',
    'Engineering Technology',
    'Business Management',
    'Digital Media Arts',
  ]
  return programs[classId % programs.length]
}

// Helper: Generate staff initials from email
function getStaffInitials(email: string) {
  if (!email) return 'ST'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

// Helper: Generate staff name from email
function getStaffName(email: string) {
  if (!email) return 'Staff Member'
  const username = email.split('@')[0]
  const parts = username.split('.')
  if (parts.length >= 2) {
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  }
  return username.charAt(0).toUpperCase() + username.slice(1)
}

// Helper: Generate fake attendance percentage
function getFakeAttendance(classId: number) {
  return 85 + ((classId * 3) % 12)
}

// Helper: Generate fake grade average
function getFakeGrade(classId: number) {
  return 78 + ((classId * 5) % 18)
}

// Helper: Generate fake project count
function getFakeProjects(classId: number) {
  return 3 + ((classId * 2) % 5)
}

// Helper: Get program-specific color
function getProgramColor(classId: number) {
  const colors = [
    'teal-darken-3',
    'blue-darken-3',
    'purple-darken-3',
    'cyan-darken-3',
    'indigo-darken-3',
    'deep-purple-darken-3',
    'light-blue-darken-3',
    'teal-darken-4',
  ]
  return colors[classId % colors.length]
}

// Handle mailto clicks
function openEmail(email: string) {
  window.open(`mailto:${email}`, '_blank')
}

// Patch Staff to have name for demo
if (schoolData.value && schoolData.value.Classes) {
  schoolData.value.Classes.forEach((cls) => {
    if (!cls.Staff.name) {
      cls.Staff.name = 'Staff ' + cls.Staff.id
    }
  })
}

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
    .get<ApiResponse>(`${import.meta.env.VITE_API_BASE_URL}/api/cte-school/1/summary`)
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

<style scoped>
/* Base theme variables */
:root {
  --primary: #1e40af; /* Rich blue for primary elements */
  --background: #f5f7fa; /* Light neutral background */
  --card-bg: #ffffff; /* Clean white for cards */
  --text-primary: #1f2937; /* Dark gray for text */
  --text-secondary: #6b7280; /* Medium gray for secondary text */
  --accent-teal: #0f766e; /* Teal for accents */
  --accent-blue: #2563eb; /* Vibrant blue for highlights */
}

/* Container background */
.bg-background {
  background-color: var(--background);
  min-height: 100vh;
}

/* Class card enhancements */
.class-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px !important;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.class-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.15) !important;
}

.card-header {
  position: relative;
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%);
  color: white;
  padding: 20px !important;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  opacity: 0.5;
}

.bg-card-content {
  background: #f9fafb;
}

.staff-info {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  background: rgba(243, 244, 246, 0.5);
}

.contact-info .v-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 16px;
}

.contact-info .v-chip:hover {
  transform: scale(1.03);
  filter: brightness(110%);
}

.quick-stats {
  background: rgba(243, 244, 246, 0.7);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(209, 213, 219, 0.3);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(15, 118, 110, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.class-card:hover .card-overlay {
  opacity: 1;
}

/* Stack the main card and quick stats card */
.class-card-stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}

.quick-stats-card {
  border-radius: 16px !important;
  background: linear-gradient(90deg, #fafdff 80%, #e3f0ff 100%);
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 0;
  transition: box-shadow 0.2s;
}

.quick-stats-card:hover {
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.18) !important;
}

.quick-stats.enhanced {
  background: transparent;
  border: none;
  padding: 8px 0 0 0;
}

.enhanced-stat {
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  filter: brightness(1.1);
}

/* Statistics cards */
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  border: 1px solid rgba(209, 213, 219, 0.2);
  border-radius: 20px !important;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.1) !important;
  border-color: rgba(37, 99, 235, 0.3);
}

.stat-icon-container {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 50%;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon-container {
  transform: scale(1.1);
}

/* Unified header/school card */
.header-school-card {
  background: var(--card-bg);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  border-radius: 24px !important;
  border: 1px solid rgba(209, 213, 219, 0.2);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.1);
  z-index: 1;
}

.header-school-card .text-primary {
  color: var(--primary) !important;
}

.header-school-card .text-medium-emphasis {
  color: var(--text-secondary) !important;
}

.refresh-btn {
  background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-teal) 100%) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

/* School info card */
.school-info-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid rgba(209, 213, 219, 0.2);
  border-radius: 20px !important;
  transition: all 0.3s ease;
}

.school-info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg) scale(1.05);
  }
  100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.class-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

.class-card:nth-child(2) {
  animation-delay: 0.1s;
}
.class-card:nth-child(3) {
  animation-delay: 0.2s;
}
.class-card:nth-child(4) {
  animation-delay: 0.3s;
}
.class-card:nth-child(5) {
  animation-delay: 0.4s;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-content,
  .header-actions {
    width: 100%;
  }

  .header-actions {
    margin-top: 16px;
    text-align: center;
  }

  .class-card {
    margin-bottom: 16px;
  }

  .card-header {
    padding: 16px !important;
  }

  .quick-stats .v-row {
    text-align: center;
  }
}
</style>
