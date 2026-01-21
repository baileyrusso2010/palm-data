<template>
  <h1>{{ formName }}</h1>

  <div v-for="section in form.sections" :key="section.key" class="mb-6">
    <h2>{{ section.label }}</h2>
    <div style="height: 300px; width: 100%">
      <AgGridVue
        class="ag-theme-quartz"
        style="height: 100%; width: 100%"
        :columnDefs="getColumnDefs(section)"
        :rowData="getRowData(section)"
        :defaultColDef="defaultColDef"
        :animateRows="true"
        @cell-value-changed="onCellValueChanged(section.key)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import api from '../../api'

const formName = ref('')
const form = reactive({ sections: [] })
const defaultColDef = { flex: 1, editable: true, sortable: true, filter: true }

let cells = {} // backend cells for one student
let changedCells = [] // buffer for edits

onMounted(async () => {
  await getForm()
})

async function getForm() {
  const form_id = 1
  const result = await api.get(`/evaluations/${form_id}`)
  const { form: f, cells: c } = result.data

  formName.value = f.name
  form.sections = f.sections
  cells = c['1'] || {} // only one student for now
}

// Generate columns for a section
function getColumnDefs(section) {
  const cols = [{ field: 'rowLabel', headerName: 'Skill / Assessment', pinned: 'left' }]

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

  return cols
}

// Generate rowData for a section
function getRowData(section) {
  return section.rows.map((row) => {
    const rowObj = {
      rowLabel: row.label,
      sectionKey: section.key,
      rowKey: row.key,
    }

    section.columns.forEach((col) => {
      rowObj[col.key] = cells[section.key]?.[row.key]?.[col.key] ?? null
    })

    return rowObj
  })
}

// Track changes
function onCellValueChanged(sectionKey) {
  return (event) => {
    const { data, colDef, newValue } = event
    if (colDef.field === 'rowLabel') return

    changedCells.push({
      studentId: '1',
      sectionKey,
      rowKey: data.rowKey,
      columnKey: colDef.field,
      value: newValue,
    })
  }
}

// Save all changes to backend
async function saveChanges() {
  if (!changedCells.length) return
  await api.post(`/evaluations/1/cells/bulk`, { changes: changedCells })
  changedCells = []
}
</script>
