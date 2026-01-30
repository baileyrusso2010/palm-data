<template>
  <v-container fluid class="d-flex align-center justify-center fill-height bg-grey-lighten-5 pa-0">
    <v-card class="w-100 h-100 rounded-0 d-flex flex-column" flat>
      <!-- Header -->
      <div class="px-8 py-6 bg-white border-b border-opacity-50 text-center">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">New Evaluation</h1>
        <p class="text-subtitle-1 text-grey-darken-1 mt-1">
          Select a form to begin the evaluation process
        </p>
      </div>

      <!-- Main Content -->
      <v-row class="flex-grow-1 ma-0 overflow-hidden">
        <!-- Sidebar / Stepper Indicator -->
        <v-col cols="12" md="3" lg="2" class="bg-grey-lighten-5 border-e pa-0 hidden-sm-and-down">
          <v-list class="bg-transparent py-4 text-left">
            <v-list-item
              prepend-icon="mdi-file-document-outline"
              title="Select Form"
              subtitle="Step 1"
              :active="currentStep === 1"
              :color="currentStep === 1 ? 'primary' : ''"
              @click="currentStep > 1 ? (currentStep = 1) : null"
              :class="{ 'cursor-pointer': currentStep > 1 }"
            >
              <template v-slot:append v-if="currentStep > 1">
                <v-icon color="success">mdi-check</v-icon>
              </template>
            </v-list-item>
            <v-list-item
              prepend-icon="mdi-account-details-outline"
              title="Edit Form"
              subtitle="Step 2"
              :active="currentStep === 2"
              :color="currentStep === 2 ? 'primary' : ''"
              :disabled="currentStep < 2"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-rocket-launch-outline"
              title="Deploy Form"
              subtitle="Step 3"
              :active="currentStep === 3"
              :color="currentStep === 3 ? 'primary' : ''"
              :disabled="currentStep < 3"
            ></v-list-item>
          </v-list>
        </v-col>

        <!-- Dynamic Content Area -->
        <v-col cols="12" md="9" lg="10" class="d-flex flex-column h-100 pa-0 bg-white">
          <div class="flex-grow-1 d-flex flex-column overflow-hidden">
            <!-- STEP 1: SELECT FORM -->
            <div v-if="currentStep === 1" class="h-100 d-flex flex-column">
              <!-- Search / Filter -->
              <div class="px-8 pt-8 pb-4">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="Search forms..."
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="max-width-600 rounded-lg"
                  bg-color="grey-lighten-5"
                ></v-text-field>
              </div>

              <!-- Scrollable List -->
              <div class="flex-grow-1 overflow-y-auto px-8 pb-4">
                <v-item-group v-model="selectedFormId">
                  <v-row>
                    <v-col v-for="form in filteredForms" :key="form.id" cols="12" lg="6" xl="4">
                      <v-item v-slot="{ isSelected, toggle }" :value="form.id">
                        <v-card
                          :color="isSelected ? 'primary-lighten-5' : 'white'"
                          :class="[
                            'transition-swing',
                            isSelected
                              ? 'border-primary v-card--active-border'
                              : 'border-grey-lighten-2',
                          ]"
                          class="d-flex align-center pa-4 cursor-pointer rounded-lg border"
                          elevation="0"
                          @click="toggle"
                          height="100%"
                        >
                          <!-- Icon Box -->
                          <v-avatar
                            :color="isSelected ? 'primary' : 'grey-lighten-4'"
                            :variant="isSelected ? 'flat' : 'flat'"
                            size="56"
                            class="rounded-lg mr-4"
                          >
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'" size="28">
                              {{ form.icon || 'mdi-file-edit-outline' }}
                            </v-icon>
                          </v-avatar>

                          <!-- Content -->
                          <div class="flex-grow-1">
                            <div class="d-flex justify-space-between align-start mb-1">
                              <h3
                                :class="isSelected ? 'text-primary' : 'text-grey-darken-3'"
                                class="text-h6 font-weight-bold mb-0"
                              >
                                {{ form.title }}
                              </h3>
                              <v-chip
                                size="x-small"
                                :color="form.categoryColor"
                                variant="tonal"
                                class="font-weight-medium"
                              >
                                {{ form.category }}
                              </v-chip>
                            </div>
                            <p class="text-body-2 text-grey-darken-1 mb-2 clamp-2">
                              {{ form.description }}
                            </p>
                            <div class="d-flex align-center text-caption text-grey">
                              <v-icon size="small" class="mr-1">mdi-format-list-checks</v-icon>
                              <span class="mr-3">{{ form.sections }} Sections</span>
                              <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                              <span>~{{ form.estimatedTime }} mins</span>
                            </div>
                          </div>

                          <!-- Checkmark -->
                          <div class="ml-4">
                            <v-icon
                              v-if="isSelected"
                              color="primary"
                              icon="mdi-check-circle"
                              size="32"
                            ></v-icon>
                            <v-icon
                              v-else
                              color="grey-lighten-2"
                              icon="mdi-circle-outline"
                              size="32"
                            ></v-icon>
                          </div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-item-group>

                <div v-if="filteredForms.length === 0" class="text-center mt-12">
                  <v-icon size="64" color="grey-lighten-2">mdi-file-search-outline</v-icon>
                  <h3 class="text-h6 text-grey mt-4">No forms found</h3>
                </div>
              </div>
            </div>

            <!-- STEP 2: EDIT FORM -->
            <div v-if="currentStep === 2" class="h-100 d-flex flex-column">
              <div v-if="loadingForm" class="h-100 d-flex align-center justify-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              <div v-else class="flex-grow-1 d-flex flex-column overflow-hidden">
                <div
                  class="px-8 py-4 bg-grey-lighten-5 border-b d-flex justify-space-between align-center"
                >
                  <div>
                    <h2 class="text-h6 font-weight-bold">Edit Form: {{ fetchedForm?.name }}</h2>
                    <p class="text-caption text-grey-darken-1">
                      Add or modify rows for each section.
                    </p>
                  </div>
                </div>

                <div class="flex-grow-1 overflow-y-auto px-8 py-6 bg-grey-lighten-5">
                  <!-- Render Sections -->
                  <div v-for="section in fetchedForm?.sections" :key="section.key" class="mb-6">
                    <v-card elevation="2" class="rounded-lg border border-opacity-50">
                      <div
                        class="px-4 py-3 bg-white border-b d-flex align-center justify-space-between"
                      >
                        <div>
                          <h3 class="text-subtitle-1 font-weight-bold text-grey-darken-3">
                            {{ section.label }}
                          </h3>
                          <span class="text-caption text-grey"
                            >{{ section.rows?.length || 0 }} rows</span
                          >
                        </div>
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

                      <!-- Grid Placeholder -> We will inject AgGrid here -->
                      <div style="height: 300px; width: 100%">
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
                </div>
              </div>
            </div>

            <!-- STEP 3: DEPLOY FORM -->
            <div v-if="currentStep === 3" class="h-100">
              <div class="h-100 d-flex flex-column align-center justify-center text-center pa-8">
                <v-avatar color="primary-lighten-5" size="120" class="mb-6">
                  <v-icon size="64" color="primary">mdi-rocket-launch-outline</v-icon>
                </v-avatar>
                <h2 class="text-h4 font-weight-bold mb-4 text-grey-darken-3">Deploy Form</h2>
                <p
                  v-if="isArray || mockClasses.length > 1"
                  class="text-body-1 text-grey-darken-1 max-width-600 mb-8"
                >
                  Select a class to deploy this form to.
                </p>

                <div v-if="!isArray && mockClasses.length > 0" class="mb-6">
                  <div
                    class="text-h5 font-weight-medium text-primary d-flex align-center justify-center"
                  >
                    <v-icon icon="mdi-school" class="mr-2"></v-icon>
                    {{ mockClasses[0].name }}
                  </div>
                </div>

                <v-select
                  v-else
                  v-model="selectedClass"
                  :items="mockClasses"
                  item-title="name"
                  item-value="id"
                  label="Select Class"
                  placeholder="Choose a class"
                  variant="outlined"
                  class="mb-6 w-100 max-width-400"
                  prepend-inner-icon="mdi-school-outline"
                ></v-select>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-8 py-6 border-t bg-white d-flex align-center justify-end">
            <div
              v-if="selectedFormId && currentStep === 1"
              class="mr-auto d-flex align-center text-body-2 text-grey-darken-2"
            >
              <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
              Selected: <span class="font-weight-bold ml-1">{{ getSelectedForm?.title }}</span>
            </div>
            <div
              v-if="currentStep > 1"
              class="mr-auto d-flex align-center text-body-2 text-grey-darken-2"
            >
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-arrow-left"
                @click="currentStep--"
                >Back</v-btn
              >
            </div>

            <v-btn
              variant="text"
              color="grey-darken-1"
              class="mr-4 text-none font-weight-regular"
              size="large"
              @click="handleCancel"
            >
              Cancel
            </v-btn>
            <v-btn
              color="black"
              size="large"
              class="px-8 text-none font-weight-bold rounded-lg"
              elevation="2"
              :disabled="!canContinue"
              @click="handleContinue"
            >
              {{ currentStep === 3 ? 'Deploy' : 'Continue' }}
              <v-icon right class="ml-2">{{
                currentStep === 3 ? 'mdi-rocket-launch' : 'mdi-arrow-right'
              }}</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Add Row Dialog -->
    <v-dialog v-model="showAddRowDialog" max-width="500" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center px-6 py-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-table-row-plus-after</v-icon>
          Add New Row
        </v-card-title>
        <v-card-text class="pt-6 px-6">
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
        <v-card-actions class="pa-4 pt-2 px-6">
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

  <v-snackbar v-model="snackbar" :timeout="timeout" :color="snackbarColor">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import api from '@/api'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'

