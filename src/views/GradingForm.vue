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
    <ag-grid-vue
      class="ag-theme-alpine"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :stopEditingWhenCellsLoseFocus="true"
      style="width: 100%; height: 500px"
    />

    <v-btn color="primary" class="mt-4" @click="saveGrades"> Save Grades </v-btn>
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
})

// ----- Load rows from API -----
async function loadRubricRows() {
  try {
    const { data } = await api.get(`/rubric/sections/form/${form.id}`)
    console.log(data)

    const sections = Array.isArray(data) ? data : []
    const rowsPerSection = await Promise.all(
      sections.map(async (section) => {
        try {
          const { data: rowsResponse } = await api.get(`/rubric/section/${section.id}/rows`)
          const rowsArray = Array.isArray(rowsResponse)
            ? rowsResponse
            : Object.values(rowsResponse ?? {})

          return rowsArray.map((row) => ({
            rowId: row.id,
            label: row.label ?? row.name ?? '',
            description: row.description ?? '',
            sectionId: section.id,
            sectionName: section.name,
            grades: {},
            comment: '',
          }))
        } catch (sectionErr) {
          console.error(`Error loading rows for section ${section.id}`, sectionErr)
          return []
        }
      }),
    )

    rowData.value = rowsPerSection.flat()
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

  //   {id: 8, rubric_section_id: 5, label: "Junior"}

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
