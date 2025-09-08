<template>
  <v-container class="py-10">
    <h1 class="text-h5 font-weight-bold mb-6">Assign Sub-Classes to Classes</h1>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-6">{{ error }}</v-alert>

    <v-card class="mb-8 elevation-2">
      <v-card-title class="py-3 text-subtitle-1 font-weight-medium">Select Class</v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="selectedClassId"
              :items="classOptions"
              :loading="loadingClasses"
              :item-title="classTitleFn"
              item-value="id"
              label="Class"
              placeholder="Select a class"
              variant="outlined"
              clearable
              density="comfortable"
            />
          </v-col>
        </v-row>
        <div v-if="selectedClassId" class="text-medium-emphasis text-caption">
          Manage sub-classes for the selected class.
        </div>
      </v-card-text>
    </v-card>

    <v-card class="elevation-2" v-if="selectedClassId">
      <v-card-title
        class="py-3 text-subtitle-1 font-weight-medium d-flex align-center justify-space-between"
      >
        <span>Sub-Classes</span>
        <div class="d-flex align-center gap-2">
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-refresh"
            :loading="loadingSubCourses"
            @click="refreshSubCourses"
          >
            Refresh
          </v-btn>
          <v-btn
            color="primary"
            :disabled="saving || loadingSubCourses || !hasChanges"
            :loading="saving"
            prepend-icon="mdi-content-save"
            @click="saveAssignments"
          >
            Save Changes
          </v-btn>
        </div>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert v-if="hasChanges" type="info" variant="tonal" density="comfortable" class="mb-4">
          You have unsaved changes. Click "Save Changes" to apply.
        </v-alert>
        <v-row>
          <v-col cols="12" md="8">
            <v-autocomplete
              v-model="selectedSubIds"
              :items="subCourseOptions"
              :loading="loadingSubCourses"
              :item-title="subCourseTitleFn"
              item-value="id"
              label="Assign sub-classes"
              placeholder="Pick one or more sub-classes"
              variant="outlined"
              multiple
              chips
              closable-chips
              density="comfortable"
            />
            <div class="text-caption text-medium-emphasis mt-2">
              Selected: {{ selectedSubIds.length }}
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <v-list density="compact" class="elevation-1 rounded-lg">
              <v-list-subheader>Currently assigned</v-list-subheader>
              <template v-if="assignedSubsResolved.length">
                <v-list-item
                  v-for="sub in assignedSubsResolved"
                  :key="sub.id"
                  :title="subCourseTitleFn(sub)"
                  density="compact"
                >
                  <template #append>
                    <v-btn
                      size="x-small"
                      variant="text"
                      color="error"
                      icon="mdi-close"
                      @click="unassign(sub.id)"
                    />
                  </template>
                </v-list-item>
              </template>
              <v-list-item v-else title="None yet" />
            </v-list>
          </v-col>
        </v-row>
        <v-divider class="my-6" />
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import api from '../api'

interface ClassItem {
  id: string | number
  alias: string
  program: string
  course: string
  teacher: string
  course_catalog_id?: string | number
  course_code?: string
  course_name?: string
}

interface SubCourseItem {
  id: string | number
  name: string
  course_name?: string
  teacher_name?: string
}

const props = defineProps<{ active?: boolean }>()

const loadingClasses = ref(false)
const loadingSubCourses = ref(false)
const error = ref('')
const snackbar = ref<{ show: boolean; message: string; color: string }>({
  show: false,
  message: '',
  color: 'success',
})

const classOptions = ref<ClassItem[]>([])
const subCourseOptions = ref<SubCourseItem[]>([])

const selectedClassId = ref<string | number | null>(null)
const selectedSubIds = ref<Array<string | number>>([])
const originalAssignedIds = ref<Set<string | number>>(new Set())

// no url search; load full lists

function classTitleFn(c: ClassItem) {
  return `${c.alias || 'Untitled'} — ${c.course || ''}`
}
function subCourseTitleFn(s: SubCourseItem) {
  const parts = [s.name || 'Untitled', s.course_name].filter(Boolean)
  return parts.join(' — ')
}

async function fetchClasses() {
  loadingClasses.value = true
  try {
    const { data } = await api.get('/courses')
    console.log('This is the data:', data)
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.courses)
        ? (data as any).courses
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : []
    classOptions.value = raw.map((c) => {
      const user = Array.isArray(c.users) ? c.users[0] : c.users
      return {
        id: c.id,
        alias: c.alias || c.course_catalog?.course_name || 'Untitled',
        program:
          c.program?.program_catalog?.code && c.program?.program_catalog?.name
            ? `${c.program.program_catalog.code} — ${c.program.program_catalog.name}`
            : c.program_code_name || c.program?.name || '—',
        course:
          c.course_catalog?.course_code && c.course_catalog?.course_name
            ? `${c.course_catalog.course_code} — ${c.course_catalog.course_name}`
            : c.course_code_name || c.course_catalog?.course_name || '—',
        teacher: user?.name || '—',
        course_catalog_id: c.course_catalog?.id,
        course_code: c.course_catalog?.course_code,
        course_name: c.course_catalog?.course_name,
      }
    })
  } catch (e: any) {
    error.value = e?.message || 'Failed to load classes'
  } finally {
    loadingClasses.value = false
  }
}

