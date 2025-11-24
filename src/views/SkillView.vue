<template>
  <header class="dashboard-header">
    <h1>Skills</h1>
  </header>
  <div class="center-table-container">
    <div style="width: 320px; margin: 0 auto 12px auto">
      <v-select
        v-model="selectedCategoryId"
        :items="categories"
        item-title="name"
        item-value="id"
        label="Category"
        variant="outlined"
        density="comfortable"
        :disabled="isLoading"
        @update:modelValue="onCategoryChange"
      />
    </div>
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
  <v-snackbar v-model="snackbar.open" :timeout="2000" :color="snackbar.color">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" size="small" @click="snackbar.open = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// Snackbar state
const snackbar = ref({ open: false, message: '', color: 'success' })
import { gridTheme } from '@/gridTheme'
import api from '@/api'

const isLoading = ref(false)
const categories = ref([])
const selectedCategoryId = ref(null)

const rowData = ref([])

const colDefs = ref([
  { field: 'label', editable: true },
  {
    field: 'description',
    editable: true,
    width: 400,
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

onMounted(async () => {
  await loadCategories()
  if (selectedCategoryId.value) {
    await loadCategoryRows(selectedCategoryId.value)
  }
})

async function loadCategories() {
  try {
    const { data } = await api.get('/rubric/sections/form/13')
    console.log(data)
    categories.value = Array.isArray(data) ? data : []
    selectedCategoryId.value = categories.value[0]?.id ?? null
  } catch (e) {
    console.error('Error loading categories', e)
    categories.value = []
  }
}

async function loadCategoryRows(categoryId) {
  isLoading.value = true
  rowData.value = []
  try {
    console.log(categoryId)
    const response = await api.get(`/rubric/section/${categoryId}/rows`)
    console.log(response)
    Object.values(response.data).forEach((item) => {
      rowData.value.push({
        id: item.id,
        label: item.label,
        description: item.description,
        active: item.active,
        // category_id: item.category_id,
      })
    })
  } catch (err) {
    console.error('Error loading category rows', err)
  } finally {
    isLoading.value = false
  }
}

async function onCategoryChange(val) {
  if (val == null) return
  await loadCategoryRows(val)
}

function onCellFocused(e) {
  if (!e?.column) return
  const colId = e.column.getColId ? e.column.getColId() : e.column.colId
  if (colId === 'description' && (e.source === 'keyboard' || !('source' in e))) {
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
    return true
  }
  return false
}

function insert() {
  rowData.value.push({
    label: '',
    description: '',
    active: true,
    category_id: selectedCategoryId.value ?? null,
  })
}

async function save() {
  try {
    // Save each row: PUT if id exists, POST if not
    for (const row of rowData.value) {
      const payload = { ...row, rubric_section_id: selectedCategoryId.value }
      if (row.id) {
        await api.put(`/rubric/rows/${row.id}`, payload)
      } else {
        await api.post('/rubric/rows', payload)
      }
    }
    await loadCategoryRows(selectedCategoryId.value)
    snackbar.value = {
      open: true,
      message: 'Skills saved successfully!',
      color: 'success',
    }
  } catch (err) {
    console.error('Error saving data: ', err)
    snackbar.value = {
      open: true,
      message: 'Failed to save skills.',
      color: 'error',
    }
  }
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
