<template>
  <div class="form-builder-page">
    <v-container fluid class="pa-4">
      <!-- Header -->
      <header class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <p class="eyebrow mb-1">Forms & Assessments</p>
            <h1 class="text-h4 font-weight-bold text-slate-900">
              {{ formName || 'Form Builder' }}
            </h1>
            <p class="meta mt-1">Define the criteria and standards for this assessment form</p>
          </div>

          <div class="d-flex align-center">
            <v-autocomplete
              v-model="selectedStudent"
              :items="students"
              item-title="name"
              return-object
              label="Find Student"
              placeholder="Search by name..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              bg-color="white"
              class="mr-4"
              style="width: 300px"
              @update:model-value="handleStudentChange()"
            ></v-autocomplete>

            <v-btn color="white" variant="outlined" prepend-icon="mdi-arrow-left" to="/assessments">
              Cancel
            </v-btn>
          </div>
        </div>
      </header>

      <!-- Top Section: Student Selector & Rubric Reference -->
      <v-row class="mb-4">
        <!-- Student Selector -->
        <v-col cols="12" md="6">
          <v-card class="app-card" style="height: 400px; display: flex; flex-direction: column">
            <div class="pa-3 border-b bg-grey-lighten-5">
              <h3 class="text-subtitle-2 font-weight-bold">Score Summary</h3>
            </div>

            <div class="flex-grow-1 overflow-hidden">
              <v-table density="comfortable" class="h-100">
                <thead>
                  <tr>
                    <th class="bg-grey-lighten-4"></th>
                    <th
                      class="text-center font-weight-bold bg-grey-lighten-4 text-caption text-uppercase"
                    >
                      Average
                    </th>
                    <th
                      class="text-center font-weight-bold bg-grey-lighten-4 text-caption text-uppercase"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in 4" :key="i">
                    <td class="font-weight-bold text-caption align-middle">Score {{ i }}</td>
                    <td class="text-center text-caption font-weight-bold align-middle">
                      {{ averages[i] }}
                    </td>
                    <td class="pa-2 align-middle text-center">
                      <span class="text-caption font-weight-bold text-medium-emphasis">
                        {{ scoreDates[i] }}
                      </span>
                    </td>
                  </tr>
                  <tr class="bg-green-lighten-5">
                    <td class="font-weight-bold text-caption align-middle">Overall Avg</td>
                    <td class="text-center text-subtitle-2 font-weight-bold align-middle">
                      {{ averages.overall }}
                    </td>
                    <td class="text-center text-caption text-medium-emphasis align-middle">
                      <!-- Date not applicable for overall -->
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-col>

        <!-- Rubric Reference Table -->
        <v-col cols="12" md="6">
          <v-card class="app-card" style="height: 400px; display: flex; flex-direction: column">
            <div class="pa-3 border-b d-flex justify-space-between align-center bg-grey-lighten-5">
              <span class="text-subtitle-2 font-weight-bold"
                >Rubric Reference: {{ currentRubricName }}</span
              >
            </div>

            <div v-if="rubricLoading" class="d-flex justify-center align-center flex-grow-1">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else class="rubric-scroll-container flex-grow-1 overflow-y-auto pa-3">
              <div
                v-if="rubricData.length === 0"
                class="text-center text-caption text-medium-emphasis mt-4"
              >
                No rubric criteria found.
              </div>

              <div
                v-for="entry in rubricData"
                :key="entry.id"
                class="rubric-entry mb-3 pa-3 rounded-lg border bg-surface"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="font-weight-bold text-subtitle-2 text-slate-900">{{
                    entry.name
                  }}</span>
                  <v-chip
                    size="small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-bold ms-2"
                  >
                    {{ entry.score }} Pts
                  </v-chip>
                </div>
                <p class="text-caption text-medium-emphasis mb-0" style="line-height: 1.5">
                  {{ entry.description }}
                </p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12">
          <v-card class="app-card">
            <!-- Grid Wrapper -->
            <div class="grid-wrapper" style="height: 70vh; width: 100%">
              <ag-grid-vue
                style="width: 100%; height: 100%"
                class="ag-theme-alpine"
                :rowData="rowData"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                @cell-value-changed="onCellValueChanged"
                @row-data-updated="onRowDataUpdated"
              >
              </ag-grid-vue>
            </div>

            <!-- Actions -->
            <div class="d-flex align-center justify-space-between mt-4 px-4 pb-4">
              <!-- <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addRow">
                Add Row
              </v-btn> -->
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-content-save"
                @click="saveForm"
                width="150"
              >
                Save
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="snackbarVisible"
      :color="snackbarColor"
      :timeout="3000"
      location="top right"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbarVisible = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { GridApi, GridOptions } from 'ag-grid-community'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const gridApi = ref<GridApi | null>(null)

// Rubric Data
const rubricLoading = ref(false)
const rubricData = ref<any[]>([])
const currentRubricName = ref('')
const formName = ref('') // Added formName ref
const scorePoints = ref([])
const submissionId = ref(null)
const rubricId = ref('')
const formId = ref('')

