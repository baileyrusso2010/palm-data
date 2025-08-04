<template>
  <div class="class-detail-page">
    <v-container fluid class="pa-8">
      <!-- Class Header -->
      <v-card class="header-card mb-8" elevation="4">
        <div class="header-gradient">
          <v-card-title class="text-h3 font-weight-bold text-white pa-8">
            {{ classInfo.name }}
            <div class="text-subtitle-1 mt-2 text-white-80">
              {{ classInfo.program }} • {{ classInfo.schoolYear }} •
              {{
                classInfo.teacher
                  ? `${classInfo.teacher.firstName} ${classInfo.teacher.lastName}`
                  : 'No Teacher Assigned'
              }}
            </div>
          </v-card-title>
        </div>

        <!-- Statistics Cards -->
        <v-card-text class="pa-6">
          <v-row>
            <v-col
              cols="12"
              sm="4"
              v-for="stat in stats"
              :key="stat.title"
              class="d-flex align-center justify-center"
            >
              <v-card class="stat-card" elevation="2" style="width: 100%">
                <v-card-text
                  class="text-center pa-6 d-flex flex-column align-center justify-center"
                  style="height: 100%"
                >
                  <v-icon :color="stat.color" size="48" class="mb-3">{{ stat.icon }}</v-icon>
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.title }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Student Table -->
      <v-card class="table-card" elevation="3">
        <v-card-title class="table-header pa-6">
          <v-icon class="me-3" color="primary">mdi-account-group</v-icon>
          <span class="text-h5 font-weight-bold">Student Roster</span>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="students"
          :search="search"
          :items-per-page="10"
          class="refined-table"
          show-expand
          item-value="id"
          expand-on-click
          @click:row="handleRowClick"
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="40" :color="getAvatarColor(item.name ?? '')" class="me-3">
                <span class="text-white font-weight-bold">{{ getInitials(item.name ?? '') }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name ?? '' }}</div>
                <div class="text-caption text-medium-emphasis">ID: {{ item.studentId ?? '' }}</div>
              </div>
            </div>
          </template>

          <template v-slot:item.juniorGrade="{ item }">
            <v-chip :color="getGradeColor(item.juniorGrade ?? 0)" size="small" variant="flat">
              {{ item.juniorGrade ?? 0 }}%
            </v-chip>
          </template>

          <template v-slot:item.seniorGrade="{ item }">
            <v-chip :color="getGradeColor(item.seniorGrade ?? 0)" size="small" variant="flat">
              {{ item.seniorGrade ?? 0 }}%
            </v-chip>
          </template>

          <template v-slot:item.averageGrade="{ item }">
            <div class="d-flex align-center">
              <v-progress-linear
                :model-value="item.averageGrade ?? 0"
                :color="getGradeColor(item.averageGrade ?? 0)"
                height="8"
                rounded
                class="me-3"
                style="width: 80px"
              />
              <span class="font-weight-bold">{{ item.averageGrade ?? 0 }}%</span>
            </div>
          </template>

          <template v-slot:item.techAverage="{ item }">
            <div class="text-center">
              <v-chip
                :color="getTechAssessmentColor(item.techAverage || 0)"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ item.techAverage ? `${item.techAverage}/4` : 'N/A' }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.attendanceRate="{ item }">
            <div class="text-center">
              <v-progress-circular
                :model-value="item.attendanceRate || 0"
                :color="getAttendanceColor(item.attendanceRate || 0)"
                size="40"
                width="4"
              >
                <span class="text-caption font-weight-bold">{{ item.attendanceRate || 0 }}</span>
              </v-progress-circular>
            </div>
          </template>

          <!-- Expanded Row Content -->
          <template v-slot:expanded-row="{ item }">
            <tr>
              <td colspan="7" class="pa-0">
                <v-card flat class="ma-4 expanded-content">
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" md="6">
                        <h3 class="text-h6 mb-4 d-flex align-center">
                          <v-icon color="primary" class="me-2">mdi-account-details</v-icon>
                          Student Information
                        </h3>
                        <div class="info-grid">
                          <div class="info-item">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">{{ item.name }}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-label">Student ID:</span>
                            <span class="info-value">{{ item.studentId }}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ generateEmail(item.name || '') }}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">{{ generatePhone() }}</span>
                          </div>
                          <div class="info-item">
                            <span class="info-label">Enrollment Date:</span>
                            <span class="info-value">{{ generateEnrollmentDate() }}</span>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <h3 class="text-h6 mb-4 d-flex align-center">
                          <v-icon color="success" class="me-2">mdi-chart-bar</v-icon>
                          Academic Performance
                        </h3>
                        <div class="performance-grid">
                          <v-card variant="outlined" class="pa-4 mb-3">
                            <div class="d-flex justify-space-between align-center">
                              <span class="font-weight-medium">Junior Year Grade</span>
                              <v-chip :color="getGradeColor(item.juniorGrade || 0)" variant="flat">
                                {{ item.juniorGrade || 0 }}%
                              </v-chip>
                            </div>
                            <v-progress-linear
                              :model-value="item.juniorGrade || 0"
                              :color="getGradeColor(item.juniorGrade || 0)"
                              height="6"
                              rounded
                              class="mt-2"
                            />
                          </v-card>
                          <v-card variant="outlined" class="pa-4 mb-3">
                            <div class="d-flex justify-space-between align-center">
                              <span class="font-weight-medium">Senior Year Grade</span>
                              <v-chip :color="getGradeColor(item.seniorGrade || 0)" variant="flat">
                                {{ item.seniorGrade || 0 }}%
                              </v-chip>
                            </div>
                            <v-progress-linear
                              :model-value="item.seniorGrade || 0"
                              :color="getGradeColor(item.seniorGrade || 0)"
                              height="6"
                              rounded
                              class="mt-2"
                            />
                          </v-card>
                          <v-card variant="outlined" class="pa-4">
                            <div class="d-flex justify-space-between align-center">
                              <span class="font-weight-medium">Attendance Rate</span>
                              <v-chip
                                :color="getAttendanceColor(item.attendanceRate || 0)"
                                variant="flat"
                              >
                                {{ item.attendanceRate || 0 }}%
                              </v-chip>
                            </div>
                            <v-progress-linear
                              :model-value="item.attendanceRate || 0"
                              :color="getAttendanceColor(item.attendanceRate || 0)"
                              height="6"
                              rounded
                              class="mt-2"
                            />
                          </v-card>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row class="mt-4">
                      <v-col cols="12" md="6">
                        <h3 class="text-h6 mb-3 d-flex align-center">
                          <v-icon color="warning" class="me-2">mdi-briefcase-check</v-icon>
                          Practical Portfolio
                        </h3>
                        <v-card variant="outlined" class="pa-4">
                          <div class="portfolio-grid">
                            <div
                              class="portfolio-item"
                              v-for="portfolio in generatePortfolioItems()"
                              :key="portfolio.name"
                            >
                              <div class="d-flex justify-space-between align-center">
                                <span class="font-weight-medium">{{ portfolio.name }}</span>
                                <v-chip
                                  :color="portfolio.status === 'Pass' ? 'success' : 'error'"
                                  size="small"
                                  variant="flat"
                                >
                                  {{ portfolio.status }}
                                </v-chip>
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" md="6">
                        <h3 class="text-h6 mb-3 d-flex align-center">
                          <v-icon color="purple" class="me-2">mdi-account-check</v-icon>
                          Technical Assessment
                        </h3>
                        <v-card variant="outlined" class="pa-4">
                          <div
                            v-if="
                              item.techAssessment && Object.keys(item.techAssessment).length > 0
                            "
                          >
                            <!-- Overall Average -->
                            <div class="assessment-item mb-4">
                              <div class="d-flex justify-space-between align-center mb-2">
                                <span class="font-weight-bold text-subtitle-1"
                                  >Overall Average</span
                                >
                                <v-chip
                                  :color="getTechAssessmentColor(item.techAverage || 0)"
                                  size="large"
                                  variant="flat"
                                  class="font-weight-bold"
                                >
                                  {{ item.techAverage ? `${item.techAverage}/4` : 'N/A' }}
                                </v-chip>
                              </div>
                              <v-progress-linear
                                :model-value="(item.techAverage || 0) * 25"
                                :color="getTechAssessmentColor(item.techAverage || 0)"
                                height="8"
                                rounded
                                class="mb-4"
                              />
                            </div>

                            <!-- Detailed Scores -->
                            <div class="text-subtitle-2 font-weight-bold mb-3">
                              Semester Breakdown:
                            </div>

                            <!-- Junior Year -->
                            <div class="mb-3">
                              <div class="text-body-2 font-weight-medium mb-2 text-success">
                                Junior Year
                              </div>
                              <v-row dense>
                                <v-col cols="6">
                                  <v-card variant="outlined" class="pa-3">
                                    <div class="text-center">
                                      <div class="text-caption text-medium-emphasis">
                                        Semester 1
                                      </div>
                                      <div
                                        class="text-h6 font-weight-bold"
                                        :class="`text-${getTechAssessmentColor(item.techAssessment?.jrSem1 || 0)}`"
                                      >
                                        {{ formatTechScore(item.techAssessment?.jrSem1) }}
                                      </div>
                                    </div>
                                  </v-card>
                                </v-col>
                                <v-col cols="6">
                                  <v-card variant="outlined" class="pa-3">
                                    <div class="text-center">
                                      <div class="text-caption text-medium-emphasis">
                                        Semester 2
                                      </div>
                                      <div
                                        class="text-h6 font-weight-bold"
                                        :class="`text-${getTechAssessmentColor(item.techAssessment?.jrSem2 || 0)}`"
                                      >
                                        {{ formatTechScore(item.techAssessment?.jrSem2) }}
                                      </div>
                                    </div>
                                  </v-card>
                                </v-col>
                              </v-row>
                            </div>

                            <!-- Senior Year -->
                            <div>
                              <div class="text-body-2 font-weight-medium mb-2 text-info">
                                Senior Year
                              </div>
                              <v-row dense>
                                <v-col cols="6">
                                  <v-card variant="outlined" class="pa-3">
                                    <div class="text-center">
                                      <div class="text-caption text-medium-emphasis">
                                        Semester 1
                                      </div>
                                      <div
                                        class="text-h6 font-weight-bold"
                                        :class="`text-${getTechAssessmentColor(item.techAssessment?.srSem1 || 0)}`"
                                      >
                                        {{ formatTechScore(item.techAssessment?.srSem1) }}
                                      </div>
                                    </div>
                                  </v-card>
                                </v-col>
                                <v-col cols="6">
                                  <v-card variant="outlined" class="pa-3">
                                    <div class="text-center">
                                      <div class="text-caption text-medium-emphasis">
                                        Semester 2
                                      </div>
                                      <div
                                        class="text-h6 font-weight-bold"
                                        :class="`text-${getTechAssessmentColor(item.techAssessment?.srSem2 || 0)}`"
                                      >
                                        {{ formatTechScore(item.techAssessment?.srSem2) }}
                                      </div>
                                    </div>
                                  </v-card>
                                </v-col>
                              </v-row>
                            </div>
                          </div>

                          <div v-else>
                            <div class="text-center text-medium-emphasis py-4">
                              <v-icon size="48" color="grey-lighten-1" class="mb-2"
                                >mdi-clipboard-off</v-icon
                              >
                              <div>No technical assessments recorded</div>
                            </div>
                          </div>

                          <div class="text-caption text-medium-emphasis mt-3">
                            Technical skills are assessed on a scale of 1-4, where 4 represents
                            mastery level
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row class="mt-4">
                      <v-col cols="12">
                        <h3 class="text-h6 mb-3 d-flex align-center">
                          <v-icon color="orange" class="me-2">mdi-briefcase-clock</v-icon>
                          Work Based Learning
                        </h3>
                        <v-card variant="outlined" class="pa-4">
                          <div v-if="item.wblHours && item.wblHours.length">
                            <div class="mb-4">
                              <span class="font-weight-medium">Total Hours:</span>
                              <span class="font-weight-bold text-h6 ms-2">
                                {{ item.wblHours.reduce((sum, w) => sum + Number(w.hours), 0) }}
                              </span>
                            </div>
                            <div>
                              <div class="text-subtitle-2 font-weight-bold mb-2">
                                Hours Breakdown:
                              </div>
                            </div>
                            <div class="mt-4">
                              <div class="text-caption text-medium-emphasis mb-2">Entries:</div>
                              <v-table density="compact">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Hours</th>
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="w in item.wblHours" :key="w.id">
                                    <td>{{ w.recorded_at }}</td>
                                    <td>{{ w.wbl_type?.name || 'Other' }}</td>
                                    <td>{{ w.hours }}</td>
                                    <td>{{ w.notes }}</td>
                                  </tr>
                                </tbody>
                              </v-table>
                            </div>
                          </div>
                          <div v-else>
                            <span class="text-medium-emphasis">No WBL hours recorded.</span>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row class="mt-4">
                      <v-col cols="12">
                        <h3 class="text-h6 mb-3 d-flex align-center">
                          <v-icon color="info" class="me-2">mdi-note-text</v-icon>
                          Recent Notes & Comments
                        </h3>
                        <v-card variant="outlined" class="pa-4">
                          <div class="text-body-2 text-medium-emphasis mb-2">
                            Latest teacher comment:
                          </div>
                          <div class="text-body-1">{{ generateTeacherComment(item) }}</div>
                          <div class="text-caption text-medium-emphasis mt-2">
                            Added on {{ new Date().toLocaleDateString() }}
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// Types
interface WBLHour {
  id: number
  hours: string
  notes: string
  recorded_at: string
  student_id: number
  wbl_type: {
    id: number
    name: string
  }
  wbl_type_id: number
}

