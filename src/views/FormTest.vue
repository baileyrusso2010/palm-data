<template>
  <div class="data-view">
    <!-- Header Section -->
    <v-app-bar flat height="80" class="px-6 border-b-thin">
      <v-app-bar-title class="text-h4 font-weight-light text-grey-darken-3">
        {{ formName }}
      </v-app-bar-title>
      <v-spacer />
      <div class="d-flex align-center gap-4">
        <v-select
          v-model="selectedStudentId"
          :items="students"
          item-title="name"
          item-value="id"
          label="Student"
          variant="solo"
          density="compact"
          hide-details
          class="student-select"
          @update:model-value="processFormData"
        />
        <v-btn variant="flat" color="primary" size="default" class="save-btn" @click="saveAll">
          <v-icon left>mdi-content-save</v-icon>
          Save Changes
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="pa-8">
      <v-row v-if="isLoading" class="justify-center py-16">
        <v-col cols="auto">
          <v-progress-circular indeterminate color="grey-lighten-1" size="48" />
        </v-col>
      </v-row>

      <v-row v-else class="data-sections">
        <v-col cols="12">
          <div v-for="section in sections" :key="section.id" class="section-container mb-12">
            <div class="section-header mb-6">
              <h3 class="text-h5 font-weight-regular text-grey-darken-2">
                {{ section.name }}
              </h3>
              <v-divider class="mt-2" />
            </div>

            <!-- Static Fields -->
            <div v-if="section.staticFields?.length" class="mb-6">
              <v-row>
                <v-col
                  v-for="field in section.staticFields"
                  :key="field.field_name"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="field.value"
                    :label="field.field_name"
                    :type="field.field_type === 'number' ? 'number' : 'text'"
                    variant="outlined"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>
            </div>

            <div class="grid-wrapper" v-if="section.rowData.length > 0">
              <ag-grid-vue
                class="ag-theme-quartz data-grid"
                :rowData="section.rowData"
                :columnDefs="section.columnDefs"
                :defaultColDef="defaultColDef"
                :theme="gridTheme"
                style="width: 100%; height: 500px"
                @cell-value-changed="(params) => onCellValueChanged(params, section)"
              />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      <v-icon left>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { gridTheme } from '@/gridTheme'
import api from '@/api'

// State
const isLoading = ref(false)
const formName = ref('')
const rawFormData = ref(null) // Store the full API response
const selectedStudentId = ref(112)
const sections = ref([])

// Snackbar state
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
  timeout: 4000,
})

// Mock Students
const students = ref([
  { id: 112, name: 'Alice' },
  { id: 799, name: 'Bob' },
])

// Grid Configurations
const defaultColDef = { editable: true, resizable: true, sortable: false }

// Period Mapping
const periodMap = {
  quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
  semester: ['S1', 'S2'],
  year: ['Y'],
}

onMounted(async () => {
  await loadFullForm()
})

async function loadFullForm() {
  isLoading.value = true
  try {
    const { data } = await api.get('/forms/1/full')
    console.log(data)

    rawFormData.value = data
    formName.value = data.name

    processFormData()
  } catch (err) {
    console.error('Error loading full form:', err)
  } finally {
    isLoading.value = false
  }
}

function processFormData() {
  if (!rawFormData.value) return

  const data = rawFormData.value
  const periods = periodMap[data.grading_period] || []

  sections.value = data.rubric_sections.map((section) => {
    return createGridConfig(section, periods)
  })
}

function createGridConfig(section, periods) {
  const columnDefs = []

  const shouldDisplayTitle = section.rubric_rows.length > 0 && section.rubric_rows[0].display_title

  if (shouldDisplayTitle) {
    columnDefs.push(
      { headerName: 'Skill', field: 'label', pinned: 'left', width: 200, editable: false },
      {
        headerName: 'Description',
        field: 'description',
        pinned: 'left',
        width: 250,
        editable: false,
      },
    )
  }

  // Determine dynamic columns
  const hasPeriods = section.period_applies
  const hasRubricCols = section.rubric_columns && section.rubric_columns.length > 0

  if (hasPeriods && hasRubricCols) {
    // Case 1: Periods + Rubric Columns (e.g. Junior S1, Junior S2)
    section.rubric_columns.forEach((col) => {
      periods.forEach((period) => {
        columnDefs.push({
          headerName: `${col.label} ${period}`,
          field: `col_${col.id}_${period}`,
          width: 100,
        })
      })
    })
  } else if (hasPeriods && !hasRubricCols) {
    // Case 2: Periods only (e.g. S1, S2)
    periods.forEach((period) => {
      columnDefs.push({
        headerName: period,
        field: `period_${period}`,
        width: 100,
      })
    })
  } else if (!hasPeriods && hasRubricCols) {
    // Case 3: Rubric Columns only (e.g. Exam 1, Exam 2)
    section.rubric_columns.forEach((col) => {
      columnDefs.push({
        headerName: col.label,
        field: `col_${col.id}`,
        width: 100,
      })
    })
  }
  // Case 4: No periods, no rubric columns -> just rows (Label/Desc)

  // Add Comment column
  if (section.show_comments) {
    columnDefs.push({
      headerName: 'Comment',
      field: 'comment',
      width: 300,
      cellEditor: 'agLargeTextCellEditor',
    })
  }

  // Build Row Data
  const rowData = section.rubric_rows.map((r) => {
    const row = {
      id: r.id,
      label: r.label,
      description: r.description,
      comment: '',
    }

    // Filter grades for selected student
    const studentGrades = r.rubric_grades
      ? r.rubric_grades.filter((g) => g.student_id === selectedStudentId.value)
      : []

    studentGrades.forEach((g) => {
      let key = ''
      // IMPORTANT: Ensure types match when comparing IDs (API might return strings or numbers)
      // Also handle the case where rubric_column_id might be null in the grade object

      if (g.rubric_column_id && g.period) {
        key = `col_${g.rubric_column_id}_${g.period}`
      } else if (g.rubric_column_id) {
        key = `col_${g.rubric_column_id}`
      } else if (g.period) {
        key = `period_${g.period}`
      }

      if (key) {
        row[key] = g.grade
      }
      // If any grade has a comment, we populate the row comment (last one wins if multiple)
      if (g.comment) row.comment = g.comment
    })

    return row
  })

  return {
    id: section.id,
    name: section.name,
    columnDefs,
    rowData,
    staticFields: (section.static_fields || []).map((f) => ({
      ...f,
      value: f.static_values?.[0]?.value ?? '',
    })),
  }
}

