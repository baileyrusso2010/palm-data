<template>
  <v-container fluid class="pa-4 students-page">
    <!-- Context Bar -->
    <!-- <v-row class="mb-3">
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
                <PhCaretDown size="16" class="ml-1" weight="bold" />
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
    </v-row> -->

    <!-- Quick Stats Row (Filler) -->
    <!-- <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 h-100">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                Total Students
              </div>
              <div class="text-h5 font-weight-bold mt-1">1,245</div>
            </div>
            <v-avatar color="blue-lighten-5" size="48">
              <PhUsers size="24" class="text-primary" weight="fill" />
            </v-avatar>
          </div>
          <div class="mt-4 d-flex align-center">
            <v-chip size="x-small" color="success" class="font-weight-bold mr-2" label>
              <PhTrendUp size="12" class="mr-1" weight="bold" />
              12%
            </v-chip>
            <span class="text-caption text-medium-emphasis">since last month</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 h-100">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                Avg Attendance
              </div>
              <div class="text-h5 font-weight-bold mt-1">94.8%</div>
            </div>
            <v-avatar color="green-lighten-5" size="48">
              <PhCalendarCheck size="24" class="text-success" weight="fill" />
            </v-avatar>
          </div>
          <div class="mt-4 d-flex align-center">
            <v-chip size="x-small" color="error" class="font-weight-bold mr-2" label>
              <PhTrendDown size="12" class="mr-1" weight="bold" />
              0.5%
            </v-chip>
            <span class="text-caption text-medium-emphasis">vs last week</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 h-100">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                MTSS Active cases
              </div>
              <div class="text-h5 font-weight-bold mt-1">142</div>
            </div>
            <v-avatar color="orange-lighten-5" size="48">
              <PhClipboardText size="24" class="text-warning" weight="fill" />
            </v-avatar>
          </div>
          <div class="mt-4 d-flex align-center">
            <v-chip size="x-small" color="warning" class="font-weight-bold mr-2" label> 85 </v-chip>
            <span class="text-caption text-medium-emphasis">Require attention</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4 h-100">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold">
                Intervention Success
              </div>
              <div class="text-h5 font-weight-bold mt-1">78%</div>
            </div>
            <v-avatar color="purple-lighten-5" size="48">
              <PhChartLineUp size="24" class="text-purple" weight="fill" />
            </v-avatar>
          </div>
          <div class="mt-4 d-flex align-center">
            <v-chip size="x-small" color="success" class="font-weight-bold mr-2" label>
              <PhTrendUp size="12" class="mr-1" weight="bold" />
              5%
            </v-chip>
            <span class="text-caption text-medium-emphasis">Goal met</span>
          </div>
        </v-card>
      </v-col>
    </v-row> -->

    <!-- 3 Graphs Section -->
    <!-- <div class="mb-6">
      <div class="text-h6 font-weight-bold mb-4 px-1">Overview</div>
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Attendance Trend</div>
                <div class="text-caption text-medium-emphasis">Last 7 Days</div>
              </div>
              <PhCalendarCheck color="var(--v-theme-primary)" size="24" weight="fill" />
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
              <PhChartBar color="var(--v-theme-success)" size="24" weight="fill" />
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
              <PhWarningCircle color="var(--v-theme-error)" size="24" weight="fill" />
            </div>
            <div class="chart-wrapper">
              <Bar :data="riskDriversData" :options="riskOptions" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div> -->

    <!-- MTSS Stats / Filler Section -->
    <!-- <div class="mb-6">
      <div class="text-h6 font-weight-bold mb-4 px-1">Student Support System (MTSS)</div>
      <v-row>
        <v-col cols="12" md="8">
          <v-card elevation="2" class="pa-4 fill-height">
            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Tier Distribution</div>
                <div class="text-caption text-medium-emphasis">
                  Current student population breakdown
                </div>
              </div>
              <v-btn variant="text" size="small" color="primary">View Report</v-btn>
            </div>

            Fake Visuals
            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="font-weight-medium">Tier 1 - Core Instruction</span>
                <span class="font-weight-bold">80% (996)</span>
              </div>
              <v-progress-linear
                model-value="80"
                color="success"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="font-weight-medium">Tier 2 - Targeted Group</span>
                <span class="font-weight-bold">15% (186)</span>
              </div>
              <v-progress-linear
                model-value="15"
                color="warning"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span class="font-weight-medium">Tier 3 - Intensive Individual</span>
                <span class="font-weight-bold">5% (63)</span>
              </div>
              <v-progress-linear
                model-value="5"
                color="error"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="d-flex justify-space-between align-center py-2">
              <div class="text-center px-4">
                <div class="text-h6 font-weight-bold">24</div>
                <div class="text-caption text-medium-emphasis">Pending Referrals</div>
              </div>
              <div class="v-divider-vertical mx-2"></div>
              <div class="text-center px-4">
                <div class="text-h6 font-weight-bold">12</div>
                <div class="text-caption text-medium-emphasis">Reviews Due</div>
              </div>
              <div class="v-divider-vertical mx-2"></div>
              <div class="text-center px-4">
                <div class="text-h6 font-weight-bold">5</div>
                <div class="text-caption text-medium-emphasis">Exit Criteria Met</div>
              </div>
              <div class="v-divider-vertical mx-2"></div>
              <div class="text-center px-4">
                <div class="text-h6 font-weight-bold">98%</div>
                <div class="text-caption text-medium-emphasis">Screening Complete</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4 fill-height">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-subtitle-1 font-weight-bold">Recent Alerts</div>
              <v-chip size="x-small" color="error" variant="flat">5 New</v-chip>
            </div>

            <v-list density="compact" class="pa-0">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-avatar color="warning-lighten-5" size="32" class="mr-3">
                    <PhWarning size="16" class="text-warning" weight="fill" />
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium"
                  >Attendance Drop</v-list-item-title
                >
                <v-list-item-subtitle class="text-caption"
                  >Sarah James • Below 85%</v-list-item-subtitle
                >
              </v-list-item>
              <v-divider class="my-2"></v-divider>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-avatar color="blue-lighten-5" size="32" class="mr-3">
                    <PhFileText size="16" class="text-info" weight="fill" />
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium"
                  >IEP Review Due</v-list-item-title
                >
                <v-list-item-subtitle class="text-caption"
                  >Michael Scott • 2 days overdue</v-list-item-subtitle
                >
              </v-list-item>
              <v-divider class="my-2"></v-divider>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-avatar color="green-lighten-5" size="32" class="mr-3">
                    <PhSealCheck size="16" class="text-success" weight="fill" />
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2 font-weight-medium"
                  >Goal Met: Reading</v-list-item-title
                >
                <v-list-item-subtitle class="text-caption"
                  >Jessica Pearson • T2 Success</v-list-item-subtitle
                >
              </v-list-item>
            </v-list>
            <div class="mt-2 text-center">
              <v-btn variant="text" size="small" block color="medium-emphasis"
                >View All Alerts</v-btn
              >
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div> -->

    <!-- Course Cards Section -->
    <div>
      <div class="d-flex align-center justify-space-between mb-4 px-1">
        <div class="text-h6 font-weight-bold">Courses</div>
        <v-btn variant="text" size="small" color="primary" @click="searchDialog = true">
          <template v-slot:prepend>
            <PhMagnifyingGlass size="16" weight="bold" />
          </template>
          Search Courses
        </v-btn>
      </div>

      <v-row>
        <v-col v-for="course in displayedCourses" :key="course.id" cols="12" sm="6" md="4" lg="2">
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
                <PhDotsThreeVertical size="20" class="text-medium-emphasis" weight="bold" />
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

    <!-- CMDK Style Search Dialog -->
    <v-dialog v-model="searchDialog" max-width="600" scrollable>
      <v-card class="search-dialog">
        <div class="pa-4 border-b">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search courses..."
            variant="plain"
            hide-details
            clearable
            autofocus
            class="search-input"
          >
            <template v-slot:prepend-inner>
              <PhMagnifyingGlass size="20" class="text-medium-emphasis mr-2" />
            </template>
          </v-text-field>
        </div>

        <v-card-text class="pa-0" style="height: 400px">
          <v-list v-if="filteredCourses.length > 0" lines="two">
            <v-list-item
              v-for="course in filteredCourses"
              :key="course.id"
              @click="navigateToCourse(course)"
              link
              class="py-3"
            >
              <template v-slot:prepend>
                <v-avatar :color="course.color" variant="tonal" class="rounded-lg mr-4">
                  <span class="text-subtitle-2">{{ course.alias.substring(0, 2) }}</span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold mb-1">
                {{ course.alias }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <span class="mr-3 d-flex align-center">
                  <PhClock size="14" class="mr-1" />
                  {{ course.period }}
                </span>
                <span class="d-flex align-center">
                  <PhMapPin size="14" class="mr-1" />
                  {{ course.room }}
                </span>
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-caption text-medium-emphasis bg-grey-lighten-4 px-2 py-1 rounded">
                  {{ course.students }} students
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div
            v-else
            class="d-flex flex-column align-center justify-center fill-height text-medium-emphasis"
          >
            <PhMagnifyingGlass size="48" class="mb-2 text-medium-emphasis" />
            <div>No courses found</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Line } from 'vue-chartjs'
import { useSchoolStore } from '@/stores/school'
import {
  PhCaretDown,
  PhUsers,
  PhTrendUp,
  PhTrendDown,
  PhCalendarCheck,
  PhClipboardText,
  PhChartLineUp,
  PhChartBar,
  PhWarningCircle,
  PhMagnifyingGlass,
  PhDotsThreeVertical,
  PhClock,
  PhMapPin,
  PhWarning,
  PhFileText,
  PhSealCheck,
} from '@phosphor-icons/vue'

const schoolStore = useSchoolStore()
const schools = ref([])
const district = ref('')

const searchDialog = ref(false)
const searchQuery = ref('')

const displayedCourses = computed(() => {
  return courses.value.slice(0, 6)
})

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  const query = searchQuery.value.toLowerCase()
  return courses.value.filter(
    (course) =>
      course.alias.toLowerCase().includes(query) || course.room.toLowerCase().includes(query),
  )
})

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
  searchDialog.value = false
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

.search-dialog {
  overflow: hidden;
}

.search-input :deep(.v-field__input) {
  font-size: 1.1rem;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
