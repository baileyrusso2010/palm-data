<template>
  <v-container>
    <h2>{{ formName }} - Full Load Test</h2>

    <v-select
      v-model="selectedStudentId"
      :items="students"
      item-title="name"
      item-value="id"
      label="Select Student"
      class="mb-4"
      @update:model-value="processFormData"
    />

    <div v-if="isLoading">Loading...</div>

    <div v-else>
      <!-- Section 1: Employability -->
      <h1 class="mt-4">Employability Skills</h1>
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="employabilityData.rows"
        :columnDefs="employabilityData.cols"
        :defaultColDef="defaultColDef"
        style="width: 100%; height: 400px"
      />

      <!-- Section 2: 21st Century -->
      <h1 class="mt-4">21st Century Exam</h1>
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="centuryData.rows"
        :columnDefs="centuryData.cols"
        :defaultColDef="defaultColDef"
        style="width: 100%; height: 150px"
      />

      <!-- Section 3: Technical -->
      <h1 class="mt-4">Technical Assessment</h1>
      <ag-grid-vue
        class="ag-theme-alpine"
        :rowData="technicalData.rows"
        :columnDefs="technicalData.cols"
        :defaultColDef="defaultColDef"
        style="width: 100%; height: 200px"
      />

      <div class="d-flex mt-4" style="gap: 1rem">
        <v-btn color="primary" @click="saveEmployability">Save Employability</v-btn>
        <v-btn color="primary" @click="saveCentury">Save 21st Century</v-btn>
        <v-btn color="primary" @click="saveTechnical">Save Technical</v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import api from '@/api'

// State
const isLoading = ref(false)
const formName = ref('')
const rawFormData = ref(null) // Store the full API response
const selectedStudentId = ref(798)

// Mock Students
const students = ref([
  { id: 798, name: 'Alice' },
  { id: 799, name: 'Bob' },
])

// Grid Configurations
const defaultColDef = { editable: true, resizable: true, sortable: false }
const employabilityData = reactive({ rows: [], cols: [] })
const centuryData = reactive({ rows: [], cols: [] })
const technicalData = reactive({ rows: [], cols: [] })

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
    // In a real scenario, you might pass the student ID to the backend here
    // const { data } = await api.get(`/forms/1/full?student_id=${selectedStudentId.value}`)
    const { data } = await api.get('/forms/1/full')

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

  // Reset Grids
  employabilityData.rows = []
  employabilityData.cols = []
  centuryData.rows = []
  centuryData.cols = []
  technicalData.rows = []
  technicalData.cols = []

  // Process Sections
  data.rubric_sections.forEach((section) => {
    // Match by ID or Name. Using Name here based on your JSON.
    if (section.name === 'Employability Skills') {
      setupEmployability(section, periods)
    } else if (section.name === '21st Century Exam') {
      setupCentury(section)
    } else if (section.name === 'Assessment' || section.name === 'Technical Assessment') {
      setupTechnical(section)
    }
  })
}

async function saveEmployability() {
  try {
    const gradesPayload = []
    employabilityData.rows.forEach((row) => {
      // Iterate over all keys in the row to find grades
      Object.entries(row).forEach(([key, value]) => {
        if (['rowId', 'label', 'description', 'comment'].includes(key)) return

        // Check if key is in format columnId_period
        const parts = key.split('_')
        if (parts.length !== 2) return

        const [columnId, period] = parts
        const numericColumnId = Number(columnId)

        if (Number.isNaN(numericColumnId)) return

        if (value !== '' && value != null) {
          gradesPayload.push({
            row_id: row.rowId,
            column_id: numericColumnId,
            period,
            grade: value,
            comment: row.comment ?? '',
          })
        }
      })
    })

    await api.post(`/rubric/grades/student/${selectedStudentId.value}`, {
      grades: gradesPayload,
    })

    alert('Employability grades saved!')
  } catch (err) {
    console.error('Error saving Employability grades', err)
    alert('Failed to save Employability grades')
  }
}

