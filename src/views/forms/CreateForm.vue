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
                v-if="section.section_type !== 'linked'"
                size="small"
                variant="tonal"
                color="primary"
                @click="openAddColumnDialog(section)"
              >
                <PhColumnsPlusLeft :size="20" class="mr-2" />
                Add Column
              </v-btn>
              <v-btn
                v-if="section.section_type !== 'linked'"
                size="small"
                variant="tonal"
                color="primary"
                @click="openAddRowDialog(section)"
              >
                <PhRowsPlusTop :size="20" class="mr-2" />
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
    <v-card v-if="formId" class="add-section-card" @click="showAddSectionDialog = true">
      <div class="d-flex flex-column align-center justify-center py-8">
        <v-avatar size="64" color="primary" variant="tonal" class="mb-4">
          <v-icon size="32">mdi-plus</v-icon>
        </v-avatar>
        <span class="add-section-text">Add New Section</span>
        <span class="add-section-hint">Click to create a new evaluation section</span>
      </div>
    </v-card>

    <!-- Template Selection Modal -->
    <v-dialog
      v-model="showCreateFormDialog"
      max-width="600"
      persistent
      attach=".create-form-page"
      contained
    >
      <v-card class="dialog-card overflow-hidden">
        <!-- Header Section -->
        <div class="dialog-header pa-6 pb-2">
          <div class="d-flex align-center gap-3 mb-2">
            <v-avatar color="primary" variant="tonal" size="48">
              <PhFilePlus :size="24" weight="bold" />
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold text-slate-900 mb-1">Evaluation Template</h2>
              <p class="text-body-2 text-slate-500">
                Start fresh or continue from an existing template
              </p>
            </div>
          </div>
        </div>

        <!-- Custom Tabs -->
        <div class="px-6">
          <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="dialog-tabs">
            <v-tab value="new" class="text-capitalize" rounded="t-lg">
              <v-icon start class="mr-2">mdi-plus-box-outline</v-icon>
              Create New
            </v-tab>
            <v-tab value="existing" class="text-capitalize" rounded="t-lg">
              <v-icon start class="mr-2">mdi-file-document-edit-outline</v-icon>
              Edit Existing
            </v-tab>
          </v-tabs>
          <v-divider />
        </div>

        <v-card-text class="pa-6 pt-6">
          <v-window v-model="activeTab">
            <!-- Create New Tab -->
            <v-window-item value="new">
              <div class="window-content">
                <v-label class="mb-2 font-weight-medium text-slate-700">Template Name</v-label>
                <v-text-field
                  v-model="newFormName"
                  placeholder="e.g., Q1 Performance Review"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  color="primary"
                  autofocus
                  hide-details="auto"
                  @keyup.enter="createForm"
                >
                  <template #prepend-inner>
                    <v-icon color="slate-400" size="small">mdi-rename-box</v-icon>
                  </template>
                </v-text-field>

                <div class="d-flex justify-end mt-8">
                  <v-btn
                    color="primary"
                    size="large"
                    variant="flat"
                    elevation="2"
                    :disabled="!newFormName.trim()"
                    @click="createForm"
                    class="px-6"
                  >
                    Start Building
                    <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <!-- Edit Existing Tab -->
            <v-window-item value="existing">
              <div class="window-content">
                <v-label class="mb-2 font-weight-medium text-slate-700">Select Template</v-label>
                <v-select
                  v-model="selectedTemplateId"
                  :items="templates"
                  item-title="name"
                  item-value="id"
                  placeholder="Search templates..."
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  color="primary"
                  hide-details="auto"
                  no-data-text="No templates found"
                  menu-icon="mdi-chevron-down"
                >
                  <template #prepend-inner>
                    <v-icon color="slate-400" size="small">mdi-format-list-bulleted</v-icon>
                  </template>
                </v-select>

                <div class="d-flex justify-end mt-8">
                  <v-btn
                    color="primary"
                    size="large"
                    variant="flat"
                    elevation="2"
                    :disabled="!selectedTemplateId"
                    @click="loadSelectedTemplate"
                    class="px-6"
                  >
                    Load Template
                    <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>

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
            class="mb-6"
            @keyup.enter="confirmAddSection"
          />

          <v-label class="mb-2 font-weight-medium">Data Mode</v-label>

          <div class="d-flex gap-4 mb-6">
            <v-card
              @click="newSectionDataMode = 'manual'"
              :variant="newSectionDataMode === 'manual' ? 'tonal' : 'outlined'"
              :color="newSectionDataMode === 'manual' ? 'primary' : 'slate-300'"
              class="flex-1-1 pa-4 cursor-pointer selection-card"
              :class="{ selected: newSectionDataMode === 'manual' }"
            >
              <div class="d-flex flex-column align-center gap-2">
                <PhKeyboard
                  :size="32"
                  :weight="newSectionDataMode === 'manual' ? 'fill' : 'regular'"
                />
                <span class="font-weight-medium">Manual Input</span>
              </div>
            </v-card>

            <v-card
              @click="newSectionDataMode = 'linked'"
              :variant="newSectionDataMode === 'linked' ? 'tonal' : 'outlined'"
              :color="newSectionDataMode === 'linked' ? 'primary' : 'slate-300'"
              class="flex-1-1 pa-4 cursor-pointer selection-card"
              :class="{ selected: newSectionDataMode === 'linked' }"
            >
              <div class="d-flex flex-column align-center gap-2">
                <PhLink :size="32" :weight="newSectionDataMode === 'linked' ? 'fill' : 'regular'" />
                <span class="font-weight-medium">Linked Data</span>
              </div>
            </v-card>
          </div>

          <v-slide-y-transition>
            <div v-if="newSectionDataMode === 'linked'">
              <v-select
                v-model="newSectionLinkedSource"
                :items="[{ title: 'WBL', value: 'wbl_hours' }]"
                item-title="title"
                item-value="value"
                label="Source"
                placeholder="Select data source"
                variant="outlined"
                hide-details="auto"
              >
                <template #prepend-inner>
                  <PhDatabase :size="20" class="text-medium-emphasis mr-1" />
                </template>
              </v-select>
            </div>
          </v-slide-y-transition>

          <v-divider class="my-4" />

          <v-switch
            v-model="newSectionUsesRubric"
            label="Uses Rubric"
            hint="Enable if this section should be graded using a rubric"
            persistent-hint
            color="primary"
            hide-details="auto"
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
              :disabled="activeSection?.uses_rubric"
              :hint="activeSection?.uses_rubric ? 'Determined by rubric' : ''"
              :persistent-hint="activeSection?.uses_rubric"
            />
            <v-text-field
              v-model.number="newColumnMax"
              label="Max Value"
              type="number"
              variant="outlined"
              hide-details="auto"
              :disabled="activeSection?.uses_rubric"
              :hint="activeSection?.uses_rubric ? 'Determined by rubric' : ''"
              :persistent-hint="activeSection?.uses_rubric"
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

    <!-- Edit Section Dialog -->
    <v-dialog v-model="showEditSectionDialog" max-width="500" persistent>
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <PhGear :size="24" class="mr-2 text-secondary" weight="fill" />
          Section Settings
        </v-card-title>
        <v-card-text class="pt-4">
          <v-label class="mb-2 font-weight-medium">Data Mode</v-label>

          <div class="d-flex gap-4 mb-6">
            <v-card
              @click="editSectionData.dataMode = 'manual'"
              :variant="editSectionData.dataMode === 'manual' ? 'tonal' : 'outlined'"
              :color="editSectionData.dataMode === 'manual' ? 'primary' : 'slate-300'"
              class="flex-1-1 pa-4 cursor-pointer selection-card"
              :class="{ selected: editSectionData.dataMode === 'manual' }"
            >
              <div class="d-flex flex-column align-center gap-2">
                <PhKeyboard
                  :size="32"
                  :weight="editSectionData.dataMode === 'manual' ? 'fill' : 'regular'"
                />
                <span class="font-weight-medium">Manual Input</span>
              </div>
            </v-card>

            <v-card
              @click="editSectionData.dataMode = 'linked'"
              :variant="editSectionData.dataMode === 'linked' ? 'tonal' : 'outlined'"
              :color="editSectionData.dataMode === 'linked' ? 'primary' : 'slate-300'"
              class="flex-1-1 pa-4 cursor-pointer selection-card"
              :class="{ selected: editSectionData.dataMode === 'linked' }"
            >
              <div class="d-flex flex-column align-center gap-2">
                <PhLink
                  :size="32"
                  :weight="editSectionData.dataMode === 'linked' ? 'fill' : 'regular'"
                />
                <span class="font-weight-medium">Linked Data</span>
              </div>
            </v-card>
          </div>

          <v-slide-y-transition>
            <div v-if="editSectionData.dataMode === 'linked'">
              <v-select
                v-model="editSectionData.linkedSource"
                :items="[{ title: 'WBL', value: 'wbl_hours' }]"
                item-title="title"
                item-value="value"
                label="Source"
                placeholder="Select data source"
                variant="outlined"
                hide-details="auto"
              >
                <template #prepend-inner>
                  <PhDatabase :size="20" class="text-medium-emphasis mr-1" />
                </template>
              </v-select>
            </div>
          </v-slide-y-transition>

          <v-divider class="my-4" />

          <v-switch
            v-model="editSectionData.usesRubric"
            label="Uses Rubric"
            hint="Enable if this section should be graded using a rubric"
            persistent-hint
            color="primary"
            hide-details="auto"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="showEditSectionDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="saveSectionSettings"> Save Changes </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <v-snackbar v-model="snackbar" :color="snackbarColor">
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn variant="text" @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'
import api from '../../api'
import {
  PhColumnsPlusLeft,
  PhRowsPlusTop,
  PhFilePlus,
  PhGear,
  PhKeyboard,
  PhLink,
  PhDatabase,
} from '@phosphor-icons/vue'
import '../../styles/CreateTemplateForm.css'

