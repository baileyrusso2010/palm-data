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
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  await getStudentDetails()
  await getStudentWBL()
  await getStudentForms()
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

interface Skill {
  label: string
  pulse: string
  level: number
}

interface WorkLearningExperience {
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
  { label: 'GPA', value: '3.92', delta: '+0.08 vs last term', trend: 'up' },
  { label: 'Attendance', value: '98%', delta: '+1.5%', trend: 'up' },
  { label: 'Total Hours', value: '27h', delta: 'Target 24h', trend: 'neutral' },
  { label: 'Wellness Signal', value: 'Stable', delta: '-1% variance', trend: 'neutral' },
]

const workBasedLearning = ref<WorkLearningExperience[]>([])

const studentForms = ref<StudentForm[]>([])

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
</script>

<style scoped>
:global(body) {
  background-color: #ffffff;
}

.profile-page {
  min-height: 100vh;
  padding: 2.5rem clamp(1.5rem, 4vw, 5rem) 3rem;
  background:
    radial-gradient(circle at top, rgba(0, 123, 255, 0.03), transparent 45%),
    radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.02), transparent 35%), #f8f9fa;
  color: #1a1a1a;
  font-family:
    'Inter',
    'SF Pro Display',
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.profile-page h1,
.profile-page h3 {
  margin: 0;
  font-weight: 500;
}

.profile-page h1 {
  font-size: clamp(2.25rem, 3.5vw, 3rem);
}

.profile-page h3 {
  font-size: 1.25rem;
}

.card {
  border-radius: 1.25rem;
  padding: 1.75rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(26, 26, 26, 0.6);
  margin-bottom: 0.35rem;
}

.meta {
  color: rgba(26, 26, 26, 0.6);
  font-size: 0.85rem;
}

.profile-hero {
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.profile-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(0, 123, 255, 0.08), rgba(0, 188, 212, 0.04));
  pointer-events: none;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.identity {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 1rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #ffffff;
}

.signal {
  padding-left: 1rem;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1.25rem;
  margin-top: 1.75rem;
  position: relative;
  z-index: 1;
}

.stat {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-value {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 1.5rem;
  font-weight: 500;
}

.stat-value small {
  font-size: 0.8rem;
}

.stat-value small.up {
  color: #28a745;
}

.stat-value small.down {
  color: #dc3545;
}

.profile-body {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.info-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.info-block ul,
.insights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-block li,
.insights li {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.info-block li:last-child,
.insights li:last-child {
  border-bottom: none;
}

.focus header,
.timeline header,
.insights header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.focus-list {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.wbl-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.wbl-header-stats {
  text-align: right;
}

.hours-stat {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.wbl-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wbl-item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.wbl-row-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.wbl-label {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
  color: #1a1a1a;
}

.wbl-hours-text {
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
}

.mini-meter {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-top: 6px;
}

.mini-meter span {
  display: block;
  height: 100%;
  background: #007bff;
  border-radius: 999px;
}

.focus-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  gap: 0.75rem 1.5rem;
  align-items: center;
}

.meter {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745);
}

.meter-value {
  justify-self: end;
  font-size: 0.85rem;
  color: rgba(26, 26, 26, 0.75);
}

.timeline ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.timeline li:last-child {
  border-bottom: none;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  position: relative;
}

.dot.complete {
  background: #28a745;
}

.dot.active {
  background: #007bff;
  box-shadow: 0 0 12px rgba(0, 123, 255, 0.4);
}

.dot.upcoming {
  background: rgba(26, 26, 26, 0.4);
}

.timeline-title {
  font-weight: 500;
}

.insights ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 960px) {
  .profile-body {
    grid-template-columns: 1fr;
  }

  .identity {
    flex-direction: column;
    align-items: flex-start;
  }

  .signal {
    border-left: none;
    padding-left: 0;
  }
}

.form-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.form-info.clickable {
  cursor: pointer;
  flex: 1;
}

.form-info.clickable:hover .form-title {
  color: #007bff;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.form-title {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.completed {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.15);
  color: #b58900;
}

.status-badge.overdue {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}
</style>