const router = useRouter()
const route = useRoute()
const search = ref('')
const selectedFormId = ref<number | null>(null)
const currentStep = ref(1)
const loadingForm = ref(false)
const fetchedForm = ref<any>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const timeout = ref(2000)
// Mock Data
const forms = ref<any[]>([])

// AgGrid Config
const defaultColDef = { flex: 1, editable: false, sortable: true, filter: true }

// Add Row State
const showAddRowDialog = ref(false)
const newRowLabel = ref('')
const activeSectionId = ref<number | null>(null)

// Deploy State
const selectedClass = ref<number | null>(null)
const mockClasses = ref<any[]>([])

const isArray = ref(false)

onMounted(async () => {
  const classId = route.query.classId ? Number(route.query.classId) : null
  await Promise.all([getForms(), getTeacherCourses(classId)])
})

async function getTeacherCourses(classId: number | null) {
  try {
    let endPoint = '/course-instances/teacher/1'
    if (classId !== null && !isNaN(classId)) {
      endPoint = `/course-instances/${classId}`
    }

    const results = await api.get(endPoint)
    mockClasses.value = []

    if (Array.isArray(results.data)) {
      isArray.value = true
      for (const course of results.data) {
        mockClasses.value.push({
          id: course.id,
          name: course.alias,
        })
      }
    } else {
      isArray.value = false
      mockClasses.value.push({
        id: results.data.id,
        name: results.data.alias,
      })
    }

    if (mockClasses.value.length === 1) {
      selectedClass.value = mockClasses.value[0].id
    }

    console.log(results)
  } catch (e) {
    console.error('Failed to fetch teacher courses', e)
    snackbar.value = true
    snackbarText.value = 'Failed to fetch teacher courses'
    snackbarColor.value = 'error'
  }
}

