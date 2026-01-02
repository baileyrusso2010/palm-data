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
          <v-card class="app-card" style="height: 350px; display: flex; flex-direction: column">
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
                    <td class="pa-2 align-middle">
                      <v-text-field
                        v-model="scoreDates[i]"
                        type="date"
                        variant="outlined"
                        density="compact"
                        hide-details
                        bg-color="white"
                        single-line
                        flat
                        style="min-width: 140px"
                      ></v-text-field>
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
          <v-card class="app-card" style="height: 350px; display: flex; flex-direction: column">
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
              >
              </ag-grid-vue>
            </div>

            <!-- Actions -->
            <div class="d-flex align-center justify-space-between mt-4 px-4 pb-4">
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addRow">
                Add Row
              </v-btn>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// Fake Students Data
const students = ref([
  { id: 1, name: 'Alice Johnson', grade: 11 },
  { id: 2, name: 'Bob Smith', grade: 12 },
  { id: 3, name: 'Charlie Brown', grade: 10 },
  { id: 4, name: 'Diana Prince', grade: 11 },
  { id: 5, name: 'Evan Wright', grade: 12 },
])

const selectedStudent = ref(students.value[0]) // Default to first student

const scoreDates = ref<Record<number, string | null>>({
  1: null,
  2: null,
  3: null,
  4: null,
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
const rowData = ref([
  {
    skill: 'Attendance',
    standard:
      'Understands work expectations for attendance and adheres to them. Notifies supervisor in advance in case of absence.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Punctuality',
    standard:
      'Understands work expectations for punctuality. Arrives on time for work, takes and returns from breaks on time and calls the supervisor prior to being late.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Takes Initiative',
    standard:
      'Participates fully in task or project from initiation to completion. Initiates interactions with supervisor for the next task upon completion of previous one.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Quality of Work',
    standard:
      'Gives best effort, evaluates own work and utilizes feedback to improve work performance. Strives to meet quality standards and provides optimal customer service.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Response to Supervision',
    standard:
      'Accepts direction, feedback and constructive criticism with positive attitude and uses information to improve work performance. Demonstrates flexibility when nature of work changes.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Workplace Appearance',
    standard:
      'Dresses appropriately for the position and duties. Practices personal hygiene appropriate for position and duties.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Observes Critically',
    standard:
      'Carefully attends to visual sources of information. Evaluates the information for accuracy, bias and usefulness. Develops a clear understanding of the information.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Knowledge of Workplace',
    standard: 'Demonstrates understanding of workplace policy and ethics.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Solves Problems and Makes Decisions',
    standard:
      'Identifies the nature of the problem, evaluates various ways of solving the problem and selects the best alternative.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Takes Responsibility',
    standard:
      'Identifies one’s strengths and weaknesses. Sets goals for learning. Identifies and pursues opportunities for learning. Monitors one’s progress toward achieving these goals.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Communication Skills',
    standard:
      'Gives full attention to what other people are saying, asks questions as appropriate and understands what was heard. Communicates concerns clearly and asks for assistance when needed.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Cooperates with Others',
    standard:
      'Interacts and communicates with others in a friendly and courteous way. Shows respect for others’ ideas, opinions and racial and cultural diversity. Effectively works as a member of a team.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Resolves Conflicts',
    standard:
      'Identifies the source of conflict, suggests options to resolve it and helps parties reach a mutually satisfactory agreement.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Reads with Understanding',
    standard:
      'Reads print materials in a variety of formats (signs, books, instruction sheets, forms, charts, etc.) to locate, understand, apply and manage information they contain.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Solves Problems using Math',
    standard:
      'Works with mathematical information (numbers, symbols, etc.), procedures, and tools and applies skills to answer a question, solve a problem, verify the reasonableness of results, make a prediction or carry out a task that has mathematical dimensions.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Health and Safety',
    standard: 'Complies with health and safety rules for specific workplace.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
  {
    skill: 'Technology',
    standard: 'Uses job-related tools, technologies and materials appropriately.',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  },
])

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
  },
  {
    field: 'score2',
    headerName: 'Score 2',
    flex: 1,
    editable: true,
  },
  {
    field: 'score3',
    headerName: 'Score 3',
    flex: 1,
    editable: true,
  },
  {
    field: 'score4',
    headerName: 'Score 4',
    flex: 1,
    editable: true,
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

const addRow = () => {
  const newRow = {
    skill: 'New Skill',
    standard: 'Description...',
    score1: '',
    score2: '',
    score3: '',
    score4: '',
    comment: '',
  }
  rowData.value = [...rowData.value, newRow]
  // Scroll to bottom
  setTimeout(() => {
    gridApi.value?.ensureIndexVisible(rowData.value.length - 1)
  }, 100)
}

const saveForm = () => {
  if (!selectedStudent.value) {
    alert('Please select a student first')
    return
  }

  // Mock save functionality
  console.log('Saving form data for student:', selectedStudent.value.name)
  console.log('Form Data:', rowData.value)
  // Here we would call the API to save the form structure and grades
}

onMounted(async () => {
  rubricLoading.value = true

  // Get params from query
  const rubricId = route.query.rubricId || 3
  if (route.query.formName) {
    formName.value = route.query.formName as string
  }

  try {
    const res = await api.get(`/rubrics/${rubricId}`)
    currentRubricName.value = res.data.name
    rubricData.value = res.data.entries || []
    scorePoints.value = res.data.entries.map((entry: any) => entry.score)
    console.log(scorePoints.value)
  } catch (error) {
    console.error('Error fetching rubric:', error)
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