const route = useRoute()
const router = useRouter()

const formId = ref(null)
const formName = ref('')
const form = reactive({ sections: [] })
const defaultColDef = { flex: 1, editable: true, sortable: true, filter: true }

// Create Form Modal state
const showCreateFormDialog = ref(false)
const newFormName = ref('')
const activeTab = ref('new')
const templates = ref([])
const selectedTemplateId = ref(null)

// Add Section Modal state
const showAddSectionDialog = ref(false)
const newSectionName = ref('')
const newSectionDataMode = ref('manual')
const newSectionLinkedSource = ref(null)
const newSectionUsesRubric = ref(false)

// Add Column Modal state
const showAddColumnDialog = ref(false)
const newColumnLabel = ref('')
const newColumnType = ref('text')
const newColumnMin = ref(null)
const newColumnMax = ref(null)
const activeSectionId = ref(null)
const activeSection = ref(null)

const showAddRowDialog = ref(false)
const newRowLabel = ref('')

// Edit Section Modal state
const showEditSectionDialog = ref(false)
const sectionToEdit = ref(null)
const editSectionData = reactive({
  dataMode: 'manual',
  linkedSource: null,
  usesRubric: false,
})

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

onMounted(async () => {
  if (route.query.id) {
    formId.value = route.query.id
    await getForm()
  } else {
    // If no ID, fetch templates and show dialog
    await fetchTemplates()
    showCreateFormDialog.value = true
  }
})

