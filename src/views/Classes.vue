<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8">Create Classes</h1>

    <v-alert type="info" variant="tonal" class="mb-6" density="comfortable">
      Select a program and enter a class alias. Add multiple classes to the pending list, then save
      all.
    </v-alert>

    <v-form ref="formRef" @submit.prevent="addDraft">
      <v-row>
        <v-col cols="12" md="4" lg="4">
          <v-autocomplete
            v-model="selectedProgramId"
            :items="programOptions"
            :loading="loadingPrograms"
            :item-title="programTitleFn"
            item-value="id"
            label="Program"
            placeholder="Search program"
            variant="outlined"
            clearable
            density="comfortable"
            :search="programSearch"
            @update:search="onProgramSearch"
            :rules="[(v) => !!v || 'Program required']"
          />
          <div v-if="programError" class="error-msg mt-1">
            <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon>
            {{ programError }}
            <v-btn size="x-small" variant="text" color="primary" class="ml-1" @click="initialLoad">
              Retry
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="4" lg="3">
          <v-autocomplete
            v-model="selectedCourseId"
            :items="courseOptions"
            :loading="loadingCourses"
            :item-title="courseTitleFn"
            item-value="id"
            label="Course (Code)"
            placeholder="Search course code / name"
            variant="outlined"
            clearable
            density="comfortable"
            :search="courseSearch"
            @update:search="onCourseSearch"
            :rules="[(v) => !!v || 'Course required']"
            @update:model-value="onCourseSelected"
          />
          <div v-if="courseError" class="error-msg mt-1">
            <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon>
            {{ courseError }}
            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              class="ml-1"
              @click="initialCourseLoad"
            >
              Retry
            </v-btn>
          </div>
        </v-col>
        <v-col cols="12" md="4" lg="3">
          <v-text-field
            v-model="alias"
            label="Class Alias"
            placeholder="e.g. Intro to Bio (Evening)"
            variant="outlined"
            density="comfortable"
            :rules="aliasRules"
            clearable
          />
        </v-col>
        <v-col cols="12" md="12" lg="2" class="d-flex align-end">
          <v-btn color="primary" :disabled="!canAdd" @click="addDraft" prepend-icon="mdi-plus-box">
            Add
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-divider class="my-6" />

    <v-card class="elevation-2" v-if="drafts.length">
      <v-data-table
        :headers="draftHeaders"
        :items="drafts"
        item-key="uid"
        hide-default-footer
        density="comfortable"
        class="drafts-table"
      >
        <template #item.program="{ item }">
          <div class="text-truncate">{{ item.programText }}</div>
        </template>
        <template #item.courseText="{ item }">
          <div class="text-truncate">{{ item.courseText }}</div>
        </template>
        <template #item.alias="{ item }">
          <v-text-field
            v-model="item.alias"
            variant="outlined"
            density="compact"
            hide-details
            :rules="aliasRules"
          />
        </template>
        <template #item.status="{ item }">
          <v-chip
            v-if="item.status !== 'error'"
            :color="
              item.status === 'saved' ? 'success' : item.status === 'saving' ? 'primary' : 'grey'
            "
            size="x-small"
            label
          >
            <v-progress-circular
              v-if="item.status === 'saving'"
              indeterminate
              size="12"
              width="2"
              color="primary"
              class="mr-1"
            />
            {{
              item.status === 'saved' ? 'Saved' : item.status === 'saving' ? 'Saving' : 'Pending'
            }}
          </v-chip>
          <v-chip v-else color="error" size="x-small" label>Failed</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-content-save"
            size="x-small"
            variant="text"
            color="success"
            :disabled="item.status === 'saving' || !item.alias"
            @click="saveSingle(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="x-small"
            variant="text"
            color="error"
            :disabled="item.status === 'saving'"
            @click="removeDraft(item.uid)"
          />
        </template>
        <template #no-data>
          <div class="pa-6 text-medium-emphasis text-caption">No class drafts yet.</div>
        </template>
      </v-data-table>
      <div class="d-flex justify-space-between flex-wrap pa-4">
        <div class="text-caption text-medium-emphasis">
          {{ drafts.length }} draft{{ drafts.length === 1 ? '' : 's' }}
        </div>
        <div>
          <v-btn
            color="success"
            prepend-icon="mdi-content-save-all"
            :disabled="!drafts.length || savingAny || !allAliasesValid"
            :loading="bulkSaving"
            @click="saveAll"
          >
            Save All
          </v-btn>
        </div>
      </div>
    </v-card>
    <div v-else class="text-medium-emphasis text-caption">No drafts added yet.</div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

/** Assumed backend endpoint (adjust if different) */
const CREATE_CLASSES_ENDPOINT = 'http://localhost:3000/api/courses/courses'
const COURSE_SEARCH_ENDPOINT = 'http://localhost:3000/api/courses/course-catalogs' // adjust to real endpoint

interface SchoolProgramOption {
  // program instance id (school-specific)
  id: string | number
  // underlying catalog id
  programCatalogId: string | number
  code: string
  name: string
}

interface ClassDraft {
  uid: string
  programId: string | number
  courseId: string | number // this is the course catalog id (catalog_id)
  programText: string
  courseText: string
  alias: string
  status: 'pending' | 'saving' | 'saved' | 'error'
  errorMessage?: string
}

const programOptions = ref<SchoolProgramOption[]>([])
const loadingPrograms = ref(false)
const programError = ref('')
const programSearch = ref('')
const selectedProgramId = ref<string | number | null>(null)
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
const selectedCourseId = ref<string | number | null>(null)
const alias = ref('')
const formRef = ref()

const drafts = ref<ClassDraft[]>([])
const bulkSaving = ref(false)
const snackbar = ref<{ show: boolean; message: string; color: string }>({
  show: false,
  message: '',
  color: 'success',
})