async function fetchSubCourses() {
  loadingSubCourses.value = true
  try {
    const { data } = await api.get('/sub-courses')
    const raw: any[] = Array.isArray(data) ? data : data?.items || []
    subCourseOptions.value = raw.map((c: any) => ({
      id: c.id,
      name: c.name || c.alias || c.course_catalog?.course_name || 'Untitled',
      course_name: c.course_catalog?.course_name,
      teacher_name: (Array.isArray(c.users) ? c.users[0] : c.users)?.name,
    }))
  } catch (e: any) {
    error.value = e?.message || 'Failed to load sub-classes'
  } finally {
    loadingSubCourses.value = false
  }
}

async function fetchAssignments(classId: string | number) {
  try {
    const { data } = await api.get(`/classes/${classId}/sub-courses`)
    // The API may return either an object with sub_courses or an array of links
    const list: any[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.sub_courses)
        ? (data as any).sub_courses
        : []
    const ids = list
      .map((i: any) => i?.sub_course_id ?? i?.id ?? i?.sub_course?.id)
      .filter((v: any) => v !== undefined && v !== null)
    selectedSubIds.value = ids
    originalAssignedIds.value = new Set(ids)
  } catch {
    selectedSubIds.value = []
    originalAssignedIds.value = new Set()
  }
}

async function saveAssignments() {
  if (!selectedClassId.value) return
  try {
    saving.value = true
    const current = new Set<string | number>(selectedSubIds.value)
    const original = new Set<string | number>(originalAssignedIds.value)
    const toAdd = Array.from(current).filter((id) => !original.has(id))
    const toRemove = Array.from(original).filter((id) => !current.has(id))

    if (toAdd.length) {
      await Promise.all(
        toAdd.map((subId) =>
          api.post('/course-sub-courses', {
            course_id: selectedClassId.value,
            sub_course_id: subId,
          }),
        ),
      )
    }

    if (toRemove.length) {
      await Promise.all(
        toRemove.map((subId) =>
          api.delete('/course-sub-courses', {
            data: { course_id: selectedClassId.value, sub_course_id: subId },
          }),
        ),
      )
    }

    await fetchAssignments(selectedClassId.value)
    const parts: string[] = []
    if (toAdd.length) parts.push(`added ${toAdd.length}`)
    if (toRemove.length) parts.push(`removed ${toRemove.length}`)
    snackbar.value = {
      show: true,
      message: parts.length ? `Changes saved (${parts.join(', ')})` : 'No changes',
      color: 'success',
    }
  } catch (e: any) {
    snackbar.value = {
      show: true,
      message: e?.message || 'Failed to save assignments',
      color: 'error',
    }
  } finally {
    saving.value = false
  }
}

function unassign(id: string | number) {
  selectedSubIds.value = selectedSubIds.value.filter((x) => x !== id)
}

function refreshSubCourses() {
  fetchSubCourses()
}

const assignedSubsResolved = computed(
  () =>
    selectedSubIds.value
      .map((id) => subCourseOptions.value.find((s) => s.id === id))
      .filter(Boolean) as SubCourseItem[],
)

const saving = ref(false)

// Detect unsaved changes compared to the last fetched assignments
const hasChanges = computed(() => {
  const current = new Set(selectedSubIds.value)
  const original = originalAssignedIds.value
  if (current.size !== original.size) return true
  for (const id of current) if (!original.has(id)) return true
  return false
})

watch(selectedClassId, (id) => {
  if (id != null) fetchAssignments(id)
})

// Initial load if already active on mount
onMounted(() => {
  if (props.active !== false) {
    fetchClasses()
    fetchSubCourses()
  }
})

// Re-fetch whenever the step becomes active
watch(
  () => props.active,
  (isActive, wasActive) => {
    if (isActive && !wasActive) {
      // Freshen lists when entering step
      fetchClasses()
      fetchSubCourses()
      // Re-resolve assignments for current class if any
      if (selectedClassId.value != null) fetchAssignments(selectedClassId.value)
    }
    if (!isActive && wasActive) {
      // Optional: clear transient state so next entry is clean
      // selectedClassId.value = null
      // selectedSubIds.value = []
      // originalAssignedIds.value = new Set()
    }
  },
  { immediate: false },
)
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
