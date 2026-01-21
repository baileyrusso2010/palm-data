<template>
  <h1>{{ formName }}</h1>
  <div style="height: 500px; width: 100%">
    <AgGridVue
      class="ag-theme-quartz"
      style="height: 100%; width: 100%"
      :columnDefs="columnDefs"
      :rowData="rowData"
      :defaultColDef="defaultColDef"
      :animateRows="true"
      @grid-ready="onGridReady"
      @cell-value-changed="onCellValueChanged"
    />
  </div>
  <v-btn @click="saveChanges">Save Changes</v-btn>
</template>

<script setup>
import { AgGridVue } from 'ag-grid-vue3'
import { onMounted, reactive, ref } from 'vue'
import api from '../../api'

const formName = ref('')
const columnDefs = ref([])
const rowData = ref([])
const form = reactive({ sections: [] })
let cells = {} // backend cells for student
let changedCells = [] // buffer for edits

const defaultColDef = {
  flex: 1,
  filter: true,
  sortable: true,
  editable: true,
}

onMounted(() => getForm())

async function getForm() {
  const form_id = 1
  const result = await api.get(`/evaluations/${form_id}`)
  const { form: f, cells: c } = result.data

  formName.value = f.name
  form.sections = f.sections
  cells = c['1'] || {} // only one student for now

  // --- generate columnDefs ---
  const cols = [{ field: 'rowLabel', headerName: 'Skill / Assessment', pinned: 'left' }]

  f.sections.forEach((section) => {
    section.columns.forEach((col) => {
      cols.push({
        field: col.key,
        headerName: col.label,
        editable: true,
        cellEditor:
          col.valueType === 'number'
            ? 'agNumericCellEditor'
            : col.valueType === 'boolean'
              ? 'agCheckboxCellEditor'
              : 'agTextCellEditor',
      })
    })
  })

  columnDefs.value = cols

  // --- generate rowData ---
  const rows = []
  f.sections.forEach((section) => {
    section.rows.forEach((row) => {
      const rowObj = {
        rowLabel: row.label,
        sectionKey: section.key, // store keys for upsert
        rowKey: row.key,
      }

      section.columns.forEach((col) => {
        rowObj[col.key] = cells[section.key]?.[row.key]?.[col.key] ?? null
      })

      rows.push(rowObj)
    })
  })

  rowData.value = rows
}

// track changes
function onCellValueChanged(event) {
  const { data, colDef, newValue } = event
  if (colDef.field === 'rowLabel') return

  changedCells.push({
    studentId: '1',
    sectionKey: data.sectionKey,
    rowKey: data.rowKey,
    columnKey: colDef.field,
    value: newValue,
  })
}

// optional: call backend to save all changes
async function saveChanges() {
  if (!changedCells.length) return

  console.log(changedCells)
  await api.post(`/evaluations/1/cells`, { changes: changedCells })
  changedCells = []
}

const onGridReady = (params) => console.log('Grid ready', params)
</script>