async function fetchTemplates() {
  try {
    const res = await api.get('/evaluations/templates')
    templates.value = res.data
  } catch (e) {
    console.error('Error fetching templates', e)
  }
}

async function loadSelectedTemplate() {
  if (!selectedTemplateId.value) return
  formId.value = selectedTemplateId.value
  await getForm()

  // Add id to url
  router.replace({ query: { ...route.query, id: formId.value } })

  showCreateFormDialog.value = false
}

async function createForm() {
  const name = newFormName.value.trim()
  if (!name) return

  try {
    const result = await api.post('/evaluations/templates', { name })
    formId.value = result.data.id
    formName.value = result.data.name

    // Add id to url
    router.replace({ query: { ...route.query, id: formId.value } })

    showCreateFormDialog.value = false

    snackbarMessage.value = 'Form created successfully'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Error creating form'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function getForm() {
  if (!formId.value) return
  const result = await api.get(`/evaluations/templates/${formId.value}`)
  const _form = result.data.form
  console.log(_form)

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
      editable: col.config?.editable !== false, // Default to editable unless explicitly disabled
      headerTooltip: col.label,
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
  newSectionDataMode.value = 'manual'
  newSectionLinkedSource.value = null
  newSectionUsesRubric.value = false
}

async function confirmAddSection() {
  const name = newSectionName.value.trim()
  if (!name || !formId.value) return

  try {
    const res = await api.post(`/evaluations/templates/${formId.value}/sections`, {
      label: name,
      section_type: newSectionDataMode.value,
      source_table: newSectionLinkedSource.value,
      uses_rubric: newSectionUsesRubric.value,
    })

    if (newSectionDataMode.value === 'linked' && newSectionLinkedSource.value === 'wbl_hours') {
      const newSection = res.data
      const columns = [
        { label: 'Date', key: 'date', value_type: 'text' },
        { label: 'Category', key: 'category', value_type: 'text' },
        { label: 'Hours', key: 'hours', value_type: 'number' },
        { label: 'Comments', key: 'comments', value_type: 'text' },
      ]

      for (const col of columns) {
        await api.post(`/evaluations/templates/${formId.value}/sections/${newSection.id}/columns`, {
          label: col.label,
          key: col.key,
          value_type: col.value_type,
          config: { editable: false },
        })
      }
    }

    // Refresh the form to get the new section
    await getForm()

    // Reset and close dialog
    newSectionName.value = ''
    newSectionDataMode.value = 'manual'
    newSectionLinkedSource.value = null
    newSectionUsesRubric.value = false
    showAddSectionDialog.value = false

    snackbarMessage.value = 'Section created successfully'
    snackbar.value = true
  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Error creating section'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

function openEditSectionDialog(section) {
  sectionToEdit.value = section
  editSectionData.dataMode = section.section_type || 'manual'
  editSectionData.linkedSource = section.source_table || null
  editSectionData.usesRubric = section.uses_rubric || false
  showEditSectionDialog.value = true
}

async function saveSectionSettings() {
  if (!sectionToEdit.value || !formId.value) return

  try {
    await api.patch(`/evaluations/templates/${formId.value}/sections/${sectionToEdit.value.id}`, {
      section_type: editSectionData.dataMode,
      source_table: editSectionData.linkedSource,
      uses_rubric: editSectionData.usesRubric,
    })

    // Update local state
    sectionToEdit.value.section_type = editSectionData.dataMode
    sectionToEdit.value.source_table = editSectionData.linkedSource
    sectionToEdit.value.uses_rubric = editSectionData.usesRubric

    showEditSectionDialog.value = false
    snackbarMessage.value = 'Section settings updated'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Error updating section settings'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

// COLUMN
function openAddColumnDialog(section) {
  activeSectionId.value = section.id
  activeSection.value = section
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
  activeSection.value = null
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
  if (!newRowLabel.value.trim() || !activeSectionId.value || !formId.value) return

  try {
    const label = newRowLabel.value.trim()
    // Generate a key from the label (simple lowercase snake_case)
    const key = label.toLowerCase().replace(/\s+/g, '_') //maybe move to backend

    await api.post(
      `/evaluations/templates/${formId.value}/sections/${activeSectionId.value}/rows`,
      {
        label,
        key,
        description: '',
        row_type: 'text',
      },
    )

    await getForm()
    cancelAddRow()

    snackbarMessage.value = 'Row created successfully'
    snackbar.value = true
  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Error creating row'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function confirmAddColumn() {
  if (!newColumnLabel.value.trim() || !activeSectionId.value || !formId.value) return

  try {
    const label = newColumnLabel.value.trim()
    // Generate a key from the label (simple lowercase snake_case)
    const key = label.toLowerCase().replace(/\s+/g, '_')

    const config = { editable: true }
    if (newColumnType.value === 'number') {
      if (newColumnMin.value !== null && newColumnMin.value !== '') config.min = newColumnMin.value
      if (newColumnMax.value !== null && newColumnMax.value !== '') config.max = newColumnMax.value
    }

    await api.post(
      `/evaluations/templates/${formId.value}/sections/${activeSectionId.value}/columns`,
      {
        label,
        key,
        value_type: newColumnType.value,
        config,
      },
    )

    await getForm()
    cancelAddColumn()

    snackbarMessage.value = 'Column created successfully'
    snackbar.value = true
  } catch (e) {
    console.error(e)
    snackbarMessage.value = 'Error creating column'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>