const aliasRules = [
  (v: string) => !!v || 'Alias required',
  (v: string) => (v ? v.trim().length <= 120 : true) || 'Max 120 characters',
]

const canAdd = computed(
  () => !!selectedProgramId.value && !!selectedCourseId.value && !!alias.value.trim(),
)
const allAliasesValid = computed(() => drafts.value.every((d) => !!d.alias.trim()))
const savingAny = computed(() => drafts.value.some((d) => d.status === 'saving'))

function programTitleFn(p: SchoolProgramOption) {
  return `${p.code} — ${p.name}`
}

function courseTitleFn(c: CourseItem) {
  return `${c.course_code} — ${c.course_name}`
}

async function fetchPrograms(query?: string) {
  loadingPrograms.value = true
  programError.value = ''
  try {
    // Fetch only programs attached to this school
    const base = 'http://localhost:3000/api/programs/programs'
    const url = query && query.trim() ? `${base}?q=${encodeURIComponent(query.trim())}` : base
    const { data } = await axios.get(url)
    // Expected shape from user example:
    // [{ id, programCatalogId, program_catalog_id, program_catalog: { id, code, name }, ... }]
    const raw: any[] = Array.isArray(data) ? data : data?.items || []
    programOptions.value = raw.map((p) => ({
      id: p.id, // program (school specific) id
      programCatalogId: p.program_catalog_id || p.programCatalogId,
      code: p.program_catalog?.code || p.code,
      name: p.program_catalog?.name || p.name,
    }))
  } catch (e: any) {
    programError.value = e?.message || 'Failed to load programs'
  } finally {
    loadingPrograms.value = false
  }
}

let searchTimeout: any = null
function onProgramSearch(q: string) {
  programSearch.value = q
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchPrograms(q), 350)
}

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
    const { data } = await axios.get(url)
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
  // Auto-fill alias if empty
  if (!alias.value.trim()) {
    const c = courseOptions.value.find((c) => c.id === selectedCourseId.value)
    if (c) alias.value = c.course_name
  }
}

function initialLoad() {
  fetchPrograms()
}

function addDraft() {
  if (!canAdd.value) return
  const program = programOptions.value.find((p) => p.id === selectedProgramId.value)
  if (!program) return
  const course = courseOptions.value.find((c) => c.id === selectedCourseId.value)
  if (!course) return
  // Prevent duplicate (same program + alias) pending
  if (
    drafts.value.some(
      (d) =>
        d.programId === program.id &&
        d.courseId === course.id &&
        d.alias.trim().toLowerCase() === alias.value.trim().toLowerCase(),
    )
  ) {
    snackbar.value = { show: true, message: 'Duplicate draft already added', color: 'warning' }
    return
  }
  drafts.value.push({
    uid: Math.random().toString(36).slice(2),
    programId: program.id,
    courseId: course.id,
    programText: programTitleFn(program),
    courseText: courseTitleFn(course),
    alias: alias.value.trim(),
    status: 'pending',
  })
  alias.value = ''
  selectedProgramId.value = null
  selectedCourseId.value = null
}

function removeDraft(uid: string) {
  drafts.value = drafts.value.filter((d) => d.uid !== uid)
}

async function saveSingle(draft: ClassDraft) {
  if (!draft.alias.trim()) return
  draft.status = 'saving'
  draft.errorMessage = ''
  try {
    const payload = {
      program_id: draft.programId,
      catalog_id: draft.courseId, // backend expects catalog_id (course catalog)
      alias: draft.alias.trim(),
    }
    await axios.post(CREATE_CLASSES_ENDPOINT, payload)
    draft.status = 'saved'
  } catch (e: any) {
    draft.status = 'error'
    draft.errorMessage = e?.message || 'Save failed'
  }
}

async function saveAll() {
  if (!drafts.value.length) return
  const targets = drafts.value.filter((d) => d.status === 'pending' || d.status === 'error')
  if (!targets.length) return
  bulkSaving.value = true
  // Mark all target drafts as saving
  targets.forEach((d) => {
    d.status = 'saving'
    d.errorMessage = ''
  })
  try {
    const payload = targets.map((d) => ({
      program_id: d.programId,
      catalog_id: d.courseId,
      alias: d.alias.trim(),
    }))
    // Attempt bulk create. If your backend uses a different path (e.g. /classes/bulk) adjust below.
    await axios.post(CREATE_CLASSES_ENDPOINT, payload)
    targets.forEach((d) => (d.status = 'saved'))
    snackbar.value = { show: true, message: 'All classes saved', color: 'success' }
  } catch (e: any) {
    // If bulk failed, attempt fallback per-item to salvage partial success
    try {
      for (const d of targets) {
        if (d.status === 'saved') continue
        await saveSingle(d)
      }
      if (targets.every((d) => d.status === 'saved')) {
        snackbar.value = { show: true, message: 'All classes saved', color: 'success' }
        return
      }
    } catch (_) {
      // ignore; statuses updated individually
    }
    if (targets.some((d) => d.status === 'error')) {
      snackbar.value = { show: true, message: 'Some classes failed to save', color: 'warning' }
    } else {
      snackbar.value = { show: true, message: e?.message || 'Bulk save failed', color: 'error' }
    }
  } finally {
    bulkSaving.value = false
  }
}

const draftHeaders = [
  { title: 'Program', key: 'program', sortable: true },
  { title: 'Course', key: 'courseText', sortable: true },
  { title: 'Alias', key: 'alias', sortable: false, width: 240 },
  { title: 'Status', key: 'status', sortable: false, width: 100 },
  { title: 'Actions', key: 'actions', sortable: false, width: 100 },
]

onMounted(() => {
  initialLoad()
  initialCourseLoad()
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
