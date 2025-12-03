<template>
  <div class="home-page" :class="{ 'dark-mode': isDark }">
    <v-container class="py-12" fluid>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <div class="header-section mb-12">
            <div class="header-content text-center">
              <v-icon icon="mdi-school" size="large" class="header-icon mb-4"></v-icon>
              <h1 class="main-title">CTE School</h1>
              <p class="sub-title">Central School District</p>
            </div>
          </div>

          <!-- Overview Stats -->
          <div v-if="!isLoading" class="overview-stats mb-8">
            <v-row>
              <v-col cols="12" sm="4">
                <div class="stat-card">
                  <div class="stat-number">{{ totalSchools }}</div>
                  <div class="stat-label">Schools</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="stat-card">
                  <div class="stat-number">{{ totalClasses }}</div>
                  <div class="stat-label">Classes</div>
                </div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="stat-card">
                  <div class="stat-number">{{ totalStudents }}</div>
                  <div class="stat-label">Students</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" lg="10">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-section">
            <v-row>
              <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
                <div class="skeleton-card">
                  <div class="skeleton-header"></div>
                  <div class="skeleton-detail"></div>
                  <div class="skeleton-detail"></div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Content -->
          <div v-else>
            <div v-for="school in schools" :key="school.id" class="school-section mb-12">
              <div class="d-flex align-center mb-6 border-b pb-2">
                <h2 class="school-title text-h5 font-weight-bold">{{ school.name }}</h2>
                <v-spacer></v-spacer>
                <span class="text-caption text-medium-emphasis"
                  >{{ school.classes.length }} Classes</span
                >
              </div>

              <v-row>
                <v-col
                  v-for="classItem in school.classes"
                  :key="classItem.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <div class="class-card-wrapper fade-in" @click="goToClass(classItem.id)">
                    <div class="class-card-content">
                      <div class="class-header">
                        <h3 class="class-name">{{ classItem.name }}</h3>
                        <v-icon icon="mdi-arrow-right" size="small" class="arrow-icon"></v-icon>
                      </div>

                      <div class="class-details">
                        <div class="detail-row">
                          <v-icon
                            icon="mdi-account-tie-outline"
                            size="small"
                            class="mr-2 text-medium-emphasis"
                          ></v-icon>
                          <span class="teacher-name">{{
                            classItem.teacher || 'No Instructor'
                          }}</span>
                        </div>

                        <div class="detail-row mt-2">
                          <v-icon
                            icon="mdi-account-group-outline"
                            size="small"
                            class="mr-2 text-medium-emphasis"
                          ></v-icon>
                          <span class="student-count">{{ classItem.students }} Students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import api from '@/api'

const router = useRouter()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const isLoading = ref(false)
const schools = ref([])

const totalSchools = computed(() => schools.value.length)
const totalClasses = computed(() =>
  schools.value.reduce((sum, school) => sum + school.classes.length, 0),
)
const totalStudents = computed(() =>
  schools.value.reduce(
    (sum, school) => sum + school.classes.reduce((classSum, cls) => classSum + cls.students, 0),
    0,
  ),
)

function goToClass(classId) {
  router.push({ name: 'class', params: { id: classId } })
}

