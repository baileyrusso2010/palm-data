<template>
  <v-container>
    <h2>{{ form.name }} - Grading</h2>

    <!-- Student Select -->
    <v-select
      v-model="selectedStudentId"
      :items="students"
      item-title="name"
      item-value="id"
      label="Select Student"
      class="mb-4"
      @change="loadExistingGrades"
    />

    <!-- AG Grid -->
    <h1>Employability Skills</h1>
    <ag-grid-vue
      class="ag-theme-alpine"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :stopEditingWhenCellsLoseFocus="true"
      style="width: 100%; height: 500px"
    />

    <h1>21st Century Exam</h1>
    <ag-grid-vue
      class="ag-theme-alpine"
      :rowData="centuryRowData"
      :columnDefs="centuryColumnDefs"
      :defaultColDef="defaultColDef"
      style="width: 100%; height: 120px"
    />

    <v-btn color="primary" class="mt-4" @click="saveGrades"> Save Grades </v-btn>
    <v-btn color="primary" class="mt-4" @click="save21Century"> Save 21 Grades </v-btn>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import api from '@/api' // Axios instance

// ----- Example form -----
const form = reactive({
  id: 13,
  name: 'Employability Skills',
  grading_period_type: 'semester', // quarter / semester / year
})

// ----- Example students -----
const students = ref([
  { id: 112, name: 'Alice' },
  { id: 113, name: 'Bob' },
])
const selectedStudentId = ref(112)

// ----- Periods based on grading type -----
const periodMap = {
  quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
  semester: ['S1', 'S2'],
  year: ['Y'],
}
const periods = periodMap[form.grading_period_type]

// ----- Columns -----
const columnDefs = ref([])
const defaultColDef = {
  editable: true,
  resizable: true,
}

// ----- Rows -----
const rowData = ref([])

// ----- Lifecycle -----
onMounted(async () => {
  await loadRubricRows()
  buildColumns()
  await loadExistingGrades()
  await load21Century()
})

const centuryColumnDefs = ref([])
const centuryRowData = ref([])
const centuryRowMeta = ref({ rowId: null })

async function load21Century() {
  try {
    const { data } = await api.get('/rubric/section/7/columns')
    // Build columns from API
    centuryColumnDefs.value = (Array.isArray(data) ? data : []).map((col) => ({
      headerName: col.label,
      field: String(col.id),
      editable: true,
    }))

    // Get the actual row data
    const { data: rows } = await api.get(`/rubric/section/7/rows`)
    let row = {}
    const firstRow = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    centuryRowMeta.value.rowId = firstRow?.id ?? null
    const storedValues = firstRow?.row_data || firstRow?.rowData || {}

    centuryColumnDefs.value.forEach((col) => {
      row[col.field] = storedValues[col.field] ?? ''
    })

    centuryRowData.value = [row]

    await load21CenturyGrades()
  } catch (err) {
    console.error('Error loading grades/comments', err)
  }
}

async function load21CenturyGrades() {
  if (!selectedStudentId.value || !centuryRowMeta.value.rowId) return
  try {
    const { data } = await api.get(
      `/rubric/grades/student/${selectedStudentId.value}/form/${form.id}`,
    )

    const targetRowId = centuryRowMeta.value.rowId
    const currentRow = centuryRowData.value[0]
    if (!currentRow) return

    data
      .filter((grade) => grade.rubric_row_id === targetRowId)
      .forEach((grade) => {
        const colKey = String(grade.rubric_column_id)
        currentRow[colKey] = grade.grade
      })

    // Force reactivity for AG Grid
    centuryRowData.value = [{ ...currentRow }]
  } catch (err) {
    console.error('Error loading 21st Century grades', err)
  }
}

