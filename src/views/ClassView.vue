<template>
  <v-container class="py-8 class-admin" fluid>
    <v-breadcrumbs :items="breadcrumbs" class="px-0 mb-4" density="comfortable">
      <template #title="{ item }">
        <RouterLink v-if="item.href" :to="item.href" class="text-decoration-none">{{
          item.title
        }}</RouterLink>
        <span v-else>{{ item.title }}</span>
      </template>
    </v-breadcrumbs>

    <v-row>
      <v-col cols="12" md="4" lg="3">
        <v-card class="elevation-2 mb-6">
          <v-card-title class="text-subtitle-1 py-3">Class Summary</v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <div class="d-flex flex-column gap-3">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Program Name</div>
                <div class="text-body-1 font-weight-medium">{{ classData.alias }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Program</div>
                <div class="text-body-2">{{ classData.program }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Course</div>
                <div class="text-body-2">{{ classData.course }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Teacher</div>
                <div class="d-flex align-center gap-2">
                  <v-avatar size="32" color="primary" class="elevation-1">
                    <span class="text-body-2">{{ teacherInitials }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ classData.teacher.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ classData.teacher.email }}
                    </div>
                  </div>
                  <v-spacer />
                  <v-btn
                    icon="mdi-account-switch"
                    size="x-small"
                    variant="text"
                    @click="openChangeTeacherDialog"
                    :title="'Change teacher'"
                  />
                </div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">School Year</div>
                <div class="text-body-2">{{ classData.schoolYear }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Created</div>
                <div class="text-body-2">{{ classData.createdAt }}</div>
              </div>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-btn color="primary" variant="text" prepend-icon="mdi-pencil" @click="editDetails"
              >Edit Details</v-btn
            >
          </v-card-actions>
        </v-card>
        <!-- Files Card -->
        <v-card class="elevation-2 mb-6">
          <v-card-title class="text-subtitle-2 py-3 d-flex align-center justify-space-between">
            <span>Files</span>
            <UploadFile :classId="classId" />
            <PhPlusCircle size="32" color="blue" href="" />
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <div class="files-row d-flex gap-3">
              <div
                v-for="f in files"
                :key="f.id || f.key || f.name"
                class="d-flex flex-column align-center file-item"
              >
                <a
                  :href="f.url || f.link || `/files/${f.key || f.id || f.name}`"
                  target="_blank"
                  rel="noopener"
                  style="text-decoration: none"
                  class="w-100"
                >
                  <span v-if="fileIcon(f) === 'mdi-file-pdf-box'" class="ph-icon-wrapper">
                    <PhFile size="32" color="blue" />
                  </span>
                  <v-icon v-else :icon="fileIcon(f)" :color="fileIconColor(f)" size="28" />
                  <span
                    class="text-caption mt-1 text-truncate w-100 text-center"
                    :title="displayFileName(f)"
                    >{{ displayFileName(f) }}</span
                  >
                </a>
              </div>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-btn
              size="x-small"
              variant="text"
              prepend-icon="mdi-refresh"
              :loading="filesLoading"
              @click="fetchFiles"
              >Refresh</v-btn
            >
          </v-card-actions>
        </v-card>

        <v-card class="elevation-2">
          <v-card-title class="text-subtitle-2 py-3">Bulk Actions</v-card-title>
          <v-divider />
          <v-card-text>
            <v-btn
              block
              variant="outlined"
              size="small"
              prepend-icon="mdi-upload"
              class="mb-2"
              @click="openImportCsvDialog"
            >
              Import CSV
            </v-btn>
            <v-btn
              block
              variant="outlined"
              size="small"
              prepend-icon="mdi-cloud-upload"
              class="mb-2"
              :loading="uploadingFiles"
              @click="openUploadDialog"
            >
              Upload Files
            </v-btn>
            <v-btn block variant="outlined" size="small" prepend-icon="mdi-file-export">
              Export Roster
            </v-btn>
            <div v-if="uploadedFiles.length" class="mt-4">
              <div class="text-caption text-medium-emphasis mb-1">Recently Uploaded</div>
              <ul class="pl-4 mb-0" style="max-height: 140px; overflow: auto">
                <li v-for="f in uploadedFiles" :key="f.name" class="text-caption">
                  <v-icon size="14" color="primary" class="mr-1">mdi-file</v-icon>{{ f.name }}
                </li>
              </ul>
            </div>
            <v-alert
              v-if="uploadError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mt-4"
              >{{ uploadError }}</v-alert
            >
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8" lg="9">
        <v-card class="elevation-2">
          <v-card-title class="d-flex align-center flex-wrap py-3 gap-3">
            <div class="text-subtitle-1 mr-4">Students</div>
            <v-text-field
              v-model="studentSearch"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="Filter shown"
              prepend-inner-icon="mdi-magnify"
              class="student-search"
              style="max-width: 210px"
            />
            <v-spacer />
            <v-btn
              color="primary"
              density="comfortable"
              prepend-icon="mdi-account-multiple-plus"
              @click="openAddStudentsDialog"
              >Add Students</v-btn
            >
          </v-card-title>
          <v-divider />
          <v-progress-linear
            v-if="studentsLoading"
            indeterminate
            color="primary"
            height="2"
            class="rounded-0"
          />
          <v-alert
            v-if="studentsError"
            type="error"
            density="comfortable"
            variant="tonal"
            class="ma-4"
            >{{ studentsError }}</v-alert
          >
          <v-data-table
            :items="filteredStudents"
            :headers="studentHeaders"
            item-key="id"
            density="comfortable"
            :no-data-text="studentSearch ? 'No matches' : 'No students yet'"
            class="student-table"
            hide-default-footer
            :items-per-page="-1"
            virtual-scroll
            height="520"
          >
            <template #item.name="{ item }">
              <RouterLink
                class="d-flex align-center gap-3 py-1 text-decoration-none text-high-emphasis"
                :to="{ name: 'student-profile', params: { id: item.id } }"
              >
                <v-avatar size="32" color="secondary" class="elevation-1">
                  <span class="text-body-2">{{ initials(item.name) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium link-hover">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
                </div>
              </RouterLink>
            </template>
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'Active' ? 'success' : 'warning'"
                size="x-small"
                label
                class="text-caption font-weight-medium"
              >
                {{ item.status }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                icon="mdi-delete"
                @click="removeStudent(item.id)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Students Dialog -->
    <v-dialog v-model="addStudentsDialog" max-width="720">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1 d-flex align-center gap-3">
          <span>Add Students</span>
          <v-spacer />
          <v-text-field
            v-model="addDialogSearch"
            density="comfortable"
            variant="outlined"
            hide-details
            placeholder="Search students (2+ chars)"
            prepend-inner-icon="mdi-magnify"
            style="max-width: 260px"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <div v-if="addDialogLoading" class="pa-6 d-flex align-center justify-center">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else>
            <v-alert
              v-if="addDialogSearch.length < 2"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
              >Type at least 2 characters to search for students.</v-alert
            >
            <v-alert
              v-else-if="addDialogError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
              >{{ addDialogError }}</v-alert
            >
            <v-data-table
              v-else
              :items="addDialogResults"
              :headers="addDialogHeaders"
              item-key="id"
              class="elevation-1 add-dialog-table"
              density="comfortable"
              hide-default-footer
              :no-data-text="'No matching students'"
              :items-per-page="-1"
              height="360"
              virtual-scroll
            >
              <template #item.name="{ item }">
                <div class="d-flex flex-column py-2">
                  <span class="font-weight-medium">{{ item.name }}</span>
                  <span class="text-caption text-medium-emphasis">{{ item.email }}</span>
                </div>
              </template>
              <template #item.action="{ item }">
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  :loading="addingStudentIds.has(item.id)"
                  :disabled="addingStudentIds.has(item.id)"
                  prepend-icon="mdi-plus"
                  @click="addStudentToClass(item)"
                  >Add</v-btn
                >
              </template>
            </v-data-table>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="align-start flex-wrap">
          <v-expand-transition>
            <v-alert
              v-if="addSaveError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="me-4 mb-2 flex-grow-1"
              closable
              @click:close="addSaveError = null"
              >{{ addSaveError }}</v-alert
            >
          </v-expand-transition>
          <v-spacer />
          <v-btn variant="text" @click="addStudentsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- File Upload Dialog -->
    <v-dialog v-model="fileUploadDialog" max-width="520">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1 d-flex align-center gap-2">
          <v-icon size="18">mdi-cloud-upload</v-icon>
          <span>Upload Files</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-5">
          <v-alert type="info" variant="tonal" density="comfortable" class="mb-4">
            Select one or more PDF files to attach to this class. Each upload will include Class ID
            <strong>{{ classId }}</strong
            >.
          </v-alert>
          <v-file-input
            v-model="selectedFiles"
            label="Choose PDF files"
            multiple
            accept="application/pdf,.pdf"
            show-size
            counter
            variant="outlined"
            density="comfortable"
            prepend-icon="mdi-file-pdf-box"
            :disabled="uploadingFiles"
            hide-details
          />
          <v-alert
            v-if="uploadError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mt-4"
            >{{ uploadError }}</v-alert
          >
          <div v-if="uploadedFiles.length" class="mt-4">
            <div class="text-caption text-medium-emphasis mb-1">Recent Uploads</div>
            <v-table density="comfortable" class="elevation-1">
              <thead>
                <tr>
                  <th class="text-left">File</th>
                  <th class="text-left" style="width: 120px">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in uploadedFiles.slice(0, 6)" :key="f.name">
                  <td class="text-caption">
                    <v-icon size="14" class="mr-1" color="primary">mdi-file</v-icon>{{ f.name }}
                  </td>
                  <td class="text-caption">
                    <v-chip
                      v-if="f.status !== 'error'"
                      :color="f.status === 'uploaded' ? 'success' : 'grey'"
                      size="x-small"
                      label
                      class="text-caption"
                      >{{ f.status }}</v-chip
                    >
                    <v-icon v-else size="16" color="error">mdi-alert-circle</v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="uploadingFiles" @click="fileUploadDialog = false"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!selectedFiles || !selectedFiles.length || uploadingFiles"
            :loading="uploadingFiles"
            @click="startUpload"
            prepend-icon="mdi-upload"
            >Upload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Teacher Dialog -->
    <v-dialog v-model="changeTeacherDialog" max-width="480">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Change Teacher</v-card-title>
        <v-divider />
        <v-card-text>
          <v-autocomplete
            v-model="selectedTeacherId"
            :items="teacherOptions"
            item-title="name"
            item-value="id"
            label="Teacher"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="changeTeacherDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="applyTeacherChange" :disabled="!selectedTeacherId"
            >Apply</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="showAddSuccess"
      color="success"
      timeout="3000"
      location="bottom end"
      elevation="2"
    >
      {{ addSuccessMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PhFile, PhPlusCircle } from '@phosphor-icons/vue'
import UploadFile from '@/components/UploadFile.vue'
import api from '../api'

// API route: localhost:3000/api/courses/coures/:id (keeping typo 'coures' per user message)
// Data shape example provided by user.

const route = useRoute()
const classId = computed(() => route.params.id ?? '1')

interface ApiTeacher {
  id: number
  email: string
  name: string
  role: string
  school_id: number
  district_id: number
  createdAt: string
  updatedAt: string
}
interface ApiProgramCatalog {
  code: string
  name: string
}
interface ApiProgram {
  id: number
  program_catalog: ApiProgramCatalog
}
interface ApiCourseCatalog {
  course_code: string
  course_name: string
  course_description: string | null
}
interface ApiCourseResponse {
  id: number
  program_id: number
  catalog_id: number
  teacher_id: number
  school_id: number
  alias: string
  school_year: string | null
  course_catalog: ApiCourseCatalog
  users: ApiTeacher | ApiTeacher[]
  program: ApiProgram
}

interface TeacherDisplay {
  id: number
  name: string
  email: string
}
interface Student {
  id: number
  name: string
  email: string
  status: 'Active' | 'Pending'
}

interface SearchStudentOption {
  id: number
  name: string
  email: string
}

interface ClassFile {
  id?: number | string
  key?: string
  name?: string
  originalName?: string
  [k: string]: any
}

const loading = ref(false)
const loadError = ref<string | null>(null)
const classData = ref({
  id: '',
  alias: '',
  program: '',
  course: '',
  teacher: { id: 0, name: '', email: '' } as TeacherDisplay,
  schoolYear: '',
  createdAt: '',
})

const files = ref<ClassFile[]>([])
const filesLoading = ref(false)

// Students roster
const students = ref<Student[]>([])
const studentsLoading = ref(false)
const studentsError = ref<string | null>(null)

// Add Students dialog state
const addStudentsDialog = ref(false)
const addDialogSearch = ref('')
const addDialogResults = ref<SearchStudentOption[]>([])
const addDialogLoading = ref(false)
const addDialogError = ref<string | null>(null)
let addDialogDebounce: any = null
const addDialogHeaders = [
  { title: 'Student', key: 'name', sortable: false },
  { title: '', key: 'action', width: 100, sortable: false },
]
const addingStudentIds = ref<Set<number>>(new Set())

// Feedback state for adding students
const addSaveError = ref<string | null>(null)
const showAddSuccess = ref(false)

// --- File upload (PDF) state & handlers ---
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingFiles = ref(false)
const uploadedFiles = ref<{ name: string; size: number; status: 'uploaded' | 'error' }[]>([])
const uploadError = ref<string | null>(null)
const fileUploadDialog = ref(false)
const selectedFiles = ref<File[] | null>(null)

function openUploadDialog() {
  selectedFiles.value = null
  uploadError.value = null
  fileUploadDialog.value = true
}

async function startUpload() {
  if (!selectedFiles.value || !selectedFiles.value.length) return
  await uploadSelectedFiles(selectedFiles.value)
  // keep dialog open to show results; optionally auto-close on success
}

function triggerFilePicker() {
  uploadError.value = null
  fileInputRef.value?.click()
}

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files.length) return
  const files = Array.from(input.files)
  await uploadSelectedFiles(files)
  // Reset input so selecting same files again re-triggers change
  input.value = ''
}

async function uploadSelectedFiles(files: File[]) {
  uploadingFiles.value = true
  uploadError.value = null
  try {
    for (const f of files) {
      const form = new FormData()
      form.append('file', f)
      form.append('classId', String(classId.value))
      try {
        const res = await api.post(`/classes/${classId.value}/files`, form)
        uploadedFiles.value.unshift({ name: f.name, size: f.size, status: 'uploaded' })
      } catch (err: any) {
        uploadedFiles.value.unshift({ name: f.name, size: f.size, status: 'error' })
        uploadError.value = err.message || 'One or more files failed to upload'
      }
    }
  } finally {
    uploadingFiles.value = false
  }
}

// Map CSV import button to existing Add Students dialog (placeholder until real CSV import logic)
function openImportCsvDialog() {
  openAddStudentsDialog()
}
const addSuccessMessage = ref('')

interface ApiStudent {
  id: number
  firstName: string
  lastName: string
  email: string
}

async function fetchStudents() {
  studentsLoading.value = true
  studentsError.value = null
  try {
    // Assumed endpoint pattern based on user sample: students/classes/:id/students
    const res = await api.get(`/classes/${classId.value}/students`)
    if (!res.data) throw new Error(`Students request failed: ${res.status}`)
    const data: ApiStudent[] = res.data
    students.value = data.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`.trim(),
      email: s.email,
      status: 'Active', // Default until status provided by API
    }))
  } catch (e: any) {
    studentsError.value = e.message || 'Failed to load students'
  } finally {
    studentsLoading.value = false
  }
}

function searchAddDialog(q: string) {
  if (q.length < 2) {
    addDialogResults.value = []
    addDialogLoading.value = false
    addDialogError.value = null
    return
  }
  addDialogLoading.value = true
  addDialogError.value = null
  api
    .get(`/students?name=${encodeURIComponent(q)}`)
    .then((r) => {
      const data: ApiStudent[] = r.data
      const existingIds = new Set(students.value.map((s) => s.id))
      addDialogResults.value = data
        .map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim(), email: s.email }))
        .filter((o) => !existingIds.has(o.id))
    })
    .catch((e) => {
      addDialogError.value = e.message || 'Search failed'
      addDialogResults.value = []
    })
    .finally(() => (addDialogLoading.value = false))
}

watch(
  addDialogSearch,
  (val) => {
    clearTimeout(addDialogDebounce)
    addDialogDebounce = setTimeout(() => searchAddDialog(val.trim()), 350)
  },
  { flush: 'post' },
)

async function fetchClass() {
  loading.value = true
  loadError.value = null
  try {
    const res = await api.get(`/courses/${classId.value}`)
    if (!res.data) throw new Error(`Request failed: ${res.status}`)
    const data: ApiCourseResponse = res.data
    // Users field may be a single teacher object in provided sample.
    const teacher = Array.isArray(data.users) ? data.users[0] : data.users
    classData.value = {
      id: String(data.id),
      alias: data.alias || data.course_catalog?.course_name || 'Untitled Class',
      program: data.program?.program_catalog?.name
        ? `${data.program.program_catalog.code} — ${data.program.program_catalog.name}`
        : '',
      course: data.course_catalog
        ? `${data.course_catalog.course_code} — ${data.course_catalog.course_name}`
        : '',
      teacher: teacher
        ? { id: teacher.id, name: teacher.name, email: teacher.email }
        : { id: 0, name: 'Unknown', email: '' },
      schoolYear: data.school_year || '—',
      createdAt: new Date(teacher?.createdAt || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load class'
  } finally {
    loading.value = false
  }
}

async function fetchFiles() {
  filesLoading.value = true
  try {
    const res = await api.get(`/classes/${classId.value}/files`)
    if (!res.data) throw new Error(`Files request failed: ${res.status}`)
    const data = res.data
    // Expecting shape { files: [...] }
    const list = Array.isArray(data?.files) ? data.files : []
    files.value = list.map((f: any) => {
      const key = f.key || f.name || ''
      const parts = key.split('-')
      return { ...f, key: parts[parts.length - 1] }
    })
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load files'
  } finally {
    filesLoading.value = false
  }
}

function displayFileName(f: any) {
  return f.originalName || f.name || f.key || 'file'
}
function fileExt(f: any) {
  const name = (f.originalName || f.name || f.key || '').toLowerCase()
  const m = name.match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}
function fileIcon(f: any) {
  switch (fileExt(f)) {
    case 'pdf':
      return 'mdi-file-pdf-box'
    case 'doc':
    case 'docx':
      return 'mdi-file-word-box'
    case 'xls':
    case 'xlsx':
      return 'mdi-file-excel-box'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'mdi-file-image'
    case 'csv':
      return 'mdi-file-delimited'
    case 'zip':
    case 'rar':
      return 'mdi-archive'
    default:
      return 'mdi-file'
  }
}
function fileIconColor(f: any) {
  switch (fileExt(f)) {
    case 'pdf':
      return 'red'
    case 'doc':
    case 'docx':
      return 'blue'
    case 'xls':
    case 'xlsx':
      return 'green'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'deep-purple'
    case 'csv':
      return 'teal'
    case 'zip':
    case 'rar':
      return 'orange'
    default:
      return 'primary'
  }
}

onMounted(() => {
  fetchClass()
  fetchStudents()
  fetchFiles()
})
watch(classId, () => {
  fetchClass()
  fetchStudents()
})

const studentHeaders = [
  { title: 'Student', key: 'name', sortable: true },
  { title: 'Status', key: 'status', sortable: true, width: 110 },
  { title: '', key: 'actions', width: 60 },
]

const studentSearch = ref('')
const filteredStudents = computed(() => {
  if (!studentSearch.value.trim()) return students.value
  const q = studentSearch.value.toLowerCase()
  return students.value.filter(
    (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
  )
})

// Add students dialog helpers
function openAddStudentsDialog() {
  addDialogSearch.value = ''
  addDialogResults.value = []
  addStudentsDialog.value = true
  addSaveError.value = null
}

function addStudentToClass(item: SearchStudentOption) {
  if (addingStudentIds.value.has(item.id)) return
  addSaveError.value = null
  addingStudentIds.value.add(item.id)
  addingStudentIds.value = new Set(addingStudentIds.value)
  api
    .post(`/enrollments`, {
      classId: classId.value,
      studentId: item.id,
    })
    .then((r) => {
      if (r.status < 200 || r.status >= 300) {
        return Promise.reject(new Error(`HTTP ${r.status}`))
      }
      return r.data
    })
    .then(() => {
      const exists = students.value.some((s) => s.id === item.id)
      if (!exists)
        students.value.push({ id: item.id, name: item.name, email: item.email, status: 'Active' })
      addDialogResults.value = addDialogResults.value.filter((r) => r.id !== item.id)
      addSuccessMessage.value = 'Student added'
      showAddSuccess.value = true
    })
    .catch((e) => {
      addSaveError.value = e.message || 'Failed to add student'
    })
    .finally(() => {
      addingStudentIds.value.delete(item.id)
      addingStudentIds.value = new Set(addingStudentIds.value)
    })
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

const teacherInitials = computed(() => initials(classData.value.teacher.name || ''))

// (Removed old single-student add form logic)
function removeStudent(id: number) {
  students.value = students.value.filter((s) => s.id !== id)
}

// Change Teacher (local)
const changeTeacherDialog = ref(false)
const selectedTeacherId = ref<number | string | null>(null)
// Static teacher options until API endpoint for teachers is integrated.
const teacherOptions = ref<TeacherDisplay[]>([
  { id: 1, name: 'Bailey Russo', email: 'baileyrusso3371@gmail.com' },
  { id: 2, name: 'Sample Teacher', email: 'sample.teacher@example.com' },
])
function openChangeTeacherDialog() {
  selectedTeacherId.value = classData.value.teacher.id
  changeTeacherDialog.value = true
}
function applyTeacherChange() {
  if (!selectedTeacherId.value) return
  const t = teacherOptions.value.find((t) => t.id === selectedTeacherId.value)
  if (t) classData.value.teacher = t
  changeTeacherDialog.value = false
}

function editDetails() {
  // Placeholder for future edit functionality
}

const breadcrumbs = computed(() => [
  { title: 'Classes', href: '/classes' },
  { title: loading.value ? 'Loading…' : classData.value.alias || 'Class' },
])
</script>

<!-- (removed stray dummy template) -->

<style scoped>
.class-admin .v-card-title {
  font-weight: 600;
}
.student-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.student-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.files-row {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
.files-row::-webkit-scrollbar {
  height: 6px;
}
.files-row::-webkit-scrollbar-track {
  background: transparent;
}
.files-row::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.file-item {
  width: 72px;
  flex: 0 0 auto;
}
.file-item .text-truncate {
  max-width: 100%;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
