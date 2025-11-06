<template>
  <header class="dashboard-header">
    <h1>NYS Skill Assessment</h1>
  </header>
  <div class="center-table-container">
    <ag-grid-vue
      ref="gridRef"
      :theme="gridTheme"
      :rowData="rowData"
      :columnDefs="colDefs"
      :defaultColDef="defaultColDef"
      style="
        height: 500px;
        --ag-header-height: 48px;
        --ag-row-height: 42px;
        --ag-list-item-height: 24px;
        min-width: 800px;
      "
    />
    <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center">
      <v-btn @click="insert">Add Row</v-btn>
      <v-btn @click="save">Save</v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { gridTheme } from '@/gridTheme'

const gridRef = ref(null)

function insert() {
  if (gridRef.value) {
    gridRef.value.api.applyTransaction({
      add: [{ title: '', description: '', active: true }],
    })
  }
}

async function save() {
  try {
    const allRows = []
    if (gridRef.value) {
      gridRef.value.api.forEachNode((node) => allRows.push(node.data))
    }

    console.log(JSON.stringify(allRows))
  } catch (err) {
    console.error('Error saving data: ', error)
  }
}

const rowData = ref([
  { title: 'Tesla', description: 'Model Y', active: true },
  { title: 'Ford', description: 'F-Series', active: false },
  { title: 'Toyota', description: 'Corolla', active: true },
])

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
</style>

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