async function save21Century() {
  try {
    const gradesPayload = []
    const row = centuryRowData.value[0] || {}
    const rowId = centuryRowMeta.value.rowId

    if (!rowId) {
      alert('No row_id found for 21st Century Exam')
      return
    }

    centuryColumnDefs.value.forEach((col) => {
      const gradeValue = row[col.field]
      if (gradeValue !== '' && gradeValue != null) {
        gradesPayload.push({
          row_id: rowId,
          column_id: Number(col.field),
          grade: gradeValue,
        })
      }
    })

    await api.post(`/rubric/grades/student/${selectedStudentId.value}`, {
      grades: gradesPayload,
    })

    console.log(gradesPayload)
  } catch (err) {
    console.error('Error saving 21st Century grades', err)
    alert('Failed to save 21st Century grades')
  }
}

// ----- Load rows from API -----
async function loadRubricRows() {
  try {
    const { data: rowsResponse } = await api.get(`/rubric/section/5/rows`)
    const rowsArray = Array.isArray(rowsResponse) ? rowsResponse : Object.values(rowsResponse ?? {})

    rowData.value = rowsArray.map((row) => ({
      rowId: row.id,
      label: row.label ?? row.name ?? '',
      description: row.description ?? '',
      sectionId: 2,
      sectionName: 'Section 2',
      grades: {},
      comment: '',
    }))
  } catch (err) {
    console.error('Error loading rubric rows', err)
  }
}

// ----- Build dynamic columns -----
async function buildColumns() {
  columnDefs.value = [
    { headerName: 'Skill', field: 'label', pinned: 'left' },
    { headerName: 'Description', field: 'description', pinned: 'left', editable: false },
  ]

  // Example columns: Junior / Senior
  const rubricColumns = []

  let dt = await api.get('/rubric/section/5/columns')

  dt.data.forEach((item) => {
    rubricColumns.push({
      id: item.id,
      label: item.label,
    })
  })
  rubricColumns.forEach((col) => {
    periods.forEach((period) => {
      columnDefs.value.push({
        headerName: `${col.label} ${period}`,
        editable: true,
        valueGetter: (params) => params.data.grades?.[`${col.id}_${period}`] ?? '',
        valueSetter: (params) => {
          params.data.grades = params.data.grades || {}
          params.data.grades[`${col.id}_${period}`] = params.newValue
          return true
        },
      })
    })
  })

  // Only one comment column per row
  columnDefs.value.push({
    headerName: 'Comment',
    editable: true,
    valueGetter: (params) => params.data.comment ?? '',
    valueSetter: (params) => {
      params.data.comment = params.newValue
      return true
    },
    cellEditor: 'agLargeTextCellEditor',
    cellEditorParams: { maxLength: 200, rows: 3, cols: 30 },
  })
}

// ----- Load existing grades for student -----
async function loadExistingGrades() {
  if (!selectedStudentId.value) return
  try {
    const { data } = await api.get(
      `/rubric/grades/student/${selectedStudentId.value}/form/${form.id}`,
    )
    console.log(data)
    data.forEach((g) => {
      const row = rowData.value.find((r) => r.rowId === g.rubric_row_id)
      if (row) {
        const key = g.rubric_column_id + '_' + g.period
        row.grades[key] = g.grade
        // Set the row comment if present (last one wins)
        if (g.comment !== undefined && g.comment !== null && g.comment !== '') {
          row.comment = g.comment
        }
      }
    })
  } catch (err) {
    console.error('Error loading grades/comments', err)
  }
}

// ----- Save grades -----
async function saveGrades() {
  try {
    const gradesPayload = []
    rowData.value.forEach((row) => {
      Object.entries(row.grades ?? {}).forEach(([key, gradeValue]) => {
        if (gradeValue === '' || gradeValue == null) return
        const [columnId, period] = key.split('_')
        const numericColumnId = Number(columnId)
        if (!period || Number.isNaN(numericColumnId)) return
        gradesPayload.push({
          row_id: row.rowId,
          column_id: numericColumnId,
          period,
          grade: gradeValue,
          comment: row.comment ?? '',
        })
      })
    })

    await api.post(`/rubric/grades/student/${selectedStudentId.value}`, {
      grades: gradesPayload,
    })

    alert('Grades saved!')
  } catch (err) {
    console.error('Error saving grades', err)
    alert('Failed to save')
  }
}
</script>

<style scoped>
.ag-theme-alpine {
  width: 100%;
  height: 500px;
}
</style>
