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

  <div class="text-center pa-8">
    <v-btn color="primary" size="large" @click="openCategoryDialog">
      Set Up Grading Categories
    </v-btn>

    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon left color="primary">mdi-tune</v-icon>
          Set Up Grading Categories & Weights
        </v-card-title>

        <v-card-text class="pt-6">
          <p class="text-body-1 text-medium-emphasis mb-6">
            Most teachers use this setup — just adjust if needed:
          </p>

          <!-- Category Inputs (Set #1 pre-filled) -->
          <div v-for="(cat, index) in categories" :key="index" class="category-row mb-5">
            <div class="category-name flex-grow-1">
              <div v-if="editingIndex === index">
                <v-text-field
                  v-model="cat.name"
                  label="Category Name"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  autofocus
                  @blur="stopEditingCategory"
                  @keyup.enter.prevent="stopEditingCategory"
                  @keydown.esc.prevent="stopEditingCategory"
                ></v-text-field>
              </div>
              <div
                v-else
                class="category-name-display"
                role="button"
                tabindex="0"
                @click="startEditingCategory(index)"
                @keyup.enter.prevent="startEditingCategory(index)"
                @keyup.space.prevent="startEditingCategory(index)"
              >
                <span class="category-name-text">{{ cat.name }}</span>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="startEditingCategory(index)"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="category-weight">
              <v-text-field
                v-model.number="cat.weight"
                label="Weight"
                type="number"
                suffix="%"
                min="0"
                max="100"
                step="1"
                variant="outlined"
                density="comfortable"
                hide-details
                class="category-weight-input"
              ></v-text-field>

              <v-btn
                v-if="categories.length > 1"
                icon="mdi-delete"
                color="error"
                variant="text"
                @click="removeCategory(index)"
              ></v-btn>
            </div>
          </div>

          <!-- Add New Category
          <v-btn variant="text" color="primary" prepend-icon="mdi-plus" @click="addCategory">
            Add Category
          </v-btn> -->

          <v-divider class="my-6"></v-divider>

          <!-- Total Weight Display -->
          <div class="d-flex justify-space-between align-center">
            <span class="text-h6">Total Weight</span>
            <span
              class="text-h5 font-weight-bold"
              :class="totalWeight === 100 ? 'text-success' : 'text-error'"
            >
              {{ totalWeight }}%
            </span>
          </div>

          <v-alert
            v-if="totalWeight !== 100"
            type="warning"
            variant="tonal"
            class="mt-4"
            text="Weights must add up to exactly 100% to save."
          ></v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            size="large"
            :disabled="totalWeight !== 100"
            @click="saveCategories"
          >
            Save & Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import { useRoute } from 'vue-router'

const route = useRoute()
const dialog = ref(false)
const editingIndex = ref(null)
const needsSetup = ref(false)

const isLoading = ref(false)
const categories = ref([])
const totalWeight = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.weight || 0), 0)
})

const openCategoryDialog = () => {
  dialog.value = true
  editingIndex.value = null
}

const closeDialog = () => {
  if (editingIndex.value !== null) {
    stopEditingCategory()
  }
  dialog.value = false
}

const startEditingCategory = (index) => {
  if (editingIndex.value !== null && editingIndex.value !== index) {
    stopEditingCategory()
  }

  editingIndex.value = index
}

const stopEditingCategory = () => {
  if (editingIndex.value === null) return

  const activeCategory = categories.value[editingIndex.value]
  if (activeCategory && typeof activeCategory.name === 'string' && !activeCategory.name.trim()) {
    activeCategory.name = 'New Category'
  }

  editingIndex.value = null
}

const addCategory = () => {
  categories.value.push({ name: 'New Category', weight: 0 })
  editingIndex.value = categories.value.length - 1
}

const removeCategory = (index) => {
  categories.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value -= 1
  }
}

const saveCategories = async () => {
  try {
    if (totalWeight.value === 100) {
      const payload = {
        course_id: route.params.id,
        categories: categories.value,
      }
      let response = null
      if (needsSetup.value == true) {
        response = await api.post('/gradebook', payload)
        needsSetup.value = false
        let cat = response.data.data

        categories.value = []
        cat.forEach((item) => {
          categories.value.push({
            id: item.id,
            name: item.name,
            weight: Math.round(item.weight), // Cast decimal to integer
          })
        })
      } else response = await api.patch('/gradebook', payload)
    }
    closeDialog()
  } catch (err) {
    //put snackbar
    console.error(err)
  }
}

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
    const course_id = route.params.id
    const response = await api.get(`/course-instances/${course_id}`)

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

    //put in promise all

    let gradebook_data = await api.get(`/gradebook/${course_id}`)

    //no grades in gradebook
    needsSetup.value = gradebook_data.data.needsSetup

    let g_book = gradebook_data.data.data

    if (needsSetup.value == false) {
      g_book.forEach((item) => {
        categories.value.push({
          id: item.id,
          name: item.name,
          weight: Math.round(item.weight), // Cast decimal to integer
        })
      })
    } else {
      categories.value.push(
        { name: 'Homework / Classwork', weight: 20 },
        { name: 'Quizzes', weight: 20 },
        { name: 'Tests / Exams', weight: 40 },
        { name: 'Final Exam', weight: 20 },
      )
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

<style src="@/styles/ClassView.css"></style>
