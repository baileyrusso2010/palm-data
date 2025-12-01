<template>
  <div class="assign-page">
    <v-container class="py-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-h5 font-weight-600">Assign Forms</div>
          <div class="text-body-2 text-medium-emphasis">
            Select one or more forms and assign them to students.
          </div>
        </div>
        <v-btn
          color="primary"
          :disabled="selectedFormIds.length === 0 || selectedStudentIds.length === 0"
          prepend-icon="mdi-send"
          @click="assignForms"
        >
          Assign {{ selectedFormIds.length }} form<span v-if="selectedFormIds.length !== 1">s</span>
          to {{ selectedStudentIds.length }} student<span v-if="selectedStudentIds.length !== 1"
            >s</span
          >
        </v-btn>
      </div>

      <v-row>
        <!-- Forms panel -->
        <v-col cols="12" lg="7">
          <v-card elevation="1" rounded="lg" class="fixed-height-card">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Forms</span>
              <v-checkbox
                :model-value="allFormsSelected"
                :indeterminate="someFormsSelected"
                label="Select all"
                density="compact"
                hide-details
                @update:modelValue="toggleSelectAllForms"
              />
            </v-card-title>
            <v-divider />
            <v-card-text class="pt-0 flex-column flex-grow-1 d-flex">
              <div class="panel-scroll">
                <v-virtual-scroll :items="forms" height="500" item-height="48">
                  <template #default="{ item }">
                    <v-list-item
                      :key="item.id"
                      :title="item.title"
                      :subtitle="item.description"
                      :class="{ 'row-selected': isFormSelected(item.id) }"
                      @click="toggleForm(item.id, !isFormSelected(item.id))"
                    >
                      <template #prepend>
                        <v-checkbox
                          :model-value="isFormSelected(item.id)"
                          density="compact"
                          hide-details
                          @click.stop
                          @update:modelValue="(val) => toggleForm(item.id, val)"
                        />
                      </template>
                      <template #append>
                        <div class="text-caption text-medium-emphasis">
                          Updated {{ formatDate(item.updatedAt) }}
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-virtual-scroll>
              </div>

              <div class="d-flex align-center justify-space-between mt-2">
                <div class="text-caption text-medium-emphasis">
                  {{ forms.length }} form<span v-if="forms.length !== 1">s</span> • Selected:
                  {{ selectedFormIds.length }}
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    size="small"
                    variant="text"
                    @click="clearFormSelection"
                    :disabled="selectedFormIds.length === 0"
                    >Clear</v-btn
                  >
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Students panel -->
        <v-col cols="12" lg="5">
          <v-card elevation="1" rounded="lg" class="fixed-height-card">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Students</span>
              <v-checkbox
                :model-value="selectedStudentIds.length === students.length && students.length > 0"
                :indeterminate="
                  selectedStudentIds.length > 0 && selectedStudentIds.length < students.length
                "
                label="Select all"
                density="compact"
                hide-details
                @update:modelValue="
                  (val) => (selectedStudentIds = val ? students.map((s) => s.id) : [])
                "
              />
            </v-card-title>
            <v-divider />
            <v-card-text class="pt-0 flex-column flex-grow-1 d-flex">
              <div class="panel-scroll">
                <v-list class="py-0">
                  <v-list-item
                    v-for="stu in students"
                    :key="stu.id"
                    :title="stu.fullName"
                    :class="studentRowClass(stu.id)"
                    @click="toggleStudent(stu.id, !isStudentSelected(stu.id))"
                  >
                    <template #prepend>
                      <v-checkbox
                        :model-value="isStudentSelected(stu.id)"
                        density="compact"
                        hide-details
                        @click.stop
                        @update:modelValue="(val) => toggleStudent(stu.id, val)"
                      />
                    </template>
                    <template #append>
                      <v-tooltip
                        v-if="selectedFormIds.length && studentHasAnySelected(stu.id) > 0"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-chip v-bind="props" size="x-small" label variant="tonal" color="grey">
                            Has {{ studentHasAnySelected(stu.id) }}/{{ selectedFormIds.length }}
                          </v-chip>
                        </template>
                        <div class="text-caption">
                          Already has:
                          <ul class="ma-0 pa-0">
                            <li v-for="t in studentHasSelectedTitles(stu.id)" :key="t">{{ t }}</li>
                          </ul>
                        </div>
                      </v-tooltip>
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <div class="d-flex align-center justify-space-between mt-2">
                <div class="text-caption text-medium-emphasis">
                  {{ students.length }} student<span v-if="students.length !== 1">s</span> •
                  Selected: {{ selectedStudentIds.length }}
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  @click="selectedStudentIds = []"
                  :disabled="selectedStudentIds.length === 0"
                >
                  Clear
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar.open" :timeout="2000" color="success">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import api from '@/api'
import { ref, computed, onMounted } from 'vue'