interface Student {
  id: number
  firstName: string
  lastName: string
  studentId: string
  techAssessment: {
    jrSem1?: number
    jrSem2?: number
    srSem1?: number
    srSem2?: number
  }
  grades: {
    juniorGrade?: number
    seniorGrade?: number
  }
  attendance: {
    absences: number
    absensesUnexcused: number
    absensesExcused: number
  }[]
  name?: string // computed field for display
  juniorGrade?: number // computed from grades object
  seniorGrade?: number // computed from grades object
  averageGrade?: number // computed field
  attendanceRate?: number // computed field
  techAverage?: number // computed from techAssessment
  wblHours?: WBLHour[] // real WBL data from API
}

interface ClassData {
  id: number
  name: string
  teacher: {
    firstName: string
    lastName: string
    email: string
  }
  program: string
  schoolYear: string
}

interface ApiResponse {
  class: ClassData
  students: Student[]
}

// Reactive data
const search = ref('')
const page = ref(1)
const loading = ref(false)
const error = ref('')

const classInfo = ref<ClassData>({
  id: 1,
  name: 'Loading...',
  teacher: {
    firstName: '',
    lastName: '',
    email: '',
  },
  program: '',
  schoolYear: '',
})

const students = ref<Student[]>([])

// API functions
const fetchClassData = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get<ApiResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/api/classes/2/students/`,
    )

    // Update class info
    classInfo.value = response.data.class

    // Transform student data to match our component needs
    students.value = response.data.students.map((student) => {
      // Calculate attendance rate (handle empty attendance array)
      const attendanceData = student.attendance.length > 0 ? student.attendance[0] : null
      const attendanceRate = attendanceData ? calculateAttendanceRate(attendanceData) : 0

      // Extract grades from nested grades object
      const juniorGrade = student.grades?.juniorGrade || 0
      const seniorGrade = student.grades?.seniorGrade || 0
      const averageGrade =
        juniorGrade && seniorGrade ? Math.round((juniorGrade + seniorGrade) / 2) : 0

      // Calculate technical assessment average
      const techScores = [
        student.techAssessment?.jrSem1,
        student.techAssessment?.jrSem2,
        student.techAssessment?.srSem1,
        student.techAssessment?.srSem2,
      ].filter((score): score is number => score !== undefined && score !== null)

      const techAverage =
        techScores.length > 0
          ? Number(
              (techScores.reduce((sum, score) => sum + score, 0) / techScores.length).toFixed(2),
            )
          : 0

      return {
        ...student,
        name: `${student.firstName} ${student.lastName}`,
        attendanceRate,
        juniorGrade,
        seniorGrade,
        averageGrade,
        techAverage,
      }
    })
  } catch (err) {
    console.error('Error fetching class data:', err)
    error.value = 'Failed to load class data. Please try again.'
  } finally {
    loading.value = false
  }
}

const calculateAttendanceRate = (attendance: {
  absences: number
  absensesUnexcused: number
  absensesExcused: number
}) => {
  // Assuming a typical school year has about 180 days
  const totalSchoolDays = 180
  const totalAbsences = attendance.absences
  const attendanceRate = Math.max(
    0,
    Math.round(((totalSchoolDays - totalAbsences) / totalSchoolDays) * 100),
  )
  return attendanceRate
}

// Initialize data on component mount
onMounted(() => {
  fetchClassData()
})

// Computed properties
const stats = computed(() => [
  {
    title: 'Total Students',
    value: students.value.length,
    icon: 'mdi-account-group',
    color: 'primary',
  },
  {
    title: 'Average Grade',
    value: students.value.length
      ? `${Math.round(students.value.reduce((sum, s) => sum + (s.averageGrade || 0), 0) / students.value.length)}%`
      : '0%',
    icon: 'mdi-chart-line',
    color: 'success',
  },
  {
    title: 'Average Attendance',
    value: students.value.length
      ? `${Math.round(students.value.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / students.value.length)}%`
      : '0%',
    icon: 'mdi-calendar-check',
    color: 'info',
  },
])

const headers = [
  { title: 'Student', key: 'name', sortable: true },
  { title: 'Junior Grade', key: 'juniorGrade', sortable: true, align: 'center' as const },
  { title: 'Senior Grade', key: 'seniorGrade', sortable: true, align: 'center' as const },
  { title: 'Average Grade', key: 'averageGrade', sortable: true, align: 'center' as const },
  { title: 'Tech Skills', key: 'techAverage', sortable: true, align: 'center' as const },
  { title: 'Attendance', key: 'attendanceRate', sortable: true, align: 'center' as const },
]

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const getAvatarColor = (name: string): string => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const getGradeColor = (grade: number): string => {
  if (grade >= 90) return 'success'
  if (grade >= 80) return 'info'
  if (grade >= 70) return 'warning'
  return 'error'
}

const getAttendanceColor = (attendance: number): string => {
  if (attendance >= 95) return 'success'
  if (attendance >= 85) return 'info'
  if (attendance >= 75) return 'warning'
  return 'error'
}

const getTechAssessmentColor = (score: number): string => {
  if (score >= 3.5) return 'success'
  if (score >= 2.5) return 'info'
  if (score >= 1.5) return 'warning'
  return 'error'
}

const formatTechScore = (score: number | undefined): string => {
  return score ? `${score}/4` : 'N/A'
}

// Helper functions for expanded content
const generateStudentId = (name: string): string => {
  const year = new Date().getFullYear()
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return `STU${year}${String(hash).slice(-4).padStart(4, '0')}`
}

const generateEmail = (name: string): string => {
  const [first, last] = name.toLowerCase().split(' ')
  return `${first}.${last}@school.edu`
}

const generatePhone = (): string => {
  const area = Math.floor(Math.random() * 800) + 200
  const exchange = Math.floor(Math.random() * 800) + 200
  const number = Math.floor(Math.random() * 9000) + 1000
  return `(${area}) ${exchange}-${number}`
}

const generateEnrollmentDate = (): string => {
  const year = new Date().getFullYear() - Math.floor(Math.random() * 4) - 1
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
}

const generateTeacherComment = (student: Student): string => {
  const comments = [
    `${student.name} shows excellent progress in analytical thinking and problem-solving skills.`,
    `${student.name} demonstrates strong understanding of mathematical concepts and actively participates in class discussions.`,
    `${student.name} has been working diligently to improve their performance and shows great potential.`,
    `${student.name} excels in collaborative work and often helps classmates understand difficult concepts.`,
    `${student.name} shows consistent effort and dedication to their studies. Keep up the good work!`,
    `${student.name} has shown remarkable improvement this semester and demonstrates strong mathematical reasoning.`,
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

const generatePortfolioItems = () => {
  const portfolioItems = [
    'Project 1: Database Design',
    'Project 2: Web Application',
    'Project 3: System Analysis',
    'Project 4: Final Capstone',
  ]

  return portfolioItems.map((item) => ({
    name: item,
    status: Math.random() > 0.3 ? 'Pass' : 'Fail',
  }))
}

// Actions
const handleRowClick = async (event: any, { item }: { item: Student }) => {
  try {
    // Make axios call when row is clicked
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/student-wbl-hours/${item.id}`,
    )

    // Store the WBL hours data in the student object
    item.wblHours = response.data

    // Force reactivity by updating the students array
    const studentIndex = students.value.findIndex((s) => s.id === item.id)
    if (studentIndex !== -1) {
      students.value[studentIndex] = { ...students.value[studentIndex], wblHours: response.data }
    }
  } catch (error) {
    console.error('Error fetching student WBL details:', error)
    // Optionally show an error message to the user
  }
}

