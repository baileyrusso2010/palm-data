<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" lg="11" xl="11">
        <!-- Student Header Card -->
        <v-card elevation="8" rounded="xl" class="student-header-card mb-6">
          <v-card-text class="pa-8">
            <v-row align="center">
              <v-col cols="auto">
                <v-avatar size="80" color="primary" class="elevation-4">
                  <span class="text-h4 text-white font-weight-bold">{{ initials }}</span>
                </v-avatar>
              </v-col>

              <v-col>
                <div class="d-flex align-center mb-2">
                  <h2 class="text-h4 font-weight-bold text-primary mr-4">{{ student.name }}</h2>
                  <v-chip
                    :color="student.year === 'Senior' ? 'success' : 'info'"
                    size="default"
                    label
                    class="font-weight-bold"
                  >
                    {{ student.year }}
                  </v-chip>
                </div>

                <v-row class="mt-3">
                  <v-col cols="12" sm="3">
                    <div class="info-item">
                      <v-icon color="primary" size="20" class="mr-2"
                        >mdi-card-account-details</v-icon
                      >
                      <span class="text-body-2 text-medium-emphasis">Student ID</span>
                      <div class="text-h6 font-weight-medium">{{ student.id }}</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3">
                    <div class="info-item">
                      <v-icon color="primary" size="20" class="mr-2">mdi-school</v-icon>
                      <span class="text-body-2 text-medium-emphasis">Teacher</span>
                      <div class="text-h6 font-weight-medium">{{ student.teacher }}</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3">
                    <div class="info-item">
                      <v-icon color="primary" size="20" class="mr-2">mdi-school</v-icon>
                      <span class="text-body-2 text-medium-emphasis">Program</span>
                      <div class="text-h6 font-weight-medium">{{ student.program }}</div>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="3">
                    <div class="info-item">
                      <v-icon color="primary" size="20" class="mr-2">mdi-home-city</v-icon>
                      <span class="text-body-2 text-medium-emphasis">Home School</span>
                      <div class="text-h6 font-weight-medium">{{ student.homeSchool }}</div>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Two Cards Row -->
        <v-row>
          <!-- Left Card (1/3) -->
          <v-col cols="12" md="4">
            <v-card elevation="8" rounded="xl" class="h-100">
              <v-card-title class="pa-6 pb-4">
                <v-icon color="primary" size="24" class="mr-3">mdi-account-details</v-icon>
                <span class="text-h6 font-weight-bold">Student Details</span>
              </v-card-title>
              <v-card-text class="pa-6 pt-2">
                <div class="detail-item mb-4">
                  <span class="text-body-2 text-medium-emphasis">Email</span>
                  <div class="text-body-1 font-weight-medium">{{ student.email }}</div>
                </div>
                <div class="detail-item mb-4">
                  <span class="text-body-2 text-medium-emphasis">Phone</span>
                  <div class="text-body-1 font-weight-medium">{{ student.phone }}</div>
                </div>
                <div class="detail-item mb-4">
                  <span class="text-body-2 text-medium-emphasis">Graduation Year</span>
                  <div class="text-body-1 font-weight-medium">{{ student.graduationYear }}</div>
                </div>
                <div class="detail-item">
                  <span class="text-body-2 text-medium-emphasis">Enrollment Date</span>
                  <div class="text-body-1 font-weight-medium">{{ student.enrollmentDate }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="8" rounded="xl" class="h-100">
              <v-card-title class="pa-6 pb-4">
                <v-icon color="primary" size="24" class="mr-3">mdi-flag</v-icon>
                <span class="text-h6 font-weight-bold">Flags</span>
              </v-card-title>
              <v-card-text class="pa-6 pt-2">
                <v-list density="compact" v-if="flags.length">
                  <v-list-item v-for="(flag, idx) in flags" :key="idx">
                    <template #default>
                      <div class="d-flex justify-space-between align-center w-100">
                        <span class="font-weight-medium">{{ flag.name }}</span>
                        <span class="text-caption text-medium-emphasis ml-4">{{ flag.date }}</span>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
                <div v-else class="text-center text-body-1 text-medium-emphasis">No flags.</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Card (2/3) -->
          <v-col cols="12" md="4">
            <v-card elevation="8" rounded="xl" class="h-100">
              <v-card-title class="pa-6 pb-4">
                <v-icon color="primary" size="24" class="mr-3">mdi-chart-timeline-variant</v-icon>
                <span class="text-h6 font-weight-bold">WBL Hours</span>
              </v-card-title>
              <v-card-text class="pa-6 pt-2">
                <v-row>
                  <v-col
                    cols="12"
                    class="d-flex justify-center align-center"
                    style="min-height: 160px"
                  >
                    <div
                      class="stat-card"
                      style="
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                      "
                    >
                      <div class="text-h2 font-weight-bold text-primary" style="font-size: 3rem">
                        87/120
                      </div>
                      <div class="text-body-1 text-medium-emphasis" style="font-size: 1.25rem">
                        Hours
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Semester Assessments and Additional Info Row -->
        <v-row>
          <!-- Semester Scores Card (md=8) -->
          <v-col cols="12" md="8">
            <v-card elevation="8" rounded="xl" class="mb-6 semester-assessments-card">
              <v-card-title class="pa-6 pb-4 assessment-header">
                <v-icon color="primary" size="24" class="mr-3">mdi-school-outline</v-icon>
                <span class="text-h5 font-weight-bold">Semester Assessments</span>
              </v-card-title>
              <v-card-text class="pa-6 pt-2">
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="6"
                    lg="3"
                    v-for="(sem, idx) in semesters"
                    :key="sem.label"
                  >
                    <v-card class="semester-card mb-4" elevation="4" rounded="xl">
                      <div class="semester-header">
                        <span class="semester-title">{{ sem.label }}</span>
                      </div>
                      <v-card-text class="pt-3 pb-4">
                        <div class="score-container">
                          <div class="score-item">
                            <div class="score-label">
                              <v-icon size="16" color="primary" class="mr-1"
                                >mdi-account-star</v-icon
                              >
                              Performance
                            </div>
                            <div class="score-value performance-score">{{ sem.performance }}</div>
                          </div>
                          <v-divider class="my-2"></v-divider>
                          <div class="score-item">
                            <div class="score-label">
                              <v-icon size="16" color="success" class="mr-1">mdi-cog</v-icon>
                              Technical
                            </div>
                            <div class="score-value technical-score">{{ sem.technical }}</div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Averages Card (md=4) -->
          <v-col cols="12" md="4">
            <v-card elevation="8" rounded="xl" class="mb-6 averages-card">
              <v-card-title class="pa-6 pb-4 averages-header">
                <v-icon color="primary" size="24" class="mr-3">mdi-chart-line</v-icon>
                <span class="text-h5 font-weight-bold">Averages</span>
              </v-card-title>
              <v-card-text class="pa-6 pt-2">
                <div class="average-container">
                  <div class="average-item mb-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" size="20" class="mr-2">mdi-account-star</v-icon>
                      <span class="average-label">Performance Average</span>
                    </div>
                    <div class="average-value performance-avg">{{ performanceAverage }}</div>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="average-item mb-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="success" size="20" class="mr-2">mdi-cog</v-icon>
                      <span class="average-label">Technical Average</span>
                    </div>
                    <div class="average-value technical-avg">{{ technicalAverage }}</div>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div class="average-item">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="warning" size="20" class="mr-2">mdi-trophy</v-icon>
                      <span class="average-label">Overall Average</span>
                    </div>
                    <div class="average-value overall-avg">{{ overallAverage }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Example student data (replace with real data or props)
const student = {
  name: 'Alexandra Rivera',
  id: 'STU-2025-0012',
  year: 'Senior',
  program: 'Computer Science',
  teacher: 'Mr. Johnson',
  homeSchool: 'Washington High School',
  email: 'alexandra.rivera@email.com',
  phone: '(555) 123-4567',
  graduationYear: '2025',
  enrollmentDate: 'August 2023',
}

const flags = [
  { name: 'IEP', date: '2024-01-15' },
  { name: 'Economic Disadvantage', date: '2024-02-10' },
]

// Semester assessment data
const semesters = [
  { label: 'Jr Semester 1', performance: 3.2, technical: 2.8 },
  { label: 'Jr Semester 2', performance: 3.8, technical: 2.1 },
  { label: 'Sr Semester 1', performance: 3.8, technical: 2.9 },
  { label: 'Sr Semester 2', performance: 3.1, technical: 3.2 },
]

// Calculate averages
const performanceAverage = computed(() => {
  const sum = semesters.reduce((acc, sem) => acc + sem.performance, 0)
  return (sum / semesters.length).toFixed(1)
})

const technicalAverage = computed(() => {
  const sum = semesters.reduce((acc, sem) => acc + sem.technical, 0)
  return (sum / semesters.length).toFixed(1)
})

const overallAverage = computed(() => {
  const performanceSum = semesters.reduce((acc, sem) => acc + sem.performance, 0)
  const technicalSum = semesters.reduce((acc, sem) => acc + sem.technical, 0)
  const totalSum = performanceSum + technicalSum
  return (totalSum / (semesters.length * 2)).toFixed(1)
})

// Compute initials for avatar
const initials = computed(() => {
  return student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})
</script>

<style scoped>
.student-header-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
}

.info-item,
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .text-body-2 {
  display: flex;
  align-items: center;
}

.stat-card {
  text-align: center;
  padding: 16px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.semester-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  min-height: 180px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.semester-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
}

.semester-header {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 12px 16px;
  text-align: center;
}

.semester-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.score-container {
  padding: 8px;
}

.score-item {
  text-align: center;
  padding: 8px 0;
}

.score-label {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  font-weight: 500;
}

.score-value {
  font-size: 1.75rem;
  font-weight: 800;
}

.performance-score {
  color: #3b82f6;
}

.technical-score {
  color: #10b981;
}

.semester-assessments-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
}

.assessment-header {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
}

.averages-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

.averages-header {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
}

.average-container {
  padding: 16px;
}

.average-item {
  text-align: center;
}

.average-label {
  font-size: 1rem;
  color: #475569;
  font-weight: 600;
}

.average-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin-top: 8px;
}

.performance-avg {
  color: #3b82f6;
}

.technical-avg {
  color: #10b981;
}

.overall-avg {
  color: #f59e0b;
}

.h-100 {
  height: 100%;
}
</style>