onMounted(async () => {
  const list_students = await api.get('/students')

  Object.values(list_students.data).forEach((item) => {
    students.value.push({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      grade: item.grade,
    })
  })

  students.value = students.value.map((s) => ({
    ...s,
    fullName: `${s.firstName} ${s.lastName} (Gr ${s.grade})`,
  }))

  const getData = await api.get('/student/:studentId')

  // Object.values(form_list.data).forEach((item) => {
  //   forms.value.push({
  //     id: item.id,
  //     title: item.name,
  //     description: item.description,
  //     updatedAt: item.updated_at,
  //   })
  // })
})

// Fake data: forms
const forms = ref([])

// Fake data: students
const students = ref([])

// Fake existing assignments (studentId -> formId)
const existingAssignments = ref([
  { studentId: 1, formId: 101 },
  { studentId: 2, formId: 103 },
  { studentId: 3, formId: 101 },
  { studentId: 3, formId: 103 },
  { studentId: 4, formId: 104 },
])

// UI state
const selectedFormIds = ref([])
const selectedStudentIds = ref([])

// Derived
const allFormsSelected = computed(
  () => forms.value.length > 0 && selectedFormIds.value.length === forms.value.length,
)
const someFormsSelected = computed(
  () => selectedFormIds.value.length > 0 && !allFormsSelected.value,
)

// Maps for quick lookup of existing assignments
const formById = computed(() => Object.fromEntries(forms.value.map((f) => [f.id, f])))
const assignedMap = computed(() => {
  const m = new Map()
  for (const a of existingAssignments.value) {
    if (!m.has(a.studentId)) m.set(a.studentId, new Set())
    m.get(a.studentId).add(a.formId)
  }
  return m
})
const selectedFormsSet = computed(() => new Set(selectedFormIds.value))

// Helpers
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return ''
  }
}

// Selection actions
function toggleSelectAllForms(val) {
  if (val) {
    selectedFormIds.value = forms.value.map((f) => f.id)
  } else {
    selectedFormIds.value = []
  }
}
function isFormSelected(id) {
  return selectedFormIds.value.includes(id)
}
function toggleForm(id, val) {
  const set = new Set(selectedFormIds.value)
  if (val) set.add(id)
  else set.delete(id)
  selectedFormIds.value = Array.from(set)
}
function clearFormSelection() {
  selectedFormIds.value = []
}

// Students selection helpers
function isStudentSelected(id) {
  return selectedStudentIds.value.includes(id)
}
function toggleStudent(id, val) {
  const set = new Set(selectedStudentIds.value)
  if (val) set.add(id)
  else set.delete(id)
  selectedStudentIds.value = Array.from(set)
}

// Existing assignment helpers
function studentHasAnySelected(studentId) {
  const set = assignedMap.value.get(studentId)
  if (!set || selectedFormsSet.value.size === 0) return 0
  let count = 0
  for (const id of selectedFormsSet.value) if (set.has(id)) count++
  return count
}
function studentHasSelectedTitles(studentId) {
  const set = assignedMap.value.get(studentId)
  if (!set) return []
  const titles = []
  for (const id of selectedFormsSet.value) {
    if (set.has(id)) titles.push(formById.value[id]?.title || String(id))
  }
  return titles
}
function studentRowClass(id) {
  const classes = { 'row-selected': isStudentSelected(id) }
  if (selectedFormIds.value.length > 0 && studentHasAnySelected(id) > 0) {
    classes['row-has-existing'] = true
  }
  return classes
}

// Assign action (fake)
const snackbar = ref({ open: false, message: '' })
async function assignForms() {
  const payload = []
  for (const studentId of selectedStudentIds.value) {
    for (const formId of selectedFormIds.value) {
      payload.push({ studentId, formId, assignedAt: new Date().toISOString() })
    }
  }
  // Simulate API
  const response = await api.post('/forms/assign', payload)
  console.log(response)
  snackbar.value = {
    open: true,
    message: `Assigned ${selectedFormIds.value.length} form(s) to ${selectedStudentIds.value.length} student(s).`,
  }
  // Optional: clear selections after assign
  // clearFormSelection(); selectedStudentIds.value = []
}
</script>

<style scoped>
.assign-page {
  background: #fafafa;
  min-height: 100vh;
}
.fixed-height-card {
  display: flex;
  flex-direction: column;
  height: 70vh; /* consistent panel height */
}
.panel-scroll {
  flex: 1 1 auto;
  min-height: 0; /* IMPORTANT so flex container can shrink and scroll works */
  overflow-y: hidden;
  overflow-x: hidden;
  padding-right: 4px;
  scrollbar-width: thin;
}
.panel-scroll::-webkit-scrollbar {
  width: 8px;
}
.panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.panel-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
.max-w-320 {
  max-width: 320px;
}
.forms-table :deep(thead th) {
  font-weight: 600;
}
.preview-box {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  background: white;
}
.gap-2 {
  gap: 8px;
}
.font-weight-600 {
  font-weight: 600;
}

.row-selected {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
}

/* Subtle left stripe when student already has any selected form(s) */
.row-has-existing {
  box-shadow: inset 3px 0 0 rgba(0, 0, 0, 0.18);
}
</style>