async function getForms() {
  try {
    const results = await api.get('/evaluations/templates')

    // Clear existing forms to avoid duplicates if called multiple times
    forms.value = []

    results.data.forEach((element: any) => {
      // Create a mapped object that matches what the UI expects
      // Providing defaults for fields that might not come from the API yet
      forms.value.push({
        id: element.id,
        title: element.name || 'Untitled Form',
        description: element.description || 'No description available',
        category: element.category || 'General',
        categoryColor: element.category_color || 'blue',
        icon: element.icon || 'mdi-file-document-outline',
        sections: element.sections?.length || 0,
        estimatedTime: element.estimated_time || 10,
      })
    })
  } catch (error) {
    console.error('Failed to fetch forms:', error)
  }
}

// Filter logic
const filteredForms = computed(() => {
  if (!search.value) return forms.value
  const q = search.value.toLowerCase()
  return forms.value.filter(
    (f: any) =>
      f.title.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)),
  )
})

const getSelectedForm = computed(() => forms.value.find((f: any) => f.id === selectedFormId.value))

const canContinue = computed(() => {
  if (currentStep.value === 1) return !!selectedFormId.value
  if (currentStep.value === 2) return true
  if (currentStep.value === 3) return !!selectedClass.value
  return true
})

async function handleContinue() {
  if (currentStep.value === 1) {
    if (selectedFormId.value) {
      currentStep.value = 2
      await fetchFormDetails(selectedFormId.value)
    }
  } else if (currentStep.value === 2) {
    currentStep.value = 3
  } else if (currentStep.value === 3) {
    // Deploy logic - send added rows to server
    await deployForm()
  }
}