async function onCellValueChanged(params, section) {
  const { colDef, data, newValue, oldValue } = params

  // 1. Don't save if value hasn't actually changed
  if (newValue === oldValue) return

  const field = colDef.field

  // 2. Parse the field key to get metadata
  // Patterns: 'col_{id}_{period}', 'period_{period}', 'col_{id}'
  let rubricColumnId = null
  let period = null

  if (field === 'comment') {
    // Comment changed.
    // Since comment is shared for the row in this UI, we might want to save it
    // associated with the "latest" grade or just log it for now as the
    // payload structure requires a specific grade entry.
    console.log('Comment updated. Use "Save All" to persist comments with grades.')
    return
  }

  if (field.startsWith('col_') && field.includes('_', 4)) {
    // Case: col_18_S1
    const parts = field.split('_')
    rubricColumnId = parseInt(parts[1])
    period = parts[2]
  } else if (field.startsWith('col_')) {
    // Case: col_18
    rubricColumnId = parseInt(field.split('_')[1])
  } else if (field.startsWith('period_')) {
    // Case: period_S1
    period = field.split('_')[1]
  }

  // 3. Construct Payload
  const gradeItem = {
    row_id: data.id,
    grade: newValue,
    comment: data.comment,
    student_id: selectedStudentId.value,
  }

  if (rubricColumnId) gradeItem.column_id = rubricColumnId
  if (period) gradeItem.period = period

  const payload = {
    grades: [gradeItem],
  }

  console.log('Saving Single Grade Payload:', payload)

  // 4. Call API
  try {
    // await api.post('/grades', payload)
    console.log('Saved successfully')
  } catch (err) {
    console.error('Failed to save grade:', err)
  }
}

async function saveAll() {
  const grades = []

  sections.value.forEach((section) => {
    section.rowData.forEach((row) => {
      // Iterate over all keys in the row to find grade fields
      Object.keys(row).forEach((key) => {
        let rubricColumnId = null
        let period = null
        let isGradeField = false

        if (key.startsWith('col_') && key.includes('_', 4)) {
          const parts = key.split('_')
          rubricColumnId = parseInt(parts[1])
          period = parts[2]
          isGradeField = true
        } else if (key.startsWith('col_')) {
          rubricColumnId = parseInt(key.split('_')[1])
          isGradeField = true
        } else if (key.startsWith('period_')) {
          period = key.split('_')[1]
          isGradeField = true
        }

        if (isGradeField) {
          const gradeVal = row[key]
          // Only include if there is a value
          if (gradeVal !== undefined && gradeVal !== null && gradeVal !== '') {
            const item = {
              row_id: row.id,
              grade: gradeVal,
              comment: row.comment,
              student_id: selectedStudentId.value,
            }
            if (rubricColumnId) item.column_id = rubricColumnId
            if (period) item.period = period
            grades.push(item)
          }
        }
      })
    })
  })

  const payload = { grades }
  console.log('Saving All Grades Payload:', payload)

  try {
    await api.post('/rubric/grades/student/112', payload)
    console.log('All grades saved successfully')

    // Show success snackbar
    snackbar.value = {
      show: true,
      message: 'All changes saved successfully!',
      color: 'success',
      icon: 'mdi-check-circle',
      timeout: 4000,
    }
  } catch (err) {
    console.error('Failed to save all grades:', err)

    // Show error snackbar
    snackbar.value = {
      show: true,
      message: 'Failed to save changes. Please try again.',
      color: 'error',
      icon: 'mdi-alert-circle',
      timeout: 6000,
    }
  }
}
</script>

<style scoped>
.data-view {
  background-color: #fafafa;
  min-height: 100vh;
}

.border-b-thin {
  border-bottom: 1px solid #e0e0e0 !important;
}

.student-select {
  min-width: 200px;
}

.save-btn {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.data-sections {
  margin-top: 2rem;
}

.section-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.section-header h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 400;
}

.grid-wrapper {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.data-grid {
  border: none;
  border-radius: 8px;
}

.data-grid :deep(.ag-header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.data-grid :deep(.ag-row) {
  border-bottom: 1px solid #f8f9fa;
}

.data-grid :deep(.ag-row:hover) {
  background-color: #f8f9fa;
}

.data-grid :deep(.ag-cell) {
  border-right: 1px solid #f1f3f4;
  padding: 8px 12px;
}

.data-grid :deep(.ag-cell-focus) {
  border: 2px solid #1976d2;
  border-radius: 2px;
}

.gap-4 {
  gap: 1rem;
}
</style>