async function saveCentury() {
  try {
    const gradesPayload = []

    centuryData.rows.forEach((row) => {
      centuryData.cols.forEach((col) => {
        const gradeValue = row[col.field]
        if (gradeValue !== '' && gradeValue != null) {
          gradesPayload.push({
            row_id: row.rowId,
            column_id: Number(col.field),
            grade: gradeValue,
          })
        }
      })
    })

    await api.post(`/rubric/grades/student/${selectedStudentId.value}`, {
      grades: gradesPayload,
    })
    alert('21st Century grades saved!')
  } catch (err) {
    console.error('Error saving 21st Century grades', err)
    alert('Failed to save 21st Century grades')
  }
}

async function saveTechnical() {
  try {
    const gradesPayload = []

    technicalData.rows.forEach((row) => {
      technicalData.cols.forEach((col) => {
        if (col.field === 'label') return

        const gradeValue = row[col.field]
        if (gradeValue !== '' && gradeValue != null) {
          gradesPayload.push({
            row_id: row.rowId,
            column_id: Number(col.field),
            grade: gradeValue,
          })
        }
      })
    })

    await api.post(`/rubric/grades/student/${selectedStudentId.value}`, {
      grades: gradesPayload,
    })

    alert('Technical Assessment grades saved!')
  } catch (err) {
    console.error('Error saving Technical Assessment grades', err)
    alert('Failed to save Technical Assessment grades')
  }
}

// --- Section 1: Employability ---
function setupEmployability(section, periods) {
  // 1. Build Columns
  const cols = [
    { headerName: 'Skill', field: 'label', pinned: 'left', width: 200 },
    {
      headerName: 'Description',
      field: 'description',
      pinned: 'left',
      width: 250,
      editable: false,
    },
  ]

  // Dynamic Columns (Junior/Senior) x Periods (S1/S2)
  section.rubric_columns.forEach((col) => {
    periods.forEach((period) => {
      cols.push({
        headerName: `${col.label} ${period}`,
        field: `${col.id}_${period}`, // e.g. "1_S1"
        width: 100,
      })
    })
  })

  cols.push({
    headerName: 'Comment',
    field: 'comment',
    width: 300,
    cellEditor: 'agLargeTextCellEditor',
  })

  employabilityData.cols = cols

  // 2. Build Rows & Map Grades
  employabilityData.rows = section.rubric_rows.map((r) => {
    const row = {
      rowId: r.id,
      label: r.label,
      description: r.description,
      comment: '',
    }

    // Flatten grades into the row object
    // Filter for selected student if the API returns multiple
    const studentGrades = r.rubric_grades.filter((g) => g.student_id === selectedStudentId.value)

    studentGrades.forEach((g) => {
      const key = `${g.rubric_column_id}_${g.period}`
      row[key] = g.grade
      if (g.comment) row.comment = g.comment
    })

    return row
  })
}

// --- Section 2: 21st Century ---
function setupCentury(section) {
  // 1. Columns
  centuryData.cols = section.rubric_columns.map((col) => ({
    headerName: col.label,
    field: String(col.id),
  }))

  // 2. Rows (Usually just one)
  centuryData.rows = section.rubric_rows.map((r) => {
    const row = { rowId: r.id }

    const studentGrades = r.rubric_grades.filter((g) => g.student_id === selectedStudentId.value)

    studentGrades.forEach((g) => {
      row[String(g.rubric_column_id)] = g.grade
    })
    return row
  })
}

// --- Section 3: Technical ---
function setupTechnical(section) {
  // 1. Columns (Start with Skill Label)
  const cols = [{ headerName: 'Skill', field: 'label', editable: false, width: 200 }]

  section.rubric_columns.forEach((col) => {
    cols.push({
      headerName: col.label,
      field: String(col.id),
    })
  })

  technicalData.cols = cols

  // 2. Rows
  technicalData.rows = section.rubric_rows.map((r) => {
    const row = {
      rowId: r.id,
      label: r.label,
    }

    const studentGrades = r.rubric_grades.filter((g) => g.student_id === selectedStudentId.value)

    studentGrades.forEach((g) => {
      row[String(g.rubric_column_id)] = g.grade
    })

    return row
  })
}
</script>