// Snackbar
const snackbarVisible = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Students Data
interface Student {
  id: string
  name: string
  grade: string
}
const students = ref<Student[]>([])

const selectedStudent = ref<Student | null>(null)

const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    // weekday: 'short',
  })
}

const scoreDates = ref<Record<number, string | null>>({
  1: getTodayDate(),
  2: getTodayDate(),
  3: getTodayDate(),
  4: getTodayDate(),
})

const updateTrigger = ref(0)
const onCellValueChanged = () => {
  updateTrigger.value++
}

const averages = computed(() => {
  updateTrigger.value // Force re-evaluation on grid change

  const result: any = { 1: '-', 2: '-', 3: '-', 4: '-', overall: '-' }
  let totalSum = 0
  let count = 0

  // Use grid nodes to ensure we have the latest accepted values
  let currentRows: any[] = []
  if (gridApi.value) {
    gridApi.value.forEachNode((node: any) => {
      currentRows.push(node.data)
    })
  } else {
    currentRows = rowData.value
  }

  for (let i = 1; i <= 4; i++) {
    const key = `score${i}`
    const values = currentRows.map((row: any) => parseFloat(row[key])).filter((val) => !isNaN(val))

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0)
      result[i] = (sum / values.length).toFixed(1)
      totalSum += sum
      count += values.length
    }
  }

  if (count > 0) {
    result.overall = (totalSum / count).toFixed(1)
  }

  return result
})

// Initial Data provided by user
const rowData = ref([])

const numberParser = (params: any) => {
  const val = parseFloat(params.newValue)
  return isNaN(val) ? null : val
}

const columnDefs = ref([
  {
    field: 'skill',
    headerName: 'Performance Skill',
    flex: 2,
    cellStyle: { fontWeight: '600', color: '#0f172a' },
  },
  {
    field: 'standard',
    headerName: 'Performance Standard',
    flex: 3,
    wrapText: true,
    autoHeight: true,
    cellClass: 'text-grey-darken-3',
  },
  {
    field: 'score1',
    headerName: 'Score 1',
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      const val = parseFloat(params.value)
      return isNaN(val) ? '' : val
    },
    valueParser: numberParser,
  },
  {
    field: 'score2',
    headerName: 'Score 2',
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      const val = parseFloat(params.value)
      return isNaN(val) ? '' : val
    },
    valueParser: numberParser,
  },
  {
    field: 'score3',
    headerName: 'Score 3',
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      const val = parseFloat(params.value)
      return isNaN(val) ? '' : val
    },
    valueParser: numberParser,
  },
  {
    field: 'score4',
    headerName: 'Score 4',
    flex: 1,
    editable: true,
    valueFormatter: (params: any) => {
      const val = parseFloat(params.value)
      return isNaN(val) ? '' : val
    },
    valueParser: numberParser,
  },
  {
    field: 'comment',
    headerName: 'Comment',
    flex: 2,
    editable: true,
  },
])

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  editable: true,
}

const gridOptions: GridOptions = {
  headerHeight: 48,
  rowHeight: 60, // Sligthly taller for wrapped text
  animateRows: true,
}

const onGridReady = (params: any) => {
  gridApi.value = params.api
  params.api.sizeColumnsToFit()
}

const saveForm = async () => {
  if (!selectedStudent.value) {
    showSnackbar('Please select a student first', 'error')
    return
  }

  if (!submissionId.value) {
    const success = await createStudentSubmission()
    if (!success) {
      showSnackbar('Failed to create submission', 'error')
      return
    }
  }

  await createStudentSubmissionData()
}

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarVisible.value = true
}

async function createStudentSubmission() {
  if (!selectedStudent.value) return false
  try {
    let response = await api.post(`/forms/submission`, {
      form_id: formId.value,
      student_id: selectedStudent.value.id,
      course_instance_id: 1,
      status: 'draft',
    })
    submissionId.value = response.data.id
    return true
  } catch (err) {
    console.log(err)
    showSnackbar('Failed to create submission', 'error')
    return false
  }
}

async function createStudentSubmissionData() {
  try {
    const formattedData: Record<string, any> = {}

    rowData.value.forEach((row: any) => {
      // Map scores
      ;['score1', 'score2', 'score3', 'score4'].forEach((key) => {
        const fieldName = row.fieldNames?.[key]
        if (fieldName && row[key] !== '' && row[key] !== null && row[key] !== undefined) {
          const num = parseFloat(row[key])
          if (!isNaN(num)) {
            formattedData[fieldName] = num
          }
        }
      })

      // Map comment
      const commentFieldName = row.fieldNames?.comment
      if (commentFieldName) {
        // Send null if empty string, or the actual comment
        formattedData[commentFieldName] = row.comment === '' ? null : row.comment
      }
    })

    //this is an upsert
    await api.post(`/forms/submission/${submissionId.value}`, {
      data: formattedData,
    })
    showSnackbar('Form saved successfully')
  } catch (err) {
    console.log(err)
    showSnackbar('Failed to save form data', 'error')
  }
}

