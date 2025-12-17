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
          <p class="eyebrow">Focus Track</p>
          <h3>{{ student.focusTrack }}</h3>
          <p class="meta">{{ student.scheduleFocus }}</p>
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

    <section class="profile-body">
      <div class="column column-primary">
        <div class="card wbl-card">
          <header>
            <div>
              <p class="eyebrow">Work-Based Learning</p>
              <h3>Real-World Hours</h3>
              <p class="meta">Live experiences across internship, co-op, and field</p>
              <PhPlusCircle
                :size="30"
                color="#0e7a00"
                weight="duotone"
                @click="addHoursDialog = true"
              />
            </div>
            <div class="wbl-header-stats">
              <p class="hours-stat">{{ wblTotalHours }}h / {{ wblTargetHours }}h</p>
              <p class="meta">{{ wblCompletion }}% complete</p>
            </div>
          </header>
          <div class="wbl-list">
            <div v-for="experience in workBasedLearning" :key="experience.label" class="wbl-item">
              <div class="wbl-row-header">
                <div>
                  <p class="wbl-label">{{ experience.label }}</p>
                  <p class="meta">{{ experience.context }}</p>
                </div>
                <span class="wbl-hours-text">{{ experience.hours }}h</span>
              </div>
              <div class="mini-meter">
                <span :style="{ width: getWblPercent(experience) + '%' }"></span>
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
    </section>
  </div>

  <v-dialog v-model="addHoursDialog" max-width="500">
    <v-card>
      <v-card-title>Add Work-Based Learning Hours</v-card-title>
      <v-card-text>
        <v-form>
          <v-select
            v-model="selectedCategory"
            :items="[
              { value: 1, title: 'Internship' },
              { value: 2, title: 'Co-op' },
            ]"
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
    <v-card v-if="selectedAssessment">
      <v-card-title>{{ selectedAssessment.name }}</v-card-title>
      <v-card-text>
        <p class="mb-3"><strong>Latest score:</strong> {{ selectedAssessment.score }}%</p>
        <canvas ref="chartCanvas" height="260"></canvas>
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

onMounted(async () => {
  await Promise.all([getStudentDetails(), getStudentWBL(), getStudentForms(), getAssessmentData()])
})

async function getStudentForms() {
  try {
    const { data } = await api.get(`/forms/student/${route.params.id}`)
    console.log(data)
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

interface Assessments {
  id: number
  name: string
  score: number
  percent_score: number
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

const scoreClass = (score: number) => {
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

  // Fake comparison data for now; replace with real class/grade averages when available
  const labels = ['Student', 'Class Avg', 'Grade Avg']
  const data = [selectedAssessment.value.score, 82, 76]

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Score (%)',
          data,
          backgroundColor: [
            'rgba(53, 162, 235, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: ['rgba(53, 162, 235, 1)', 'rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
    },
  })
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
