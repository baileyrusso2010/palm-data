<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>Student Profile</h1>
    </header>

    <v-container class="py-6" fluid>
      <template v-if="loading">
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-skeleton-loader type="card" class="rounded-xl" />
          </v-col>
        </v-row>
        <v-row justify="center" class="mb-10">
          <v-col cols="12" md="10" lg="8">
            <v-skeleton-loader type="card" class="rounded-xl" />
          </v-col>
        </v-row>
      </template>

      <template v-else-if="student">
        <v-row justify="center" class="mb-6">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="2" rounded="xl">
              <v-card-text class="pa-6 d-flex align-center gap-16 flex-wrap">
                <v-avatar size="96" class="elevation-2">
                  <img :src="student.avatarUrl" :alt="student.fullName" />
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="text-h5 font-weight-bold">{{ student.fullName }}</div>
                  <div class="text-subtitle-2 text-medium-emphasis mt-1">
                    ID #{{ student.id }} • Grade {{ student.grade }}
                  </div>
                  <div class="d-flex align-center flex-wrap gap-3 mt-4">
                    <v-chip color="primary" variant="flat" size="small"
                      >Homeroom {{ student.homeroom }}</v-chip
                    >
                    <v-chip color="grey" variant="tonal" size="small"
                      >Cohort {{ student.cohort }}</v-chip
                    >
                  </div>
                </div>

                <!-- Simple attendance widget -->
                <div class="attendance-box">
                  <div class="text-subtitle-1 font-weight-600 mb-2">Attendance (Today)</div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      :color="attendance.status === 'present' ? 'success' : 'grey'"
                      variant="flat"
                      size="small"
                      @click="markAttendance('present')"
                      >Present</v-btn
                    >
                    <v-btn
                      :color="attendance.status === 'absent' ? 'error' : 'grey'"
                      variant="flat"
                      size="small"
                      @click="markAttendance('absent')"
                      >Absent</v-btn
                    >
                  </div>
                  <div class="text-caption text-medium-emphasis mt-2">
                    {{ todayLabel }} • Present this month: {{ attendance.monthPresent }}/{{
                      attendance.monthDays
                    }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row justify="center" class="mb-10">
          <v-col cols="12" md="10" lg="8">
            <v-card elevation="2" rounded="xl">
              <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-subtitle-1 font-weight-600"
                  >Forms for {{ student.firstName }}</span
                >
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="mdi-folder-search"
                  @click="goAssignForms"
                >
                  Manage Assignments
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text class="pt-0">
                <v-list lines="two">
                  <v-list-item
                    v-for="f in forms"
                    :key="f.id"
                    :title="f.title"
                    :subtitle="f.description"
                    @click="openForm(f)"
                  >
                    <template #prepend>
                      <v-avatar size="32" color="primary" variant="tonal">
                        <v-icon color="primary">{{ f.icon }}</v-icon>
                      </v-avatar>
                    </template>
                    <template #append>
                      <v-chip
                        :color="f.status === 'Completed' ? 'success' : 'grey'"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ f.status }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                <div class="text-caption text-medium-emphasis mt-2">
                  {{ forms.length }} form{{ forms.length === 1 ? '' : 's' }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const idParam = Number(route.params.id ?? 1)

  // Fetch student data
  const studentRes = await api.get(`/students/${idParam}`)
  const item = studentRes.data
  student.value = {
    id: item.id,
    firstName: item.first_name ?? item.firstName ?? '',
    lastName: item.last_name ?? item.lastName ?? '',
    get fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    grade: item.grade ?? item.class_grade ?? '',
    homeroom: item.homeroom ?? 'Unknown',
    cohort: item.cohort ?? 'Unknown',
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent((item.first_name ?? item.firstName ?? '') + ' ' + (item.last_name ?? item.lastName ?? ''))}&backgroundType=gradientLinear&fontFamily=Helvetica`,
  }

  // Fetch forms for this student
  const form_list = await api.get(`/forms/student/${student.value.id}`)
  Object.values(form_list.data).forEach((item) => {
    forms.value.push({
      id: item.id,
      title: item.name,
      description: item.description,
      route: { path: `/grading/${student.value.id}` }, // Adjust based on form type if needed
      icon: 'mdi-file-document-outline',
      status: 'Pending', // Could be fetched from assignments API
    })
  })

  loading.value = false
})

const loading = ref(true)
const student = ref(null)

const today = new Date()
const ymKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const storageKey = computed(() => `att:${student.value?.id ?? 0}:${ymKey}`)

function readAttendance() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { days: {}, status: null }
    return JSON.parse(raw)
  } catch {
    return { days: {}, status: null }
  }
}

const attendance = reactive({
  status: readAttendance().status ?? null,
  days: readAttendance().days ?? {},
  get monthPresent() {
    return Object.values(this.days).filter((s) => s === 'present').length
  },
  get monthDays() {
    return (
      Object.keys(this.days).length ||
      new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    )
  },
})

const todayKey = computed(
  () =>
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
)
const todayLabel = computed(() => new Date().toLocaleDateString())

function persistAttendance() {
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify({ status: attendance.status, days: attendance.days }),
    )
  } catch {}
}

function markAttendance(status) {
  attendance.status = status
  attendance.days[todayKey.value] = status
  persistAttendance()
}

// Forms ref to be filled via API
const forms = ref([])

function openForm(f) {
  router.push(f.route)
}

function goAssignForms() {
  router.push({ path: '/student-form' })
}
</script>

<style scoped>
.profile-page {
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
.gap-16 {
  gap: 16px;
}
.attendance-box {
  min-width: 260px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
}
</style>
