<template>
  <div class="class-view">
    <section class="hero">
      <v-container class="py-8">
        <div class="hero-card">
          <div class="hero-main">
            <div class="hero-title-area">
              <div>
                <p class="eyebrow">Class Intelligence • {{ classProfile.term }}</p>
                <h1>{{ classProfile.name }}</h1>
                <p class="subtitle">
                  {{ classProfile.track }} • {{ classProfile.period }} • {{ classProfile.location }}
                </p>
              </div>
            </div>
          </div>
          <div class="hero-details">
            <div class="detail-item">
              <p class="detail-label">Instructor</p>
              <p class="detail-value">{{ classProfile.teacher.name }}</p>
              <p class="detail-subvalue">{{ classProfile.teacher.email }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">Program Codes</p>
              <p class="detail-value">CIP {{ classProfile.cipCode }}</p>
              <p class="detail-subvalue">SCED {{ classProfile.scedCode }}</p>
            </div>
            <div class="detail-item">
              <p class="detail-label">Support Contact</p>
              <p class="detail-value">{{ classProfile.teacher.support }}</p>
              <p class="detail-subvalue">{{ classProfile.teacher.phone }}</p>
            </div>
          </div>
          <div class="hero-metrics">
            <div v-for="metric in classMetrics" :key="metric.label" class="metric-card">
              <p class="metric-label">{{ metric.label }}</p>
              <p class="metric-value">{{ metric.value }}</p>
              <p class="metric-trend" :class="metric.trendClass">
                <v-icon size="18" class="mr-1">{{ metric.icon }}</v-icon>
                {{ metric.trend }}
              </p>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <v-container class="py-10 content" fluid>
      <v-row dense class="main-grid">
        <v-col cols="12">
          <v-card class="glass-card mb-6" rounded="xl">
            <v-card-title class="card-title card-title-row">
              <span>Students</span>
              <span class="highlight-text"> {{ students.length }} students </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-data-table
                :headers="studentHeaders"
                :items="filteredStudents"
                :items-per-page="-1"
                class="custom-table scrollable-table"
                density="comfortable"
                fixed-header
                height="420"
                hide-default-footer
              >
                <template #item.name="{ item }">
                  <div class="student-pill">
                    <v-avatar size="36" color="primary" class="mr-3">
                      <span>{{ item.initials }}</span>
                    </v-avatar>
                    <div>
                      <div class="student-name">{{ item.name }}</div>
                      <div class="student-meta">{{ item.email }}</div>
                    </div>
                  </div>
                </template>
                <template #item.gradePulse="{ item }">
                  <div class="grading-pulse">
                    <span class="">{{ formatScore(item.gradePulse.score) }}</span>
                  </div>
                </template>
                <template #item.status="{ item }">
                  <v-chip :color="statusColor(item.status)" variant="tonal" size="small">
                    {{ item.status }}
                  </v-chip>
                </template>
                <template #item.actions>
                  <v-btn icon variant="text" density="compact">
                    <v-icon size="20">mdi-eye</v-icon>
                  </v-btn>
                  <v-btn icon variant="text" density="compact">
                    <v-icon size="20">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'

const isLoading = ref(false)
const classProfile = ref({
  name: '',
  track: 'STEM Academy Core',
  term: 'Fall 2025',
  period: 'Block 2',
  location: 'Monroe Campus — North Tower',
  room: '204A',
  cipCode: '27.0101',
  scedCode: '02052',
  schedule: { day: 'Mon / Wed / Fri', time: '09:05 – 10:20' },
  description:
    'Advanced algebra curriculum with emphasis on modeling, data interpretation, and collaborative problem solving. Designed for accelerated students preparing for Regents and collegiate coursework.',
  teacher: {
    name: 'Samantha Smith',
    email: 'samantha.smith@palm.edu',
    phone: '(585) 555-1034',
    support: 'Academic Director: Jordan Patel',
  },
})

const students = ref([])
onMounted(async () => {
  isLoading.value = true

  try {
    const response = await api.get('/course-instances/21')

    let data = response.data

    classProfile.value = {
      ...classProfile.value,
      name: data?.alias ?? classProfile.value.name,
      cipCode: data?.course_catalog?.course_code ?? classProfile.value.cipCode,
      scedCode: data?.program_catalog?.state_program_code ?? classProfile.value.scedCode,
      location: data?.cte_school?.name ?? classProfile.value.location,
    }

    let enrollments = response.data.enrollments

    enrollments.forEach((element) => {
      students.value.push({
        id: element.student.id,
        name: `${element.student.first_name} ${element.student.last_name}`,
        email: `${element.student.first_name[0]}${element.student.last_name}@school.com`,
        grade: element.student.grade,
        status: 'active',
        gradePulse: { score: 94 },
      })
    })

    if (Array.isArray(data?.students) && data.students.length) {
      students.value = data.students
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

const classMetrics = ref([
  {
    label: 'Enrollment',
    value: '28 / 30',
    trend: '+2 since last term',
    icon: 'mdi-arrow-up',
    trendClass: 'positive',
  },
  {
    label: 'Median Grade',
    value: '91%',
    trend: '+3 pts week-over-week',
    icon: 'mdi-chart-line',
    trendClass: 'positive',
  },
  {
    label: 'Attendance',
    value: '96.4%',
    trend: 'stable',
    icon: 'mdi-progress-check',
    trendClass: 'neutral',
  },
  {
    label: 'Interventions',
    value: '3 open',
    trend: '1 resolved today',
    icon: 'mdi-alert-circle',
    trendClass: 'warning',
  },
])

const searchTerm = ref('')

const defaultGradePulse = {
  score: null,
  deltaPoints: 0,
  percentile: null,
  trend: 'holding steady',
  trendDirection: 'flat',
  signal: 'stable',
}

const normalizeGradePulse = (gradePulse) => ({
  score: gradePulse?.score ?? defaultGradePulse.score,
  deltaPoints: gradePulse?.deltaPoints ?? defaultGradePulse.deltaPoints,
  percentile: gradePulse?.percentile ?? defaultGradePulse.percentile,
  trend: gradePulse?.trend ?? defaultGradePulse.trend,
  trendDirection: gradePulse?.trendDirection ?? defaultGradePulse.trendDirection,
  signal: gradePulse?.signal ?? defaultGradePulse.signal,
})

const studentHeaders = [
  { title: 'Student', value: 'name' },
  { title: 'ID', value: 'id' },
  { title: 'Grade Level', value: 'grade' },
  { title: 'Grade', value: 'gradePulse' },
  { title: 'Status', value: 'status' },
  { title: '', value: 'actions', sortable: false },
]

const studentsWithInitials = computed(() =>
  students.value.map((student) => ({
    ...student,
    initials: student.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    gradePulse: normalizeGradePulse(student.gradePulse),
  })),
)

const filteredStudents = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return studentsWithInitials.value
  return studentsWithInitials.value.filter(
    (student) =>
      student.name.toLowerCase().includes(term) || student.id.toLowerCase().includes(term),
  )
})

const statusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Monitored':
      return 'warning'
    default:
      return 'grey'
  }
}

const signalColor = (signal) => {
  switch (signal) {
    case 'stable':
      return 'success'
    case 'watch':
      return 'warning'
    case 'at-risk':
      return 'error'
    default:
      return 'grey'
  }
}

const signalLabel = (signal) => {
  switch (signal) {
    case 'stable':
      return 'On Track'
    case 'watch':
      return 'Monitor'
    case 'at-risk':
      return 'Needs Support'
    default:
      return 'Unknown'
  }
}

const formatScore = (score) => {
  if (score === null || score === undefined || score === '') return '—'
  return `${score}%`
}

const formatDeltaPoints = (points) => {
  if (points === null || points === undefined || points === '') return '—'
  const num = Number(points)
  if (Number.isNaN(num)) return '—'
  const prefix = num > 0 ? '+' : ''
  return `${prefix}${num} pts`
}

const formatPercentile = (pct) => {
  if (pct === null || pct === undefined || pct === '') return '—'
  return `P${pct}`
}

const deltaClass = (points) => {
  const num = Number(points)
  if (Number.isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'positive' : 'negative'
}

const trendIcon = (direction) => {
  switch (direction) {
    case 'up':
      return 'mdi-trending-up'
    case 'down':
      return 'mdi-trending-down'
    default:
      return 'mdi-trending-neutral'
  }
}

const trendClass = (direction) => {
  switch (direction) {
    case 'up':
      return 'positive'
    case 'down':
      return 'negative'
    default:
      return 'neutral'
  }
}
</script>

<style scoped>
:global(body) {
  font-family:
    'Inter',
    'Segoe UI',
    'Montserrat',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.class-view {
  background: #f6f8fb;
  min-height: 100vh;
  color: #0f1b33;
}

.hero {
  padding-top: 48px;
  background: linear-gradient(180deg, #ffffff 0%, #eef4ff 100%);
}

.hero-card {
  background: #ffffff;
  border: 1px solid rgba(15, 27, 51, 0.08);
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(15, 27, 51, 0.12);
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-title-area {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 0.75rem;
  color: rgba(15, 27, 51, 0.55);
  margin-bottom: 12px;
}

.hero h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0;
  color: #0f1b33;
}

.subtitle {
  color: rgba(15, 27, 51, 0.65);
  margin-top: 8px;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-chip {
  font-weight: 600;
  color: #0f1b33;
}

.hero-metrics {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.metric-card {
  background: rgba(15, 27, 51, 0.04);
  border-radius: 20px;
  padding: 16px 20px;
  border: 1px solid rgba(15, 27, 51, 0.05);
}

.metric-label {
  font-size: 0.85rem;
  color: rgba(15, 27, 51, 0.55);
  margin: 0 0 8px;
}

.metric-value {
  font-size: 1.6rem;
  margin: 0;
  color: #0f1b33;
}

.metric-trend {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  margin-top: 6px;
}

.metric-trend.positive {
  color: #178754;
}
.metric-trend.warning {
  color: #b57400;
}
.metric-trend.neutral {
  color: rgba(15, 27, 51, 0.55);
}

.content {
  margin-top: 16px;
}

.main-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(15, 27, 51, 0.08);
  box-shadow: 0 25px 60px rgba(8, 16, 31, 0.1);
  color: #0f1b33;
}

.card-title {
  font-weight: 700;
  font-size: 1.15rem;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.grading-pulse {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pulse-core {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pulse-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f1b33;
}

.pulse-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(15, 27, 51, 0.5);
}

.pulse-chip {
  font-weight: 600;
  letter-spacing: 0.03em;
}

.pulse-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 8px;
}

.pulse-stat {
  padding: 6px 8px;
  border-radius: 10px;
  background: rgba(15, 27, 51, 0.03);
  border: 1px solid rgba(15, 27, 51, 0.05);
}

.pulse-stat-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15, 27, 51, 0.55);
  margin-bottom: 4px;
}

.pulse-stat-value {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.pulse-stat-value.trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.positive {
  color: #178754;
}

.negative {
  color: #c0392b;
}

.neutral {
  color: rgba(15, 27, 51, 0.65);
}

.description {
  font-size: 1rem;
  color: #2f3f5c;
  margin-bottom: 8px;
}

.hero-details {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.detail-item {
  padding: 16px 18px;
  border: 1px solid rgba(15, 27, 51, 0.08);
  border-radius: 18px;
  background: rgba(15, 27, 51, 0.02);
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15, 27, 51, 0.6);
  margin-bottom: 6px;
}

.detail-value {
  margin: 0;
  font-weight: 600;
  color: #0f1b33;
}

.detail-subvalue {
  margin: 4px 0 0;
  color: #526480;
  font-size: 0.9rem;
}

.highlight-text {
  font-weight: 600;
  color: #1f2c4d;
}

.custom-table :deep(thead th) {
  color: #5a6c88;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.custom-table :deep(tbody tr) {
  transition: background 0.15s ease;
}

.custom-table :deep(tbody tr:hover) {
  background: rgba(34, 139, 230, 0.04);
}

.scrollable-table :deep(.v-table__wrapper) {
  max-height: 420px;
  overflow-y: auto;
}

.student-pill {
  display: flex;
  align-items: center;
}

.student-pill span {
  font-weight: 700;
}

.student-name {
  font-weight: 600;
  color: #11182a;
}

.student-meta {
  font-size: 0.85rem;
  color: #5a6c88;
}

@media (max-width: 960px) {
  .hero-card {
    padding: 24px;
  }
  .hero-actions {
    width: 100%;
  }
}
</style>
