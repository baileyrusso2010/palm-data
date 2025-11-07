<template>
  <header class="dashboard-header">
    <h1>21st Century Skills</h1>
  </header>
  <div class="center-table-container">
    <ag-grid-vue
      :theme="gridTheme"
      :rowData="rowData"
      :columnDefs="colDefs"
      :defaultColDef="defaultColDef"
      :suppressKeyboardEvent="suppressKeyboardEvent"
      :stopEditingWhenCellsLoseFocus="false"
      @cell-focused="onCellFocused"
      style="
        height: 500px;
        --ag-header-height: 48px;
        --ag-row-height: 42px;
        --ag-list-item-height: 24px;
        min-width: 900px;
      "
    />
    <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center">
      <v-btn @click="insert">Add Row</v-btn>
      <v-btn @click="save">Save</v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gridTheme } from '@/gridTheme'
import api from '@/api'

onMounted(async () => {
  let response = await api.get('/skill/category/1')

  Object.values(response.data).forEach((item) => {
    rowData.value.push({
      id: item.id,
      title: item.title,
      description: item.description,
      active: item.active,
      category_id: item.category_id,
    })
  })
})
function onCellFocused(e) {
  if (!e?.column) return
  const colId = e.column.getColId ? e.column.getColId() : e.column.colId
  if (colId === 'description' && (e.source === 'keyboard' || !('source' in e))) {
    // defer so focus settles before starting edit
    setTimeout(() => {
      e.api.startEditingCell({ rowIndex: e.rowIndex, colKey: 'description' })
    }, 0)
  }
}
function suppressKeyboardEvent(params) {
  const e = params.event
  if (e.key === 'Tab' && params.colDef?.field === 'description') {
    e.preventDefault()
    if (!params.editing) {
      params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: 'description' })
    }
    return true // tell AG Grid we handled it
  }
  return false
}

function insert() {
  rowData.value.push({ title: '', description: '', active: true, category_id: 1 })
}

async function save() {
  try {
    console.log(rowData.value)
    let response = await api.post('/skill/bulk', rowData.value)

    console.log(response)
  } catch (err) {
    console.error('Error saving data: ', err)
  }
}

const rowData = ref([])

const colDefs = ref([
  { field: 'title', editable: true },
  {
    field: 'description',
    editable: true,
    width: 400, // Increase width as needed
    cellEditor: 'agLargeTextCellEditor',
    cellEditorParams: {
      maxLength: 500,
      rows: 6,
      cols: 50,
    },
  },
  { field: 'active', editable: true },
])

const defaultColDef = {
  editable: true,
}
</script>

<style scoped>
.center-table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #222b45;
  letter-spacing: 0.02em;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
.dashboard-header {
  width: 100%;
  background: #f5f7fa;
  border-bottom: 1px solid #e0e3e7;
  padding: 32px 0 24px 0;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #222b45;
  letter-spacing: 0.02em;
  margin: 0;
  font-family: 'Segoe UI', 'Montserrat', Arial, sans-serif;
}
</style>
