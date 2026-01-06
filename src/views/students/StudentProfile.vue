<template>
  <div class="profile-page">
    <section class="profile-hero card">
      <div class="hero-grid">
        <div class="identity">
          <div class="avatar" aria-hidden="true">
            {{ initials }}
          </div>
          <div>
            <p class="eyebrow">Student Profile</p>
            <h1>{{ student.name }}</h1>
            <p class="meta">
              {{ student.program }} · {{ student.gradeLevel }} · {{ student.location }}
            </p>
          </div>
        </div>
        <div class="signal">
          <p class="eyebrow">Instructor</p>
          <h3>{{ student.advisor }}</h3>
          <p class="meta">ID {{ student.id }}</p>
        </div>
        <div class="signal">
          <p class="eyebrow">MTSS Profile</p>
          <h3>{{ mtssData.tierName || 'N/A' }}</h3>
          <p class="meta">
            {{ mtssData.domainName || 'N/A' }} ·
            {{ mtssData.daysInTier !== null ? mtssData.daysInTier + ' days' : 'N/A' }}
          </p>
        </div>
      </div>
      <div class="stat-row">
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <p class="eyebrow">{{ stat.label }}</p>
          <div class="stat-value">
            <span>{{ stat.value }}</span>
            <small :class="stat.trend">{{ stat.delta }}</small>
          </div>
        </div>
      </div>
    </section>

    <!-- New Charts Section -->
    <section class="charts-row card">
      <header>
        <p class="eyebrow">Performance Overview</p>
      </header>
      <div class="charts-grid">
        <div class="chart-container">
          <h4>Attendance</h4>
          <canvas ref="attendanceCanvas"></canvas>
        </div>
        <div class="chart-container">
          <h4>Grades</h4>
          <canvas ref="gradesCanvas"></canvas>
        </div>
        <div class="chart-container">
          <h4>Behavior</h4>
          <canvas ref="behaviorCanvas"></canvas>
        </div>
      </div>
    </section>

    <section class="profile-body">
      <!-- Grades Section: own full row in profile-body -->
      <div class="card grades-card">
        <header>
          <div>
            <p class="eyebrow">Academics</p>
            <h3>Term Grades</h3>
            <p class="meta">Performance by grading period</p>
          </div>
        </header>
        <div class="grades-grid-container">
          <div class="grades-grid">
            <div v-for="grade in termGrades" :key="grade.courseName" class="grade-course-card">
              <div class="grade-card-header">
                <div>
                  <h4 class="grade-course-title">{{ grade.courseName }}</h4>
                  <p class="grade-course-teacher">{{ grade.teacher }}</p>
                </div>
                <!-- Logic: Show S1 if available, otherwise Q2 or Q1. Or use 'current' logic. -->
                <div class="grade-main-score">
                  <span
                    :class="[
                      'big-score',
                      scoreClass(grade.s1 || grade.q2 || grade.q1 || grade.q3 || grade.q4),
                    ]"
                  >
                    {{ grade.s1 || grade.q2 || grade.q1 || grade.q3 || grade.q4 || '-' }}%
                  </span>
                </div>
              </div>
              <div class="grade-card-footer">
                <div class="grade-pill-row">
                  <div class="grade-pill">
                    <span class="lbl">Q1</span>
                    <span :class="['val', scoreClass(grade.q1)]">{{ grade.q1 || '-' }}</span>
                  </div>
                  <div class="grade-pill">
                    <span class="lbl">Q2</span>
                    <span :class="['val', scoreClass(grade.q2)]">{{ grade.q2 || '-' }}</span>
                  </div>
                  <div class="grade-pill semester">
                    <span class="lbl">S1</span>
                    <span :class="['val', scoreClass(grade.s1)]">{{ grade.s1 || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessments Section: own full row in profile-body -->
      <div class="card assessments-card">
        <header>
          <div>
            <p class="eyebrow">Assessments</p>
            <h3>Section Scores</h3>
            <p class="meta">Summary of recent assessment performance</p>
          </div>
        </header>
        <div class="assessments-grid">
          <div
            v-for="item in studentAssessments"
            :key="item.id"
            class="assessment-tile"
            @click="onAssessmentClick(item)"
          >
            <div class="assessment-header">
              <p class="assessment-title">{{ item.name }}</p>
              <span :class="['score-badge', scoreClass(item.score)]">{{ item.score }}%</span>
            </div>
            <p class="assessment-meta">Latest attempt</p>
          </div>
        </div>
      </div>

      <div class="column column-primary">
        <div class="card wbl-card">
          <header>
            <div>
              <p class="eyebrow">Work-Based Learning</p>
              <h3>Real-World Hours</h3>
              <p class="meta">Live experiences across internship, co-op, and field</p>
            </div>
            <div class="wbl-header-stats">
              <p class="hours-stat">{{ wblTotalHours }}h / {{ wblTargetHours }}h</p>
              <p class="meta">{{ wblCompletion }}% complete</p>
              <PhPlusCircle
                :size="30"
                color="#0e7a00"
                weight="duotone"
                @click="addHoursDialog = true"
                style="cursor: pointer; margin-top: 8px"
              />
            </div>
          </header>
          <div class="wbl-progress-grid">
            <div
              v-for="experience in workBasedLearning"
              :key="experience.label"
              class="wbl-progress-item"
            >
              <div class="circular-progress">
                <svg class="progress-ring" :width="120" :height="120">
                  <circle
                    class="progress-ring-bg"
                    :stroke-width="8"
                    fill="transparent"
                    :r="52"
                    :cx="60"
                    :cy="60"
                  />
                  <circle
                    class="progress-ring-fill"
                    :stroke-width="8"
                    fill="transparent"
                    :r="52"
                    :cx="60"
                    :cy="60"
                    :style="{
                      strokeDasharray: `${2 * Math.PI * 52}`,
                      strokeDashoffset: `${2 * Math.PI * 52 * (1 - getWblPercent(experience) / 100)}`,
                    }"
                  />
                </svg>
                <div class="progress-center">
                  <span class="progress-hours">{{ experience.hours }}</span>
                  <span class="progress-label">hrs</span>
                </div>
              </div>
              <div class="wbl-progress-info">
                <p class="wbl-category-name">{{ experience.label }}</p>
                <p class="wbl-percentage">{{ getWblPercent(experience) }}% of target</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column column-secondary">
        <div class="card">
          <header>
            <div>
              <p class="eyebrow">Assignments</p>
              <h3>Active Forms</h3>
            </div>
          </header>
          <ul class="form-list">
            <li v-for="form in studentForms" :key="form.id">
              <div class="form-info clickable" @click="goToForm()">
                <p class="form-title">{{ form.title }}</p>
                <p class="meta">{{ form.date }}</p>
              </div>
              <div class="form-actions">
                <span :class="['status-badge', form.status.toLowerCase()]">{{ form.status }}</span>
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  color="primary"
                  class="ml-2"
                  @click.stop="downloadForm(form.id)"
                ></v-btn>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>

  <v-dialog v-model="addHoursDialog" max-width="500">
    <v-card>
      <v-card-title>Add Work-Based Learning Hours</v-card-title>
      <v-card-text>
        <v-form>
          <v-select
            v-model="selectedCategory"
            :items="wblTypes"
            item-title="name"
            item-value="id"
            label="Category"
            :rules="[(v) => !!v || 'Category is required']"
            required
          ></v-select>
          <v-text-field
            v-model="hoursToAdd"
            label="Hours"
            type="number"
            :rules="[(v) => !!v || 'Hours are required']"
            required
          ></v-text-field>
          <v-text-field
            v-model="dateAdded"
            label="Date"
            type="date"
            :rules="[(v) => !!v || 'Date is required']"
            required
          ></v-text-field>
          <v-text-field
            v-model="commentsAdded"
            label="Comments"
            type="text"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="addHoursDialog = false">Cancel</v-btn>
        <v-btn @click="submitAddHours" color="primary">Add Hours</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="assessmentDialog" max-width="620">
    <v-card v-if="selectedAssessment" class="assessment-dialog-card">
      <v-card-title class="dialog-title">
        {{ selectedAssessment.name }}
        <span class="dialog-score-badge">{{ selectedAssessment.score }}%</span>
      </v-card-title>
      <v-card-text>
        <div class="chart-wrapper">
          <canvas ref="chartCanvas" height="260"></canvas>
        </div>

        <div v-if="selectedAssessment.questions" class="questions-list">
          <h4 class="questions-header">Question Breakdown</h4>
          <div v-for="q in selectedAssessment.questions" :key="q.id" class="question-item">
            <div class="question-text">
              <strong>Q{{ q.id }}:</strong> {{ q.text }}
            </div>
            <div class="question-stats">
              <span class="stat-badge student">You: {{ q.studentScore }}%</span>
              <span class="stat-badge class">Class: {{ q.classAvg }}%</span>
              <span class="stat-badge grade">Grade: {{ q.gradeAvg }}%</span>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeAssessmentDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { PhPlusCircle } from '@phosphor-icons/vue'
import api from '@/api'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const route = useRoute()
const wblTypes = ref([])
const behaviorAggregates = ref([])

// MTSS Data
const mtssData = ref({
  tierName: '',
  tierDescription: '',
  daysInTier: null as number | null,
  startDate: '',
  domainName: '',
  domainDescription: '',
})

onMounted(async () => {
  await Promise.all([
    getStudentDetails(),
    getStudentWBL(),
    getStudentForms(),
    getAssessmentData(),
    getWblTypes(),
    getStudentGrades(),
    getBehaviorAggregates(),
    getMtssData(),
  ])
  initProfileCharts()
})

async function getMtssData() {
  try {
    const { data } = await api.get(`/mtss/student-tiers?student_id=${route.params.id}`)

    // Find the active tier (end_date is null)
    const activeTier = data.find((tier: any) => tier.end_date === null)

    if (activeTier) {
      // Fetch tier details
      const tierResponse = await api.get(`/mtss/tiers/${activeTier.tier_id}`)
      const domainResponse = await api.get(`/mtss/domains/${activeTier.domain_id}`)

      // Calculate days in tier
      const startDate = new Date(activeTier.start_date)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      mtssData.value = {
        tierName: tierResponse.data.name || 'N/A',
        tierDescription: tierResponse.data.description || '',
        daysInTier: diffDays,
        startDate: startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        domainName: domainResponse.data.name || 'N/A',
        domainDescription: domainResponse.data.description || '',
      }
    }
  } catch (err) {
    console.error('Error getting MTSS data', err)
  }
}

async function getBehaviorAggregates() {
  try {
    const { data } = await api.get(
      `/behaviors/analytics?groupBy=month&studentId=${route.params.id}`,
    )
    behaviorAggregates.value = data
    console.log(data)
  } catch (err) {
    console.log(err)
  }
}

async function getWblTypes() {
  try {
    const { data } = await api.get(`/wbl-categories`)
    wblTypes.value = data
  } catch (err) {
    console.log(err)
  }
}

async function getStudentForms() {
  try {
    const { data } = await api.get(`/forms/student/${route.params.id}`)
    studentForms.value = data.map((f: any) => ({
      id: f.form.id,
      title: f.form.name,
      status: f.complete ? 'Completed' : 'Pending',
      date: f.complete
        ? `Submitted ${new Date(f.form.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : `Assigned ${new Date(f.form.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    }))
  } catch (e) {
    console.error('Error getting data', e)
  }
}

async function getStudentDetails() {
  try {
    const { data } = await api.get(`/students/detail/${route.params.id}`)
    const instructor = data.enrollments?.[0]?.course_instance?.instructor
    const instructorName = instructor ? `${instructor.first_name} ${instructor.last_name}` : 'N/A'

    student.value = {
      name: `${data.first_name} ${data.last_name}`,
      gradeLevel: `Grade ${data.grade}`,
      program: data.enrollments?.[0]?.course_instance?.alias || '',
      location: data.home_school?.name || '',
      advisor: instructorName,
      id: data.student_id,
      focusTrack: data.cte_school?.name || '',
      scheduleFocus: '',
    }
  } catch (err) {
    console.error('Error getting data', err)
  }
}

async function getStudentWBL() {
  try {
    const { data } = await api.get(`/wbl-students/${route.params.id}`)

    workBasedLearning.value = data.map((category: any) => {
      const totalHours = category.wbl_hours.reduce(
        (sum: number, record: any) => sum + record.hours,
        0,
      )
      return {
        id: category.id,
        label: category.name,
        context: 'Logged Hours',
        hours: totalHours,
      }
    })
  } catch (e) {
    console.error('Error getting data')
  }
}

type Trend = 'up' | 'down' | 'neutral'

interface Stat {
  label: string
  value: string
  delta: string
  trend: Trend
}

interface WorkLearningExperience {
  id: number
  label: string
  context: string
  hours: number
}

interface StudentForm {
  id: number
  title: string
  status: 'Completed' | 'Pending' | 'Overdue'
  date: string
}

interface Question {
  id: number
  text: string
  studentScore: number
  classAvg: number
  gradeAvg: number
}

interface Assessments {
  id: number
  name: string
  score: number
  percent_score: number
  questions?: Question[]
}

const student = ref({
  name: '',
  gradeLevel: '',
  program: '',
  location: '',
  advisor: '',
  id: '',
  focusTrack: '',
  scheduleFocus: '',
})

const stats: Stat[] = [
  // { label: 'GPA', value: '3.92', delta: '+0.08 vs last term', trend: 'up' },
  // { label: 'Attendance', value: '98%', delta: '+1.5%', trend: 'up' },
  // { label: 'Total Hours', value: '27h', delta: 'Target 24h', trend: 'neutral' },
  // { label: 'Wellness Signal', value: 'Stable', delta: '-1% variance', trend: 'neutral' },
]

const workBasedLearning = ref<WorkLearningExperience[]>([])

const studentForms = ref<StudentForm[]>([])
const studentAssessments = ref<Assessments[]>([])

const scoreClass = (score: number | null | undefined) => {
  if (score === null || score === undefined) return ''
  if (score >= 90) return 'great'
  if (score >= 75) return 'good'
  return 'needs-improvement'
}

const addHoursDialog = ref(false)
const selectedCategory = ref('')
const hoursToAdd = ref(0)
const dateAdded = ref(new Date().toISOString().split('T')[0])
const commentsAdded = ref('')

const assessmentDialog = ref(false)
const selectedAssessment = ref<Assessments | null>(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Profile Charts Refs
const attendanceCanvas = ref<HTMLCanvasElement | null>(null)
const gradesCanvas = ref<HTMLCanvasElement | null>(null)
const behaviorCanvas = ref<HTMLCanvasElement | null>(null)
let attendanceChart: Chart | null = null
let gradesChart: Chart | null = null
let behaviorChart: Chart | null = null

const wblTargetHours = 54

const initials = computed(() =>
  student.value.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join(''),
)

const wblTotalHours = computed(() =>
  workBasedLearning.value.reduce((sum, experience) => sum + experience.hours, 0),
)

const wblCompletion = computed(() => {
  if (!wblTargetHours) return 0
  return Math.min(100, Math.round((wblTotalHours.value / wblTargetHours) * 100))
})

const getWblPercent = (experience: WorkLearningExperience) => {
  if (!wblTargetHours) return 0
  return Math.min(100, Math.round((experience.hours / wblTargetHours) * 100))
}

const goToForm = () => {
  router.push({ path: `/form-test/${route.params.id}` })
  // router.push({ path: '/student-form', query: { id: id.toString() } })
}

const downloadForm = (id: number) => {
  console.log(`Downloading PDF for form ${id}`)
  // Mock download logic
  // In a real implementation, this would fetch a blob or trigger a download URL
}

async function onAssessmentClick(item: Assessments) {
  selectedAssessment.value = item
  assessmentDialog.value = true
  await nextTick()
  createChart()
}

function closeAssessmentDialog() {
  assessmentDialog.value = false
  destroyChart()
}

async function getAssessmentData() {
  try {
    const { data } = await api.get('/assessment/792')
    studentAssessments.value = data.map((f: any) => ({
      id: f.id,
      name: f.name,
      score: f.student_results[0].raw_score,
      percent_score: f.student_results[0].percent_score,
    }))
  } catch (e) {
    console.error(e)
  } finally {
    // Fake entry for testing with granular data
    studentAssessments.value.push({
      id: 999,
      name: 'Unit 4: Advanced Principles',
      score: 88,
      percent_score: 88,
      questions: [
        {
          id: 1,
          text: 'Identify the primary inputs of the system.',
          studentScore: 100,
          classAvg: 85,
          gradeAvg: 82,
        },
        {
          id: 2,
          text: 'Calculate the efficiency variance.',
          studentScore: 75,
          classAvg: 78,
          gradeAvg: 74,
        },
        {
          id: 3,
          text: 'Determine the optimal routing path.',
          studentScore: 90,
          classAvg: 88,
          gradeAvg: 85,
        },
        {
          id: 4,
          text: 'Explain the impact of load balancing.',
          studentScore: 85,
          classAvg: 80,
          gradeAvg: 79,
        },
        {
          id: 5,
          text: 'Analyze the system constraints.',
          studentScore: 95,
          classAvg: 82,
          gradeAvg: 80,
        },
      ],
    })
  }
}

function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

function createChart() {
  if (!chartCanvas.value || !selectedAssessment.value) return
  destroyChart()

  const assessment = selectedAssessment.value

  // Decide if we are showing granular data or just summary
  const isGranular = assessment.questions && assessment.questions.length > 0

  let labels, datasets

  if (isGranular) {
    labels = assessment.questions!.map((q) => `Q${q.id}`)
    const studentData = assessment.questions!.map((q) => q.studentScore)
    const classData = assessment.questions!.map((q) => q.classAvg)
    const gradeData = assessment.questions!.map((q) => q.gradeAvg)

    datasets = [
      {
        label: 'Student',
        data: studentData,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        maxBarThickness: 30,
      },
      {
        label: 'Class Avg',
        data: classData,
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        maxBarThickness: 30,
      },
      {
        label: 'Grade Avg',
        data: gradeData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        maxBarThickness: 30,
      },
    ]
  } else {
    // Fallback to simple comparison if no questions
    labels = ['Student', 'Class Avg', 'Grade Avg']
    datasets = [
      {
        label: 'Score (%)',
        data: [assessment.score, 82, 76],
        backgroundColor: [
          'rgba(53, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderWidth: 1,
      },
    ]
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', display: isGranular }, // Only show legend for grouped bar
        title: { display: false },
        tooltip: {
          callbacks: {
            afterBody: (context) => {
              if (!isGranular) return []
              // Show question text in tooltip? Might be too long.
              // keeping simple for now.
              return []
            },
          },
        },
      },
      scales: {
        y: { beginAtZero: true, max: 100 },
        x: {
          grid: { display: false },
        },
      },
    },
  })
}

const termGrades = ref<any[]>([])

async function getStudentGrades() {
  try {
    const { data } = await api.get(`/gradebook/student-grades?studentId=${route.params.id}`)

    // Check if we have student data
    if (!data || !data.length) {
      termGrades.value = []
      return
    }

    const studentData = data[0]

    if (!studentData.enrollments) {
      termGrades.value = []
      return
    }

    termGrades.value = studentData.enrollments.map((enrollment: any) => {
      const courseInstance = enrollment.course_instance || {}
      const grades = enrollment.student_term_grades || []

      // Determine Q1, Q2, S1 based on tasks
      // Assuming logic:
      // Term 1 + Task 'Quarter' -> Q1
      // Term 2 + Task 'Quarter' -> Q2
      // S1 could be an average or a specific task. For now, let's leave S1 calculation to a computed or just null if not explicit.
      // Based on the mock, we want to populate these fields.

      let q1 = null
      let q2 = null
      let s1 = null
      let q3 = null
      let q4 = null

      grades.forEach((g: any) => {
        const taskName = g.task?.name
        const termId = g.task?.term_id

        if (taskName === 'Quarter') {
          if (termId === 1) q1 = g.numeric_score
          if (termId === 2) q2 = g.numeric_score
          if (termId === 3) q3 = g.numeric_score
          if (termId === 4) q4 = g.numeric_score
        }

        // Example logic for S1 if it exists as a separate task, or we could compute it
        // if (taskName === 'Semester' && termId === 1) s1 = g.numeric_score
      })

      // Rudimentary S1 calculation if not present (Avg of Q1 and Q2)
      if (s1 === null && q1 !== null) {
        if (q2 !== null) {
          s1 = Math.round((q1 + q2) / 2)
        } else {
          s1 = q1 // Temporary fallback or leave null
        }
      }

      return {
        courseName: courseInstance.alias || 'Unknown Course',
        teacher: courseInstance.instructor
          ? `${courseInstance.instructor.first_name} ${courseInstance.instructor.last_name}`
          : '',
        q1,
        q2,
        s1,
        q3,
        q4,
        final: null,
      }
    })
  } catch (err) {
    console.log(err)
  }
}

function initProfileCharts() {
  if (attendanceCanvas.value) {
    attendanceChart = new Chart(attendanceCanvas.value, {
      type: 'line',
      data: {
        labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Attendance %',
            data: [98, 97, 100, 96, 98],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 80, max: 100 } },
      },
    })
  }

  if (gradesCanvas.value) {
    gradesChart = new Chart(gradesCanvas.value, {
      type: 'bar',
      data: {
        labels: ['Math', 'Sci', 'Eng', 'Hist', 'Art'],
        datasets: [
          {
            label: 'Grade (%)',
            data: [88, 92, 85, 90, 95],
            backgroundColor: '#3b82f6',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 100 } },
      },
    })
  }

  if (behaviorCanvas.value) {
    behaviorChart = new Chart(behaviorCanvas.value, {
      type: 'bar',
      data: (() => {
        const months = []
        const counts = []
        const today = new Date()

        // Generate last 5 months
        for (let i = 4; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
          months.push(d.toLocaleDateString('en-US', { month: 'short' }))

          const match = behaviorAggregates.value.find((item: any) => {
            const itemDate = new Date(item.time_period)
            return (
              itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear()
            )
          })

          counts.push(match ? match.count : 0)
        }

        return {
          labels: months,
          datasets: [
            {
              label: 'Incidents',
              data: counts,
              backgroundColor: '#ef4444',
              borderRadius: 2,
            },
          ],
        }
      })(),
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          x: { stacked: true },
          y: {
            beginAtZero: true,
            stacked: true,
          },
        },
      },
    })
  }
}

const submitAddHours = async () => {
  try {
    console.log('IN WBL')
    await api.post('/wbl-students', {
      student_id: route.params.id,
      catagory_id: selectedCategory.value,
      hours: hoursToAdd.value,
      date: dateAdded.value,
      comments: commentsAdded.value,
    })
    addHoursDialog.value = false
    selectedCategory.value = ''
    hoursToAdd.value = 0
    dateAdded.value = new Date().toISOString().split('T')[0]
    commentsAdded.value = ''
    await getStudentWBL()
  } catch (e) {
    console.error('Error adding hours', e)
  }
}
</script>

<style src="../../styles/StudentProfile.css" scoped></style>