const viewStudent = (student: Student) => {
  console.log('View student:', student)
}

const editStudent = (student: Student) => {
  console.log('Edit student:', student)
}

const emailStudent = (student: Student) => {
  console.log('Email student:', student)
}
</script>

<style scoped>
.class-detail-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.header-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.text-white-80 {
  opacity: 0.9;
}

.stat-card {
  border-radius: 12px;
  background: white;
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-card {
  border-radius: 12px;
  background: white;
  border: 1px solid #e1e5e9;
}

.search-input {
  max-width: 400px;
}

.table-card {
  border-radius: 16px;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.table-header {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.refined-table {
  background: transparent;
}

:deep(.v-data-table__wrapper) {
  background: white;
}

:deep(.v-data-table-header) {
  background: #f1f5f9;
}

:deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.v-data-table__td) {
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 12px;
}

:deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

:deep(.v-data-table__tr) {
  transition: background-color 0.2s ease;
}

:deep(.v-text-field .v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-field__outline) {
  --v-field-border-width: 2px;
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  --v-field-border-opacity: 1;
}

.v-btn {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.25px;
}

.v-chip {
  font-weight: 500;
  border-radius: 6px;
}

.text-h3 {
  font-weight: 700;
  line-height: 1.2;
}

.text-h5 {
  font-weight: 600;
  color: #1e293b;
}

/* Expanded Content Styles */
.expanded-content {
  background: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #64748b;
  min-width: 120px;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
}

.performance-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.portfolio-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.portfolio-item {
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.portfolio-item:last-child {
  border-bottom: none;
}

.assessment-item {
  padding: 8px 0;
}

.wbl-summary {
  border-right: 1px solid #e2e8f0;
  padding-right: 16px;
}

.wbl-breakdown {
  padding-left: 16px;
}

.wbl-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wbl-type-item {
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

:deep(.v-data-table__expand-icon) {
  color: #3b82f6 !important;
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.v-data-table__expand-col) {
  width: 48px !important;
}

:deep(.v-data-table__expanded__content) {
  box-shadow: none !important;
}

:deep(.v-data-table__expanded__row) {
  background: transparent !important;
}
</style>
