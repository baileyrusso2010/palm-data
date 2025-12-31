<template>
  <div class="rubric-page">
    <v-container fluid class="pa-4">
      <!-- Header Section -->
      <header class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <p class="eyebrow mb-1">Forms & Assessments</p>
            <h1 class="text-h4 font-weight-bold text-slate-900">Create New Rubric</h1>
            <p class="meta mt-1">Define scoring criteria and standards for student assessments</p>
          </div>
          <div>
            <v-btn
              color="white"
              variant="outlined"
              class="mr-3"
              prepend-icon="mdi-arrow-left"
              @click="router.back()"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-content-save"
              @click="saveRubric"
              :loading="saving"
            >
              Save Rubric
            </v-btn>
          </div>
        </div>
      </header>

      <!-- Main Content Container centered -->
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Unified Card -->
          <v-card class="app-card">
            <!-- Section 1: Details -->
            <div class="mb-8">
              <div class="card-header mb-4">
                <h3 class="text-h6 font-weight-bold mb-1">Rubric Details</h3>
                <p class="text-caption text-medium-emphasis">
                  General information covering the entire rubric
                </p>
              </div>

              <v-text-field
                v-model="rubricName"
                label="Rubric Name"
                placeholder="e.g., Science Fair Presentation"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-5"
                hide-details="auto"
              ></v-text-field>
            </div>

            <v-divider class="mb-8"></v-divider>

            <!-- Section 2: Criteria -->
            <div class="mb-2">
              <div class="d-flex align-center justify-space-between mb-4">
                <div>
                  <h3 class="text-h6 font-weight-bold mb-1">Scoring Criteria</h3>
                  <p class="text-caption text-medium-emphasis">
                    Define the rows for your rubric matrix
                  </p>
                </div>
                <!-- Action button shifted right in line with header -->
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addEntry"
                >
                  Add Criterion
                </v-btn>
              </div>

              <!-- Grid Container -->
              <div
                class="grid-wrapper"
                style="
                  height: 500px;
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  overflow: hidden;
                "
              >
                <ag-grid-vue
                  style="width: 100%; height: 100%"
                  class="ag-theme-alpine"
                  :rowData="rowData"
                  :columnDefs="columnDefs"
                  :defaultColDef="defaultColDef"
                  :gridOptions="gridOptions"
                  @grid-ready="onGridReady"
                >
                </ag-grid-vue>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" size="small" @click="snackbar.show = false"
          >Close</v-btn
        >
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GridApi, GridOptions } from 'ag-grid-community'
import api from '../../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const rubricName = ref('')
const saving = ref(false)
const gridApi = ref<GridApi | null>(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

const rowData = ref([
  {
    name: 'Content Accuracy',
    description: 'Information is accurate and well-researched.',
    score: 10,
    sort_order: 1,
  },
  { name: 'Organization', description: 'Logical flow and structure.', score: 5, sort_order: 2 },
  {
    name: 'Delivery',
    description: 'Clear voice, eye contact, and pacing.',
    score: 5,
    sort_order: 3,
  },
])

const columnDefs = ref([
  {
    field: 'sort_order',
    headerName: '#',
    width: 70,
    editable: true,
    cellClass: 'text-center font-weight-medium text-grey-darken-1',
  },
  {
    field: 'name',
    headerName: 'Criterion Name',
    editable: true,
    flex: 1,
    cellStyle: { fontWeight: '600', color: '#0f172a' },
  },
  {
    field: 'description',
    headerName: 'Description',
    editable: true,
    flex: 2,
    cellClass: 'text-grey-darken-2',
  },
  {
    field: 'score',
    headerName: 'Max Pts',
    editable: true,
    type: 'numericColumn',
    width: 100,
    cellClass: 'font-weight-bold text-primary',
    valueFormatter: (params: any) => params.value + ' pts',
  },
])

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: false,
}

const gridOptions: GridOptions = {
  headerHeight: 48,
  rowHeight: 48,
  suppressCellFocus: false,
  animateRows: true,
}

const onGridReady = (params: any) => {
  gridApi.value = params.api
  params.api.sizeColumnsToFit()
}

const addEntry = () => {
  const newEntry = {
    name: 'New Criterion',
    description: 'Description of expectations...',
    score: 5,
    sort_order: rowData.value.length + 1,
  }

  rowData.value = [...rowData.value, newEntry]
  setTimeout(() => {
    gridApi.value?.ensureIndexVisible(rowData.value.length - 1)
  }, 100)
}

const saveRubric = async () => {
  if (!rubricName.value) {
    showSnackbar('Please enter a rubric name', 'error')
    return
  }

  if (rowData.value.length === 0) {
    showSnackbar('At least one criterion is required', 'error')
    return
  }

  saving.value = true
  try {
    const rubricResponse = await api.post('/rubrics', {
      name: rubricName.value,
    })
    const rubricId = rubricResponse.data.id

    const entryPromises = rowData.value.map((entry) => {
      return api.post(`/rubrics/${rubricId}/entries`, {
        rubric_id: rubricId,
        name: entry.name,
        description: entry.description,
        score: Number(entry.score),
        sort_order: Number(entry.sort_order),
      })
    })

    await Promise.all(entryPromises)

    showSnackbar('Rubric created successfully', 'success')

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    console.error('Error creating rubric:', error)
    showSnackbar('Failed to create rubric', 'error')
  } finally {
    saving.value = false
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}
</script>

<style scoped>
.rubric-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
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
  padding: 40px; /* Increased padding for single card view */
  transition: all 0.2s ease;
}

.app-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Ag-Grid Customization to match theme */
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
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

:deep(.ag-cell) {
  font-size: 14px;
  padding-top: 10px;
}
</style>
