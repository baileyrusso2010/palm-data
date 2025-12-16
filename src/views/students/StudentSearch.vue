<template>
  <div class="students-page">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>Students</h1>
    </header>

    <v-container class="py-6" fluid>
      <!-- Search + Filters -->
      <v-row justify="center" class="mb-6">
        <v-col cols="12" md="10" lg="8">
          <v-card-text class="pa-4 d-flex flex-wrap align-center gap-3">
            <v-text-field
              v-model="query"
              variant="solo"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search students by name…"
              hide-details
              class="flex-1-1"
            />
            <v-select
              v-model="gradeFilter"
              :items="gradeOptions"
              label="Grade"
              variant="solo"
              hide-details
              class="max-w-180"
            />
          </v-card-text>
        </v-col>
      </v-row>

      <!-- Results -->
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <template v-if="loading">
            <v-row>
              <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4">
                <v-skeleton-loader type="image, list-item-two-line" class="rounded-xl" />
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <div v-if="filteredStudents.length === 0" class="empty-state">
              <v-icon size="40" color="grey">mdi-account-search-outline</v-icon>
              <div class="text-subtitle-1 mt-2">No students found</div>
              <div class="text-body-2 text-medium-emphasis">
                Try another name or clear the grade filter.
              </div>
            </div>

            <v-row v-else>
              <v-col v-for="stu in filteredStudents" :key="stu.id" cols="12" sm="6" md="4">
                <v-card
                  elevation="2"
                  rounded="xl"
                  class="h-100"
                  @click="openProfile(stu)"
                  role="button"
                >
                  <v-card-text class="student-card pa-5 d-flex align-start">
                    <v-avatar size="64" color="primary" class="elevation-1 student-avatar">
                      <span>{{ stu.initials }}</span>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="name-line">{{ stu.firstName }} {{ stu.lastName }}</div>
                      <div class="meta-line">
                        <span class="id">ID #{{ stu.id }}</span>
                        <span class="dot">•</span>
                        <span class="grade-text">Grade {{ stu.grade }}</span>
                      </div>
                    </div>
                    <v-btn icon="mdi-chevron-right" variant="text" color="primary" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const loading = ref(true)
const students = ref([])
const query = ref('')
const debouncedQuery = ref('')
const gradeFilter = ref('All')

// Debounce the query for smoother UX
let qTimer
watch(
  () => query.value,
  (v) => {
    clearTimeout(qTimer)
    qTimer = setTimeout(() => (debouncedQuery.value = (v || '').trim().toLowerCase()), 200)
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    const res = await api.get('/students')
    const list = Array.isArray(res.data) ? res.data : Object.values(res.data)
    students.value = list.map((item) => {
      const firstName = item.first_name ?? item.firstName ?? ''
      const lastName = item.last_name ?? item.lastName ?? ''
      const grade = item.grade ?? item.class_grade ?? ''
      const fullName = `${firstName} ${lastName}`.trim()
      const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
      return { id: item.id, firstName, lastName, fullName, grade, initials }
    })
  } finally {
    loading.value = false
  }
})

const gradeOptions = computed(() => {
  const grades = Array.from(new Set(students.value.map((s) => s.grade).filter(Boolean))).sort(
    (a, b) => Number(a) - Number(b),
  )
  return ['All', ...grades]
})

const filteredStudents = computed(() => {
  const q = debouncedQuery.value
  const gf = gradeFilter.value
  return students.value.filter((s) => {
    const matchesText = !q || s.fullName.toLowerCase().includes(q)
    const matchesGrade = gf === 'All' || String(s.grade) === String(gf)
    return matchesText && matchesGrade
  })
})

function openProfile(stu) {
  router.push({ name: 'student-profile', params: { id: stu.id } })
}
</script>

<style scoped>
.students-page {
  background: #fafafa;
  min-height: 100vh;
}
.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #222b45;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 16px;
  background: #fff;
}
.gap-3 {
  gap: 12px;
}
.max-w-180 {
  max-width: 180px;
}
.flex-1-1 {
  flex: 1 1 auto;
  min-width: 220px;
}

.student-card {
  gap: 16px;
}

.student-avatar {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.name-line {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  margin-bottom: 6px;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.4;
}

.meta-line .dot {
  font-size: 0.8rem;
  color: #9ca3af;
}

.meta-line .id {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.meta-line .grade-text {
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.1px;
}
</style>