onMounted(async () => {
  isLoading.value = true
  try {
    let response = await api.get('/course-instances/')
    console.log('API Response:', response.data)
    console.log('Response type:', typeof response.data)
    console.log('Is array?', Array.isArray(response.data))

    if (Array.isArray(response.data)) {
      // Flat array of course instances
      const schoolsMap = {}
      response.data.forEach((item) => {
        const schoolId = item.cte_school_id
        const schoolName = item.school_name || `School ${schoolId}` // Adjust if school_name exists
        if (!schoolsMap[schoolId]) {
          schoolsMap[schoolId] = { id: schoolId, name: schoolName, classes: [] }
        }
        schoolsMap[schoolId].classes.push({
          id: item.id,
          name: item.alias,
          teacher: item.instructor?.last_name,
          students: item.enrollmentCount,
        })
      })
      schools.value = Object.values(schoolsMap)
    } else {
      // Original object logic
      Object.keys(response.data).forEach((schoolKey) => {
        const schoolArray = response.data[schoolKey]
        console.log(
          `Key: ${schoolKey}, Value:`,
          schoolArray,
          'Is array?',
          Array.isArray(schoolArray),
        )
        if (Array.isArray(schoolArray)) {
          let classes = []
          schoolArray.forEach((item) => {
            classes.push({
              id: item.id,
              name: item.alias,
              teacher: item.instructor?.last_name,
              students: item.enrollmentCount,
            })
          })
          schools.value.push({
            id: schoolKey,
            name: schoolKey,
            classes: classes,
          })
        }
      })
    }
    console.log('Processed schools:', schools.value)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.home-page {
  background-color: #f5f5f7; /* Apple Light */
  min-height: 100vh;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(0, 102, 204, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(52, 199, 89, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.home-page.dark-mode {
  background-color: #000000; /* Apple Dark / Palantir Dark */
}

.home-page.dark-mode::before {
  background-image:
    radial-gradient(circle at 25% 25%, rgba(10, 132, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(48, 209, 88, 0.05) 0%, transparent 50%);
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.home-page.dark-mode .main-title {
  color: #f5f5f7;
}

.sub-title {
  font-size: 1.25rem;
  color: #86868b;
  font-weight: 400;
}

.header-icon {
  color: #0066cc;
  opacity: 0.8;
}

.home-page.dark-mode .header-icon {
  color: #0a84ff;
}

.overview-stats {
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.home-page.dark-mode .stat-card {
  background: rgba(28, 28, 30, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
}

.home-page.dark-mode .stat-number {
  color: #ffffff;
}

.stat-label {
  font-size: 0.9rem;
  color: #6e6e73;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.home-page.dark-mode .stat-label {
  color: #98989d;
}

.school-title {
  color: #1d1d1f;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.home-page.dark-mode .school-title {
  color: #f5f5f7;
}

.border-b {
  border-bottom: 1px solid #e5e5e5;
  transition: border-color 0.3s ease;
}

.home-page.dark-mode .border-b {
  border-bottom: 1px solid #333333;
}

/* Card Styling */
.class-card-wrapper {
  background: #ffffff;
  border-radius: 18px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.02),
    0 2px 4px -1px rgba(0, 0, 0, 0.02);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.home-page.dark-mode .class-card-wrapper {
  background: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.class-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.05),
    0 10px 10px -5px rgba(0, 0, 0, 0.01);
  border-color: rgba(0, 0, 0, 0.08);
}

.home-page.dark-mode .class-card-wrapper:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
  background: #2c2c2e;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.class-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.4;
  margin-right: 12px;
  transition: color 0.3s ease;
}

.home-page.dark-mode .class-name {
  color: #ffffff;
}

.arrow-icon {
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
  color: #0066cc; /* Apple blue */
}

.home-page.dark-mode .arrow-icon {
  color: #0a84ff; /* Apple Dark Mode Blue */
}

.class-card-wrapper:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
}

.class-details {
  margin-top: auto;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6e6e73;
  transition: color 0.3s ease;
}

.home-page.dark-mode .detail-row {
  color: #98989d;
}

.teacher-name,
.student-count {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .main-title {
    font-size: 2rem;
  }
  .class-card-wrapper {
    padding: 20px;
  }
}

/* Loading Skeleton */
.loading-section {
  margin-top: 2rem;
}

.skeleton-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.home-page.dark-mode .skeleton-card {
  background: #1c1c1e;
  border-color: rgba(255, 255, 255, 0.1);
}

.skeleton-header {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.home-page.dark-mode .skeleton-header {
  background: linear-gradient(90deg, #2c2c2e 25%, #3c3c3e 50%, #2c2c2e 75%);
  background-size: 200% 100%;
}

.skeleton-detail {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-top: 8px;
}

.home-page.dark-mode .skeleton-detail {
  background: linear-gradient(90deg, #2c2c2e 25%, #3c3c3e 50%, #2c2c2e 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Fade-in Animation */
.fade-in {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for multiple cards */
.fade-in:nth-child(1) {
  animation-delay: 0.1s;
}
.fade-in:nth-child(2) {
  animation-delay: 0.2s;
}
.fade-in:nth-child(3) {
  animation-delay: 0.3s;
}
.fade-in:nth-child(4) {
  animation-delay: 0.4s;
}
.fade-in:nth-child(5) {
  animation-delay: 0.5s;
}
.fade-in:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
