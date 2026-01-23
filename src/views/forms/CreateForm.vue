<template>
  <v-container fluid class="create-form-page pa-6">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="page-title">{{ formName }}</h1>
          <p class="page-subtitle">Manage sections and columns for this evaluation form</p>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div v-for="section in form.sections" :key="section.key" class="mb-6">
      <v-card elevation="2" class="section-card">
        <div class="section-header pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <div>
                <h2 class="section-title">{{ section.label }}</h2>
                <span class="section-meta"
                  >{{ section.columns?.length || 0 }} columns ·
                  {{ section.rows?.length || 0 }} rows</span
                >
              </div>
            </div>
            <div class="d-flex align-center gap-2">
              <v-btn
                size="small"
                prepend-icon="mdi-plus"
                variant="tonal"
                color="primary"
                @click="openAddColumnDialog(section)"
              >
                Add Column
              </v-btn>
              <v-btn
                size="small"
                prepend-icon="mdi-plus"
                variant="tonal"
                color="primary"
                @click="openAddRowDialog(section)"
              >
                Add Row
              </v-btn>
            </div>
          </div>
        </div>

        <v-divider />

        <div class="grid-wrapper">
          <AgGridVue
            class="ag-theme-quartz"
            style="height: 100%; width: 100%"
            :columnDefs="getColumnDefs(section)"
            :rowData="getRowData(section)"
            :defaultColDef="defaultColDef"
            :animateRows="true"
          />
        </div>
      </v-card>
    </div>

    <!-- Add Section Card -->
    <v-card class="add-section-card" @click="showAddSectionDialog = true">
      <div class="d-flex flex-column align-center justify-center py-8">
        <v-avatar size="48" color="primary" variant="tonal" class="mb-3">
          <v-icon size="24">mdi-plus</v-icon>
        </v-avatar>
        <span class="add-section-text">Add New Section</span>
        <span class="add-section-hint">Click to create a new evaluation section</span>
      </div>
    </v-card>

    <!-- Add Section Modal -->
    <v-dialog v-model="showAddSectionDialog" max-width="500" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon class="mr-2" color="primary">mdi-folder-plus</v-icon>
          Add New Section
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="newSectionName"
            label="Section Name"
            placeholder="Enter section name"
            variant="outlined"
            autofocus
            hide-details="auto"
            @keyup.enter="confirmAddSection"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="cancelAddSection">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!newSectionName.trim()"
            @click="confirmAddSection"
          >
            Create Section
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Column Modal -->
    <v-dialog v-model="showAddColumnDialog" max-width="500" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon class="mr-2" color="primary">mdi-table-column-plus-after</v-icon>
          Add New Column
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="newColumnLabel"
            label="Column Label"
            placeholder="Enter column label"
            variant="outlined"
            class="mb-4"
            autofocus
            hide-details="auto"
          />
          <v-select
            v-model="newColumnType"
            :items="['number', 'boolean', 'text']"
            label="Column Type"
            variant="outlined"
            hide-details="auto"
          />

          <div v-if="newColumnType === 'number'" class="d-flex gap-4 mt-4">
            <v-text-field
              v-model.number="newColumnMin"
              label="Min Value"
              type="number"
              variant="outlined"
              hide-details="auto"
            />
            <v-text-field
              v-model.number="newColumnMax"
              label="Max Value"
              type="number"
              variant="outlined"
              hide-details="auto"
            />
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="cancelAddColumn">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!newColumnLabel.trim() || !newColumnType"
            @click="confirmAddColumn"
          >
            Create Column
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAddRowDialog" max-width="500" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon class="mr-2" color="primary">mdi-table-row-plus-after</v-icon>
          Add New Row
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="newRowLabel"
            label="Row Label"
            placeholder="Enter Row label"
            variant="outlined"
            class="mb-4"
            autofocus
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="cancelAddRow">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!newRowLabel.trim()"
            @click="confirmAddRow"
          >
            Create Row
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.create-form-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Section Cards */
.section-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}

.section-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.section-header {
  background: #ffffff;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

.grid-wrapper {
  height: 320px;
  width: 100%;
  background: #ffffff;
}

/* Add Section Card */
.add-section-card {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: transparent;
  box-shadow: none !important;
}

.add-section-card:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.04);
}