// Store loaded submission values
const loadedValues = ref<Record<string, any>>({})

async function getStudentSubmission() {
  if (!selectedStudent.value) return null

  // Always reset submissionId to prevent using a previous student's ID
  submissionId.value = null

  try {
    let response = await api.get(`/forms/submission/${formId.value}/${selectedStudent.value.id}`)
    let data = response.data

    // If successful, update the submissionId
    submissionId.value = data.id

    return data.data?.data || {}
  } catch (error) {
    // If 404 or error, submissionId remains null (correct for new/unsaved student)
    console.log('Error fetching student submission (likely new):', error)
    return null
  }
}

async function getStudents() {
  try {
    let response = await api.get('/course-instances/1')
    let data = response.data

    if (data.enrollments) {
      students.value = data.enrollments.map((enrollment: any) => ({
        id: enrollment.student.id,
        name: `${enrollment.student.first_name} ${enrollment.student.last_name}`,
        grade: enrollment.student.grade,
      }))

      if (students.value.length > 0) {
        selectedStudent.value = students.value[0]
      }
    }
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

// Store form definition
const formDefinition = ref<any>(null)

const onRowDataUpdated = () => {
  updateTrigger.value++
}

const populateGrid = (savedValues: any) => {
  if (!formDefinition.value?.form_sections) return

  rowData.value = formDefinition.value.form_sections.map((section: any) => {
    // Find fields for scores
    const numberFields = section.form_fields.filter((f: any) => f.type === 'number')
    const commentField = section.form_fields.find((f: any) => f.type === 'text')

    // Helper to get value by field name
    const getValue = (field: any) => {
      if (!field?.name) return ''
      const val = savedValues[field.name]
      // Return if defined and valid number, otherwise empty string
      if (val === undefined || val === null || val === '') return ''
      const num = typeof val === 'number' ? val : parseFloat(val)
      return isNaN(num) ? '' : num
    }

    return {
      skill: section.name,
      standard: section.description,
      score1: getValue(numberFields[0]),
      score2: getValue(numberFields[1]),
      score3: getValue(numberFields[2]),
      score4: getValue(numberFields[3]),
      comment: getValue(commentField),
      // Meta data for potentially saving later
      sectionId: section.id,
      fieldIds: {
        score1: numberFields[0]?.id || 0,
        score2: numberFields[1]?.id,
        score3: numberFields[2]?.id,
        score4: numberFields[3]?.id,
        comment: commentField?.id,
      },
      fieldNames: {
        score1: numberFields[0]?.name,
        score2: numberFields[1]?.name,
        score3: numberFields[2]?.name,
        score4: numberFields[3]?.name,
        comment: commentField?.name,
      },
    }
  })
}

const handleStudentChange = async () => {
  // 1. Immediately clear the grid values (keep form structure)
  populateGrid({})

  // 2. Fetch new data
  const data = await getStudentSubmission()

  // 3. If data exists, re-populate (if empty, it remains cleared from step 1)
  if (data) {
    populateGrid(data)
  }
}

onMounted(async () => {
  rubricLoading.value = true

  // Get params from query
  rubricId.value = (route.query.rubricId as string) || ''
  formId.value = (route.query.formId as string) || ''

  if (route.query.formName) {
    formName.value = route.query.formName as string
  }

  try {
    // 1. Fetch Form Definition & Rubric
    const formPromise = api.get(`/forms/${formId.value}?advanced=1`)
    const rubricPromise = api.get(`/rubrics/${rubricId.value}`)

    // 2. Fetch Students first, THEN submission
    await getStudents()
    const submissionData = await getStudentSubmission()

    const [formRes, rubricRes] = await Promise.all([formPromise, rubricPromise])

    // Handle Rubric
    currentRubricName.value = rubricRes.data.name
    rubricData.value = rubricRes.data.criteria || []
    scorePoints.value = rubricRes.data.criteria.map((entry: any) => entry.score)

    // Handle Form & Submission Merge
    formDefinition.value = formRes.data
    formName.value = formDefinition.value.name || 'Form Builder'

    // Populate Initial Data
    populateGrid(submissionData || {})
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    rubricLoading.value = false
  }
})
</script>

<style scoped>
.form-builder-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Inter', sans-serif;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.meta {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.text-slate-900 {
  color: #0f172a !important;
}

.app-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 0;
  overflow: hidden;
}

/* Ag-Grid Customization */
:deep(.ag-theme-alpine) {
  --ag-header-background-color: #f8fafc;
  --ag-header-foreground-color: #475569;
  --ag-border-color: #e2e8f0;
  --ag-header-cell-hover-background-color: #f1f5f9;
  --ag-row-hover-color: #f8fafc;
  font-family: 'Inter', sans-serif;
}

:deep(.ag-header-cell-text) {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.ag-cell) {
  font-size: 14px;
  display: flex;
  align-items: center; /* Vertical center */
  line-height: normal; /* Allow multiline */
}

/* Custom Scrollbar for Rubric List */
.rubric-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.rubric-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}
.rubric-scroll-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
.rubric-entry {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.rubric-entry:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
</style>