async function deployForm() {
  const form_id = selectedFormId.value
  if (!form_id || !selectedClass.value || !fetchedForm.value) return

  try {
    // Build the payload with all sections and their rows
    const updatedSections = fetchedForm.value.sections.map((section: any) => {
      // Get existing rows from the section
      // const existingRows = (section.rows || []).map((row: any) => ({
      //   key: row.key,
      //   label: row.label,
      //   description: row.description || '',
      //   row_type: row.row_type || 'skill',
      // }))

      // Get newly added rows for this section
      const addedRows = rowsAdded.value
        .filter((r) => r.sectionId === section.id)
        .map((row) => ({
          key: row.key,
          label: row.label,
          description: '',
          row_type: 'skill',
        }))

      return {
        sectionId: section.id,
        rows: [...addedRows],
      }
    })

    const classID = selectedClass.value || mockClasses.value[0].id

    const payload = {
      classId: classID,
      updatedSections,
    }

    //TODO
    await api.post(`/evaluations/${form_id}/convert`, payload)

    // router.push({ name: 'form-list' })
    snackbar.value = true
    snackbarText.value = 'Form deployed successfully'
    snackbarColor.value = 'success'
  } catch (e) {
    console.error('Failed to deploy form', e)
    snackbar.value = true
    snackbarText.value = 'Failed to deploy form'
    snackbarColor.value = 'error'
  }
}

function handleCancel() {
  router.back()
}

async function fetchFormDetails(id: number) {
  loadingForm.value = true
  try {
    // Mock fetch or real fetch
    // For now, if ID is 1, fetch real, else mock structure if needed or assume backend handles it.
    // Assuming backend has data for id=1 as seen in CreateForm
    const result = await api.get(`/evaluations/templates/${id}`)
    fetchedForm.value = result.data.form
  } catch (e) {
    console.error('Failed to load form', e)
    // Fallback or error handling
  } finally {
    loadingForm.value = false
  }
}

// Helper Functions for Grid
function getColumnDefs(section: any) {
  const cols: any[] = [{ field: 'rowLabel', headerName: 'Skill / Assessment', pinned: 'left' }]

  if (section.columns) {
    section.columns.forEach((col: any) => {
      cols.push({
        field: col.key,
        headerName: col.label,
        editable: false, // Read only in this view
        headerTooltip: col.label,
      })
    })
  }

  return cols
}

function getRowData(section: any) {
  const existingRows = section.rows || []

  // Get rows from the fetched form
  const rows = existingRows.map((row: any) => ({
    rowLabel: row.label,
    sectionKey: section.key,
    rowKey: row.key,
    isNew: false,
  }))

  // Add locally added rows for this section
  const addedForSection = rowsAdded.value.filter((r) => r.sectionId === section.id)
  addedForSection.forEach((row) => {
    rows.push({
      rowLabel: row.label,
      sectionKey: section.key,
      rowKey: row.key,
      isNew: true,
    })
  })

  return rows
}

// Row Dialog Logic
function openAddRowDialog(section: any) {
  activeSectionId.value = section.id
  newRowLabel.value = ''
  showAddRowDialog.value = true
}

function cancelAddRow() {
  newRowLabel.value = ''
  activeSectionId.value = null
  showAddRowDialog.value = false
}

const rowsAdded = ref<any[]>([])

function confirmAddRow() {
  if (!newRowLabel.value.trim() || !activeSectionId.value) return

  const label = newRowLabel.value.trim()
  const key = label.toLowerCase().replace(/\s+/g, '_')

  rowsAdded.value.push({
    label,
    key,
    sectionId: activeSectionId.value,
  })
  cancelAddRow()
}
</script>

<style scoped>
.v-card--active-border {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.ag-theme-quartz) {
  --ag-border-color: #e2e8f0;
  --ag-header-background-color: #f8fafc;
  --ag-odd-row-background-color: #ffffff;
  --ag-row-hover-color: #f1f5f9;
}
</style>
