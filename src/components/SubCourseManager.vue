<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8">Create Sub-Classes</h1>

    <v-alert type="info" variant="tonal" class="mb-6" density="comfortable">
      Select a program and enter a class alias. Add multiple classes to the pending list, then save
      all.
    </v-alert>

    <!-- Add Single Class -->
    <v-card class="mb-8 elevation-2">
      <v-card-title class="py-3 text-subtitle-1 font-weight-medium">Add Class</v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="selectedCourseId"
              :items="courseOptions"
              :loading="loadingCourses"
              :item-title="courseTitleFn"
              item-value="id"
              label="Course"
              placeholder="Search course code / name"
              variant="outlined"
              clearable
              density="comfortable"
              :search="courseSearch"
              @update:search="onCourseSearch"
              @update:model-value="onCourseSelected"
              :rules="[requiredIdRule]"
            />
            <div v-if="courseError" class="error-msg mt-1">
              <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon
              >{{ courseError }}
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                class="ml-1"
                @click="initialCourseLoad"
                >Retry</v-btn
              >
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="selectedTeacherId"
              :items="teacherOptions"
              :loading="loadingTeachers"
              :item-title="teacherTitleFn"
              item-value="id"
              label="Teacher"
              placeholder="Search teacher"
              variant="outlined"
              clearable
              density="comfortable"
              :search="teacherSearch"
              @update:search="onTeacherSearch"
              :rules="[requiredIdRule]"
            />
            <div v-if="teacherError" class="error-msg mt-1">
              <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon
              >{{ teacherError }}
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                class="ml-1"
                @click="initialTeacherLoad"
                >Retry</v-btn
              >
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="alias"
              label="Alias"
              placeholder="Auto-fills from course"
              variant="outlined"
              density="comfortable"
              :rules="aliasRules"
              clearable
            />
          </v-col>
        </v-row>
        <div class="d-flex gap-2">
          <v-btn
            color="primary"
            :disabled="!canSave"
            :loading="adding"
            prepend-icon="mdi-content-save"
            @click="addClass"
            >Add Class</v-btn
          >
          <v-btn variant="text" color="default" @click="resetForm" :disabled="adding">Clear</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Existing Classes -->
    <v-card class="elevation-2">
      <v-card-title
        class="py-3 text-subtitle-1 font-weight-medium d-flex align-center justify-space-between"
      >
        <span>Existing Classes</span>
        <v-btn
          size="small"
          icon="mdi-refresh"
          variant="text"
          @click="fetchClasses"
          :loading="loadingClassesList"
        />
      </v-card-title>
      <v-divider />
      <v-data-table
        :headers="classHeaders"
        :items="classes"
        item-key="id"
        :loading="loadingClassesList"
        density="comfortable"
        class="drafts-table"
        :no-data-text="loadingClassesList ? 'Loading...' : 'No classes yet'"
        hide-default-footer
      >
        <template #item.program="{ item }">
          <div class="text-truncate">{{ item.program }}</div>
        </template>
        <template #item.course="{ item }">
          <div class="text-truncate">{{ item.course }}</div>
        </template>
        <template #item.teacher="{ item }">
          <div class="text-truncate">{{ item.teacher }}</div>
        </template>
        <template #item.alias="{ item }">
          <div class="text-truncate">{{ item.alias }}</div>
        </template>
        <template #item.school_year="{ item }">
          <div class="text-truncate">{{ item.school_year || '—' }}</div>
        </template>
        <template #item.created_at="{ item }">
          <span class="text-caption">{{ item.created_at }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

/** Assumed backend endpoint (adjust if different) */
const CREATE_CLASSES_ENDPOINT = '/sub-courses'
const COURSE_SEARCH_ENDPOINT = '/course-catalogs' // adjust to real endpoint

// Simplified single-add flow
interface ExistingClass {
  id: string | number
  program: string
  course: string
  teacher: string
  alias: string
  school_year?: string
  created_at?: string
}

// Form selections
const selectedCourseId = ref<string | number | null>(null)
const selectedTeacherId = ref<string | number | null>(null)
const alias = ref('')
// Course search state
interface CourseItem {
  id: string | number
  course_code: string
  course_name: string
  course_description: string
}
const courseOptions = ref<CourseItem[]>([])
const loadingCourses = ref(false)
const courseError = ref('')
const courseSearch = ref('')
// Teacher search state
interface TeacherItem {
  id: string | number
  name: string
  email: string
}
const teacherOptions = ref<TeacherItem[]>([])
const loadingTeachers = ref(false)
const teacherError = ref('')
const teacherSearch = ref('')
const formRef = ref()
const adding = ref(false)
const classes = ref<ExistingClass[]>([])
const loadingClassesList = ref(false)
const snackbar = ref<{ show: boolean; message: string; color: string }>({
  show: false,
  message: '',
  color: 'success',
})

const aliasRules = [
  (v: string) => !!v || 'Alias required',
  (v: string) => (v ? v.trim().length <= 120 : true) || 'Max 120 characters',
]

// Treat 0 as valid
const requiredIdRule = (v: any) => (v !== null && v !== undefined && v !== '') || 'Required'
const canSave = computed(
  () => selectedCourseId.value !== null && selectedTeacherId.value !== null && !!alias.value.trim(),
)

function courseTitleFn(c: CourseItem) {
  return `${c.course_code} — ${c.course_name}`
}

function teacherTitleFn(t: TeacherItem) {
  return `${t.name} — ${t.email}`
}

let searchTimeout: any = null

let courseSearchTimeout: any = null
function onCourseSearch(q: string) {
  courseSearch.value = q
  if (courseSearchTimeout) clearTimeout(courseSearchTimeout)
  courseSearchTimeout = setTimeout(() => fetchCourses(q), 350)
}

async function fetchCourses(query?: string) {
  loadingCourses.value = true
  courseError.value = ''
  try {
    const base = COURSE_SEARCH_ENDPOINT
    const url = query && query.trim() ? `${base}?q=${encodeURIComponent(query.trim())}` : base
    const { data } = await api.get(url)
    const raw: any[] = Array.isArray(data) ? data : data?.items || []
    courseOptions.value = raw.map((c) => ({
      id: c.id,
      course_code: c.course_code,
      course_name: c.course_name,
      course_description: c.course_description,
    }))
  } catch (e: any) {
    courseError.value = e?.message || 'Failed to load courses'
  } finally {
    loadingCourses.value = false
  }
}

function initialCourseLoad() {
  fetchCourses()
}

function onCourseSelected() {
  if (!alias.value.trim()) {
    const c = courseOptions.value.find((c) => c.id === selectedCourseId.value)
    if (c) alias.value = c.course_name
  }
}

let teacherSearchTimeout: any = null
function onTeacherSearch(q: string) {
  teacherSearch.value = q
  if (teacherSearchTimeout) clearTimeout(teacherSearchTimeout)
  teacherSearchTimeout = setTimeout(() => fetchTeachers(q), 350)
}

async function fetchTeachers(query?: string) {
  loadingTeachers.value = true
  teacherError.value = ''
  try {
    const base = '/teachers'
    const url = query && query.trim() ? `${base}?q=${encodeURIComponent(query.trim())}` : base
    const { data } = await api.get(url)
    const raw: any[] = Array.isArray(data) ? data : data?.items || []
    teacherOptions.value = raw.map((t) => ({ id: t.id, name: t.name, email: t.email }))
  } catch (e: any) {
    teacherError.value = e?.message || 'Failed to load teachers'
  } finally {
    loadingTeachers.value = false
  }
}

function initialTeacherLoad() {
  fetchTeachers()
}

async function addClass() {
  if (!canSave.value) return
  adding.value = true
  try {
    const payload = {
      catalog_id: selectedCourseId.value,
      teacher_id: selectedTeacherId.value,
      name: alias.value.trim(),
      // school_id: 1, //Fix later
    }
    await api.post(CREATE_CLASSES_ENDPOINT, payload)
    snackbar.value = { show: true, message: 'Class saved', color: 'success' }
    resetForm()
    await fetchClasses()
  } catch (e: any) {
    snackbar.value = { show: true, message: e?.message || 'Save failed', color: 'error' }
  } finally {
    adding.value = false
  }
}

function resetForm() {
  selectedCourseId.value = null
  selectedTeacherId.value = null
  alias.value = ''
}

async function fetchClasses() {
  loadingClassesList.value = true
  try {
    const { data } = await api.get('/sub-courses')
    // Map API data to ExistingClass[]
    classes.value = (Array.isArray(data) ? data : data?.items || []).map((c: any) => ({
      id: c.id,
      course: c.course_catalog.course_name || '',
      teacher: c.users.name || '',
      alias: c.name || '',
      school_year: c.school_year || '',
      created_at: c.created_at || '',
    }))
    console.log(data)
  } catch (e: any) {
    console.log(e)
    snackbar.value = { show: true, message: e?.message || 'Failed to load classes', color: 'error' }
  } finally {
    loadingClassesList.value = false
  }
}

const classHeaders = [
  { title: 'Course', key: 'course', sortable: true },
  { title: 'Alias', key: 'alias', sortable: true },
  { title: 'Teacher', key: 'teacher', sortable: true },
  { title: 'School Year', key: 'school_year', sortable: true },
  // { title: 'Created', key: 'created_at', sortable: true },
]

onMounted(() => {
  initialCourseLoad()
  initialTeacherLoad()
  fetchClasses()
})
</script>

<style scoped>
.error-msg {
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  color: #dc2626;
}
.drafts-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.drafts-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc;
}
</style>
