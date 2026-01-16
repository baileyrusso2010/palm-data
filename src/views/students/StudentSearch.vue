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
          <div class="search-bar">
            <v-text-field
              v-model="query"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search students by name…"
              hide-details
              density="comfortable"
              class="search-input"
            />
            <!-- <v-select
              v-model="gradeFilter"
              :items="gradeOptions"
              label="Grade"
              variant="outlined"
              hide-details
              density="comfortable"
              class="grade-select"
            /> -->
          </div>
        </v-col>
      </v-row>

      <!-- Results -->
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <template v-if="loading">
            <v-row>
              <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4">
                <v-skeleton-loader type="image, list-item-two-line" class="skeleton-card" />
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <div v-if="filteredStudents.length === 0" class="empty-state">
              <v-icon size="40" color="#94a3b8">mdi-account-search-outline</v-icon>
              <div class="empty-title">No students found</div>
              <div class="empty-subtitle">Try another name or clear the grade filter.</div>
            </div>

            <v-row v-else>
              <v-col v-for="stu in filteredStudents" :key="stu.id" cols="12" sm="6" md="4">
                <div class="student-card" @click="openProfile(stu)" role="button">
                  <div class="student-avatar">
                    {{ stu.initials }}
                  </div>
                  <div class="student-info">
                    <div class="student-name">{{ stu.firstName }} {{ stu.lastName }}</div>
                    <div class="student-meta">
                      <span class="student-id">ID #{{ stu.id }}</span>
                      <span class="dot">•</span>
                      <span class="student-grade">Grade {{ stu.grade }}</span>
                    </div>
                  </div>
                  <v-icon icon="mdi-chevron-right" size="20" class="chevron-icon"></v-icon>
                </div>
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
    qTimer = setTimeout(() => {
      debouncedQuery.value = (v || '').trim()
    }, 300)
  },
  { immediate: true },
)

watch(debouncedQuery, (newVal) => {
  getStudents(newVal)
})

onMounted(() => {
  getStudents('')
})

async function getStudents(name) {
  loading.value = true
  try {
    const res = await api.get('/students/search', {
      params: {
        q: name,
        limit: 9, // Increased limit slightly to allow some client-side grade filtering overlap
      },
    })

    const list = Array.isArray(res.data) ? res.data : Object.values(res.data)
    students.value = list.map((item) => {
      const firstName = item.first_name ?? item.firstName ?? ''
      const lastName = item.last_name ?? item.lastName ?? ''
      const fullName = `${firstName} ${lastName}`.trim()
      const initials = (firstName[0] || '') + (lastName[0] || '').toUpperCase()
      return { id: item.id, firstName, lastName, fullName, initials }
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// const gradeOptions = computed(() => {
//   // Static options since partial data might not populate all grades
//   return ['All', '9', '10', '11', '12']
// })

const filteredStudents = computed(() => {
  const gf = gradeFilter.value
  return students.value.filter((s) => {
    // Server handles text search, we just handle grade filter here
    const matchesGrade = gf === 'All' || String(s.grade) === String(gf)
    return matchesGrade
  })
})

function openProfile(stu) {
  router.push({ name: 'student-profile', params: { id: stu.id } })
}
</script>

<style scoped>
.students-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px 0;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-family: 'Inter', sans-serif;
}

.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  max-width: 600px; /* Constrain width for better aesthetic */
  margin: 0 auto; /* Center it */
}

.search-input {
  flex: 1 1 auto;
  min-width: 280px;
}

/* Enhanced Search Input Styling */
:deep(.v-field) {
  border-radius: 10px !important;
  background-color: #ffffff !important; /* Pure white background to pop against gray */
  /* distinct shadow to lift it off the page */
  box-shadow:
    0 10px 25px -5px rgba(15, 23, 42, 0.1),
    0 8px 10px -6px rgba(15, 23, 42, 0.1) !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: #cbd5e1 !important; /* default visible border */
}

:deep(.v-field:hover) {
  transform: translateY(-1px);
}

:deep(.v-field:hover .v-field__outline) {
  color: #94a3b8 !important; /* Darker on hover */
}

:deep(.v-field--focused .v-field__outline) {
  color: #3b82f6 !important; /* Tech blue focus */
  /* No extra box shadow here, rely on the main shadow + border color */
}

:deep(.v-field__input) {
  font-size: 18px !important;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #0f172a !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  min-height: 60px; /* Taller touch target */
}

:deep(.v-field__prepend-inner) {
  color: #64748b;
  opacity: 0.7;
}

:deep(.v-field--focused .v-field__prepend-inner) {
  color: #3b82f6;
  opacity: 1;
}

.grade-select {
  max-width: 180px;
  min-width: 140px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #ffffff;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-top: 16px;
}

.empty-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

.skeleton-card {
  border-radius: 4px;
}

.student-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.student-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #ffffff;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
  margin-bottom: 4px;
}

.student-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.student-meta .dot {
  font-size: 10px;
  color: #94a3b8;
}

.student-meta .student-id {
  font-weight: 600;
}

.student-meta .student-grade {
  font-weight: 600;
  color: #475569;
}

.chevron-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .search-bar {
    flex-direction: column;
  }

  .search-input,
  .grade-select {
    width: 100%;
    max-width: none;
  }
}
</style>
