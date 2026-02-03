<template>
  <v-layout class="fill-height bg-grey-lighten-5">
    <!-- Left Sidebar: Student List -->
    <v-navigation-drawer permanent width="320" class="border-e bg-white" elevation="0">
      <!-- Header -->
      <div class="px-4 py-4 border-b bg-grey-lighten-5">
        <h2 class="text-h6 font-weight-bold text-grey-darken-3">Students</h2>
      </div>

      <!-- Student Queue -->
      <v-list v-if="students.length > 0" class="pa-2 bg-transparent">
        <v-list-item
          v-for="(student, index) in students"
          :key="student.id"
          :active="selectedStudentId === student.id"
          @click="selectStudent(student.id)"
          lines="two"
          rounded="lg"
          class="mb-1"
          :class="{
            'bg-blue-lighten-5 text-primary': selectedStudentId === student.id,
            'text-grey-darken-2': selectedStudentId !== student.id,
          }"
        >
          <template v-slot:prepend>
            <v-avatar
              :color="selectedStudentId === student.id ? 'primary' : 'grey-lighten-3'"
              class="font-weight-bold"
              :class="selectedStudentId === student.id ? 'text-white' : 'text-grey-darken-3'"
              size="40"
            >
              {{ getInitials(student) }}
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold ml-2">
            {{ student.first_name }} {{ student.last_name }}
          </v-list-item-title>

          <v-list-item-subtitle class="d-flex align-center mt-1 ml-2">
            <v-chip
              size="x-small"
              :color="getStatusColor(student.id)"
              :text-color="
                getStatusColor(student.id).includes('lighten') ? 'grey-darken-4' : 'white'
              "
              variant="flat"
              class="font-weight-bold px-2"
            >
              <v-icon start size="10" class="mr-1">{{ getStatusIcon(student.id) }}</v-icon>
              {{ getStatusText(student.id) }}
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div v-else class="d-flex flex-column align-center justify-center pt-12 text-grey">
        <v-icon size="48" class="mb-2 text-grey-lighten-2">mdi-account-off</v-icon>
        <div class="text-body-2">No students found</div>
      </div>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="d-flex flex-column h-100 overflow-hidden bg-grey-lighten-4 position-relative">
      <div
        v-if="!selectedStudentId"
        class="d-flex flex-column align-center justify-center fill-height text-grey-darken-1"
      >
        <v-icon size="80" class="mb-6 text-grey-lighten-2">mdi-clipboard-check-outline</v-icon>
        <h2 class="text-h5 font-weight-light">
          Select a student from the sidebar to begin grading
        </h2>
      </div>

      <template v-else>
        <!-- Top Sticky Header -->
        <div
          class="bg-white px-6 py-4 border-b d-flex align-center justify-space-between flex-shrink-0 sticky-header elevation-1"
          style="z-index: 10"
        >
          <div class="d-flex align-center">
            <v-avatar color="primary-lighten-4" class="text-primary mr-4" size="48">
              <span class="text-h6 font-weight-bold">{{ getInitials(selectedStudent) }}</span>
            </v-avatar>
            <div>
              <h1 class="text-h6 font-weight-bold text-grey-darken-3">
                {{ selectedStudent?.first_name }} {{ selectedStudent?.last_name }}
              </h1>
              <div class="text-caption text-grey-darken-1 d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-card-account-details-outline</v-icon>
                ID: {{ selectedStudent?.student_id }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center gap-4">
            <v-chip v-if="hasChanges" color="warning" variant="tonal" size="small" class="mr-4">
              <v-icon start size="14">mdi-circle-edit-outline</v-icon>
              Unsaved Changes
            </v-chip>

            <v-divider vertical class="mx-2 h-50"></v-divider>

            <v-switch
              v-model="isCurrentStudentCompleted"
              color="success"
              label="Completed"
              hide-details
              density="compact"
              class="mr-2"
            ></v-switch>

            <v-btn
              variant="text"
              prepend-icon="mdi-chevron-left"
              @click="prevStudent"
              :disabled="!hasPrev"
              color="grey-darken-2"
            >
              Prev
            </v-btn>

            <v-btn
              variant="text"
              append-icon="mdi-chevron-right"
              @click="nextStudent"
              :disabled="!hasNext"
              color="grey-darken-2"
            >
              Next
            </v-btn>
          </div>
        </div>

        <!-- Scrollable Form Area -->
        <div class="flex-grow-1 overflow-y-auto pa-6 pb-12">
          <v-container class="max-width-1000 pa-0">
            <div v-if="loadingForm" class="d-flex justify-center ma-12">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <template v-else>
              <div v-for="section in form.sections" :key="section.id" class="mb-6">
                <v-card elevation="2" class="section-card">
                  <div class="section-header pa-4">
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <h3 class="section-title">{{ section.label }}</h3>
                        <div
                          v-if="section.description"
                          class="text-caption text-grey-darken-1 mt-1"
                        >
                          {{ section.description }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <v-divider />

                  <div class="grid-wrapper">
                    <AgGridVue
                      :key="section.key + '-' + selectedStudentId"
                      class="ag-theme-quartz"
                      style="height: 100%; width: 100%"
                      :columnDefs="getColumnDefs(section)"
                      :rowData="getGridRowData(section)"
                      :defaultColDef="defaultColDef"
                      :animateRows="true"
                      @cell-value-changed="onCellValueChanged"
                    />
                  </div>
                </v-card>
              </div>
            </template>
          </v-container>
        </div>
      </template>
    </v-main>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="bottom center">
      {{ snackbarText }}
    </v-snackbar>
  </v-layout>
</template>

<script setup>
import api from '@/api'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'
import '../../styles/CreateTemplateForm.css'

const route = useRoute()
const search = ref('')
const students = ref([])
const selectedStudentId = ref(null)
const selectedStudent = computed(() => students.value.find((s) => s.id === selectedStudentId.value))

const form = ref({ sections: [] })
const allCells = ref({}) // { studentId: { sectionKey: { rowKey: { colKey: value } } } }
const activeGrades = ref({})
const hasChanges = ref(false)
const loadingForm = ref(false)
const saving = ref(false)

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

onMounted(async () => {
  loadingForm.value = true
  await Promise.all([getStudents(), getForm()])
  loadingForm.value = false
})

async function getStudents() {
  const classId = route.params.classId
  try {
    const response = await api.get(`/course-instances/${classId}?includeEnrollments=1`)
    if (response.data.enrollments) {
      students.value = response.data.enrollments
        .map((e) => e.student)
        .sort((a, b) => a.last_name.localeCompare(b.last_name))
    }
  } catch (e) {
    console.error(e)
  }
}

async function getForm() {
  const formId = route.params.formId
  // const formId = 5
  try {
    const response = await api.get(`/evaluations/${formId}`)
    console.log(response.data)
    form.value = response.data.form || { sections: [] }
    allCells.value = response.data.cells || {}
  } catch (e) {
    console.error(e)
  }
}

const studentIndex = computed(() => {
  return students.value.findIndex((s) => s.id === selectedStudentId.value)
})

const hasNext = computed(() => {
  return studentIndex.value < students.value.length - 1
})

const hasPrev = computed(() => {
  return studentIndex.value > 0
})

function getInitials(student) {
  if (!student) return '?'
  return ((student.first_name?.[0] || '') + (student.last_name?.[0] || '')).toUpperCase()
}

// Selection & Data Binding
async function selectStudent(id) {
  // If unsaved changes, we could prompt, but we'll assume seamless switch for now
  // In a real app, maybe auto-save?
  // Let's just switch.
  loadingForm.value = true
  selectedStudentId.value = id
  hasChanges.value = false

  try {
    const formId = route.params.formId
    const response = await api.get(`/evaluations/${formId}?student_id=${id}`)
    form.value = response.data.form || { sections: [] }
    console.log(form.value)

    // Update cells (this includes the injected WBL data)
    if (response.data.cells) {
      // We merge instead of overwriting to keep other students' data if needed,
      // though for WBL rows which are dynamic, the structure changes anyway.
      // Actually, response.data.cells contains ALL cells for the document from findAll,
      // PLUS the injected WBL cells for this student.
      // So overwriting active cell cache is safe/correct.
      allCells.value = response.data.cells
    }
  } catch (e) {
    console.error('Error fetching student form', e)
  }

  // Initialize activeGrades for this student
  const studentStrId = String(id)
  const existingData = allCells.value[studentStrId] || {}

  const newGrades = {}

  // Initialize structure based on form definition to ensure reactivity
  form.value.sections.forEach((section) => {
    newGrades[section.key] = {}
    section.rows.forEach((row) => {
      newGrades[section.key][row.key] = {}
      section.columns.forEach((col) => {
        // Get existing value or null
        let val = null
        if (existingData[section.key] && existingData[section.key][row.key]) {
          val = existingData[section.key][row.key][col.key]
        }
        newGrades[section.key][row.key][col.key] = val
      })
    })
  })

  activeGrades.value = newGrades
  loadingForm.value = false
}

function markChanged() {
  hasChanges.value = true
}

// Navigation
async function nextStudent() {
  console.log('nextStudent', hasChanges.value)
  if (hasChanges.value) {
    await saveCurrentStudent() // Auto-save on next
  }
  if (hasNext.value) {
    selectStudent(students.value[studentIndex.value + 1].id)
  }
}

async function prevStudent() {
  if (hasChanges.value) {
    await saveCurrentStudent()
  }
  if (hasPrev.value) {
    selectStudent(students.value[studentIndex.value - 1].id)
  }
}

async function saveCurrentStudent() {
  if (!selectedStudentId.value) return
  saving.value = true

  try {
    const changesMap = new Map() // Deduplicate by cell key
    const studentId = selectedStudentId.value
    const formId = route.params.formId

    form.value.sections.forEach((section) => {
      section.rows.forEach((row) => {
        section.columns.forEach((col) => {
          const val = activeGrades.value[section.key]?.[row.key]?.[col.key]
          // Send data if it exists
          if (val !== null && val !== undefined && val !== '') {
            const cellKey = `${section.key}-${row.key}-${col.key}`
            // Only keep first occurrence (or could keep last with overwrite)
            if (!changesMap.has(cellKey)) {
              changesMap.set(cellKey, {
                studentId: studentId,
                sectionKey: section.key,
                rowKey: row.key,
                rowId: row.id || row.row_id,
                columnKey: col.key,
                columnId: col.id || col.column_id,
                value: val,
              })
            }
          }
        })
      })
    })

    const changes = Array.from(changesMap.values())
    console.log('Saving changes:', changes)
    if (changes.length > 0) {
      // Changed to POST to match backend route
      await api.post(`/evaluations/${formId}/students/${studentId}/cells`, { changes })

      // Update local cache
      const studentStrId = String(studentId)
      if (!allCells.value[studentStrId]) allCells.value[studentStrId] = {}

      form.value.sections.forEach((section) => {
        if (!allCells.value[studentStrId][section.key])
          allCells.value[studentStrId][section.key] = {}
        section.rows.forEach((row) => {
          if (!allCells.value[studentStrId][section.key][row.key])
            allCells.value[studentStrId][section.key][row.key] = {}
          section.columns.forEach((col) => {
            const val = activeGrades.value[section.key][row.key][col.key]
            allCells.value[studentStrId][section.key][row.key][col.key] = val
          })
        })
      })

      showMessage('Saved successfully', 'success')
    }

    hasChanges.value = false
  } catch (e) {
    console.error(e)
    showMessage('Failed to save grades', 'error')
  } finally {
    saving.value = false
  }
}

// Helpers
const manualCompletionStatus = ref({}) // { studentId: boolean }

const isCurrentStudentCompleted = computed({
  get() {
    if (!selectedStudentId.value) return false
    if (manualCompletionStatus.value[selectedStudentId.value] !== undefined) {
      return manualCompletionStatus.value[selectedStudentId.value]
    }
    return getStatusText(selectedStudentId.value) === 'Graded'
  },
  set(val) {
    if (selectedStudentId.value) {
      manualCompletionStatus.value[selectedStudentId.value] = val
    }
  },
})

function getStatusText(studentId) {
  if (manualCompletionStatus.value[studentId] !== undefined) {
    return manualCompletionStatus.value[studentId] ? 'Graded' : 'Not Graded'
  }
  const studentData = allCells.value[String(studentId)]
  if (!studentData || Object.keys(studentData).length === 0) return 'Not Graded'
  // Simple check: if student has ANY data in cache, consider graded/in-progress
  // Real check would be deeper
  return 'Graded'
}

function getStatusColor(studentId) {
  const status = getStatusText(studentId)
  if (status === 'Graded') return 'green-lighten-4'
  return 'amber-lighten-4'
}

function getStatusIcon(studentId) {
  const status = getStatusText(studentId)
  if (status === 'Graded') return 'mdi-check-circle'
  return 'mdi-alert-circle-outline'
}

// Grid Helpers
const defaultColDef = {
  flex: 1,
  minWidth: 100,
  editable: true,
  sortable: false,
  filter: false,
  resizable: true,
}

function getColumnDefs(section) {
  const cols = [
    {
      field: 'rowLabel',
      headerName: 'Assessment Criteria',
      pinned: 'left',
      editable: false,
      width: 250,
      minWidth: 200,
      cellClass: 'font-weight-medium',
    },
  ]

  section.columns.forEach((col) => {
    const colDef = {
      field: col.key,
      headerName: col.label,
      editable: col.config?.editable !== false, // Default to true if not specified
    }

    if (col.valueType === 'number') {
      colDef.cellDataType = 'number'
    } else if (col.valueType === 'boolean') {
      colDef.cellDataType = 'boolean'
    } else {
      colDef.cellDataType = 'text'
    }

    cols.push(colDef)
  })

  return cols
}

function getGridRowData(section) {
  if (!activeGrades.value[section.key]) return []

  return section.rows.map((row) => {
    const rowData = {
      rowLabel: row.label,
      rowKey: row.key,
      sectionKey: section.key,
    }

    section.columns.forEach((col) => {
      const val = activeGrades.value[section.key][row.key]?.[col.key]
      rowData[col.key] = val // Populate value
    })

    return rowData
  })
}

function onCellValueChanged(params) {
  const sectionKey = params.data.sectionKey
  const rowKey = params.data.rowKey
  const colKey = params.colDef.field

  if (sectionKey && rowKey && colKey) {
    if (!activeGrades.value[sectionKey]) {
      activeGrades.value[sectionKey] = {}
    }
    if (!activeGrades.value[sectionKey][rowKey]) {
      activeGrades.value[sectionKey][rowKey] = {}
    }
    activeGrades.value[sectionKey][rowKey][colKey] = params.newValue
    markChanged()
  }
}

function showMessage(text, color) {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}
</script>

<style scoped></style>