.add-section-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.add-section-hint {
  font-size: 0.813rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Dialog Cards */
.dialog-card {
  border-radius: 12px;
}

.dialog-title {
  font-size: 1.25rem !important;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem 0.5rem !important;
}

/* Vuetify Overrides */
:deep(.v-card) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

:deep(.ag-theme-quartz) {
  --ag-border-color: #e2e8f0;
  --ag-header-background-color: #f8fafc;
  --ag-odd-row-background-color: #ffffff;
  --ag-row-hover-color: #f1f5f9;
}
</style>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import api from '../../api'

const formName = ref('')
const form = reactive({ sections: [] })
const defaultColDef = { flex: 1, editable: true, sortable: true, filter: true }

// Add Section Modal state
const showAddSectionDialog = ref(false)
const newSectionName = ref('')

// Add Column Modal state
const showAddColumnDialog = ref(false)
const newColumnLabel = ref('')
const newColumnType = ref('text')
const newColumnMin = ref(null)
const newColumnMax = ref(null)
const activeSectionId = ref(null)

const showAddRowDialog = ref(false)
const newRowLabel = ref('')

onMounted(async () => {
  await getForm()
})

async function getForm() {
  const form_id = 1
  const result = await api.get(`/evaluations/templates/${form_id}`)
  const _form = result.data.form

  formName.value = _form.name
  form.sections = _form.sections
}

// Generate columns for a section
function getColumnDefs(section) {
  const cols = [{ field: 'rowLabel', headerName: 'Skill / Assessment', pinned: 'left' }]

  section.columns.forEach((col) => {
    cols.push({
      field: col.key,
      headerName: col.label,
      editable: true,
      headerTooltip: 'Testing',
      editable: false,
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

    // section.columns.forEach((col) => {
    //   rowObj[col.key] = null
    // })

    return rowObj
  })
}

// SECTION
function cancelAddSection() {
  showAddSectionDialog.value = false
  newSectionName.value = ''
}

async function confirmAddSection() {
  const name = newSectionName.value.trim()
  if (!name) return

  const form_id = 1
  await api.post(`/evaluations/templates/${form_id}/sections`, { label: name })

  // Refresh the form to get the new section
  await getForm()

  // Reset and close dialog
  newSectionName.value = ''
  showAddSectionDialog.value = false
}

// COLUMN
function openAddColumnDialog(section) {
  activeSectionId.value = section.id
  newColumnLabel.value = ''
  newColumnType.value = 'text'
  newColumnMin.value = null
  newColumnMax.value = null
  showAddColumnDialog.value = true
}

function cancelAddColumn() {
  showAddColumnDialog.value = false
  newColumnLabel.value = ''
  newColumnType.value = 'text'
  newColumnMin.value = null
  newColumnMax.value = null
  activeSectionId.value = null
}

// ROW
function openAddRowDialog(section) {
  activeSectionId.value = section.id
  newRowLabel.value = ''
  showAddRowDialog.value = true
}

function cancelAddRow() {
  newRowLabel.value = ''
  activeSectionId.value = null
  showAddRowDialog.value = false
}

async function confirmAddRow() {
  if (!newRowLabel.value.trim() || !activeSectionId.value) return

  const form_id = 1
  const label = newRowLabel.value.trim()
  // Generate a key from the label (simple lowercase snake_case)
  const key = label.toLowerCase().replace(/\s+/g, '_') //maybe move to backend

  await api.post(`/evaluations/templates/${form_id}/sections/${activeSectionId.value}/rows`, {
    label,
    key,
    description: '',
    row_type: 'text',
  })

  await getForm()
  cancelAddRow()
}

async function confirmAddColumn() {
  if (!newColumnLabel.value.trim() || !activeSectionId.value) return

  const form_id = 1
  const label = newColumnLabel.value.trim()
  // Generate a key from the label (simple lowercase snake_case)
  const key = label.toLowerCase().replace(/\s+/g, '_')

  const config = {}
  if (newColumnType.value === 'number') {
    if (newColumnMin.value !== null && newColumnMin.value !== '') config.min = newColumnMin.value
    if (newColumnMax.value !== null && newColumnMax.value !== '') config.max = newColumnMax.value
  }

  await api.post(`/evaluations/templates/${form_id}/sections/${activeSectionId.value}/columns`, {
    label,
    key,
    value_type: newColumnType.value,
    config,
  })

  await getForm()
  cancelAddColumn()
}
</script>
