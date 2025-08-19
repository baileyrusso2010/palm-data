<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8">School Name</h1>
    <v-row>
      <v-col cols="12" md="6" lg="5">
        <search-multi-select
          v-model="selectedPrograms"
          :items="programOptions"
          :loading="loadingPrograms"
          :item-title="programTitleFn"
          item-value="id"
          label="Programs"
          placeholder="Search programs"
          hint="Select one or more programs"
          chip-color="success"
          chips
          closable-chips
          show-search-icon
          @search="handleProgramSearch"
        />
        <div v-if="programError" class="error-msg mt-2">
          <v-icon size="14" color="error" class="mr-1">mdi-alert-circle</v-icon>
          {{ programError }}
          <v-btn size="x-small" variant="text" color="primary" class="ml-2" @click="initialLoad">
            Retry
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-8" />
    <div>
      <v-form ref="formRef">
        <v-data-table
          :headers="programHeaders"
          :items="programRowsOrdered"
          item-key="id"
          class="elevation-2 approvals-table"
          density="comfortable"
          hide-default-footer
        >
          <template #item.originalApprovalDate="{ item }">
            <v-text-field
              v-model="approvalData[item.id].originalApprovalDate"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              class="date-field"
              :rules="dateRules"
              required
            />
          </template>
          <template #item.approvedThrough="{ item }">
            <v-text-field
              v-model="approvalData[item.id].approvedThrough"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              class="date-field"
              :rules="dateRules"
              required
            />
          </template>
          <template #no-data>
            <div class="pa-6 text-medium-emphasis text-caption">No programs selected.</div>
          </template>
        </v-data-table>
        <div class="text-right mt-4" v-if="programRowsOrdered.length">
          <v-btn
            color="success"
            @click="saveApprovalData"
            :loading="saving"
            :disabled="!allDatesValid || !programRowsOrdered.length"
            prepend-icon="mdi-content-save"
          >
            Save Changes
          </v-btn>
        </div>
      </v-form>
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
        location="top right"
      >
        {{ snackbar.message }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import SearchMultiSelect from '@/components/SearchMultiSelect.vue'

interface ProgramCatalog {
  id: string | number
  code: string
  name: string
}

const selectedPrograms = ref<(string | number)[]>([])
const programOptions = ref<ProgramCatalog[]>([])
const loadingPrograms = ref(false)
const programError = ref('')
const lastSearch = ref('')
let searchTimeout: any = null
const saving = ref(false)
const snackbar = ref<{ show: boolean; message: string; color: string }>({
  show: false,
  message: '',
  color: 'success',
})
const formRef = ref()

// Approval editable data keyed by program id
const approvalData = ref<
  Record<string | number, { originalApprovalDate: string; approvedThrough: string }>
>({})

const programHeaders = [
  { title: 'Program Name', key: 'name', sortable: true },
  { title: 'Code', key: 'code', sortable: true, width: 120 },
  { title: 'Original Approval Date', key: 'originalApprovalDate', sortable: false },
  { title: 'Approved Through', key: 'approvedThrough', sortable: false },
]

const programRowsOrdered = ref<any[]>([])

function buildRows() {
  // Ensure entries exist for selected programs
  for (const prog of programOptions.value) {
    if (selectedPrograms.value.includes(prog.id) && !approvalData.value[prog.id]) {
      approvalData.value[prog.id] = { originalApprovalDate: '', approvedThrough: '' }
    }
  }
  // Prune entries for unselected programs
  for (const key of Object.keys(approvalData.value)) {
    if (!selectedPrograms.value.includes(key) && !selectedPrograms.value.includes(Number(key))) {
      delete approvalData.value[key as any]
    }
  }
  programRowsOrdered.value = programOptions.value.filter((p) =>
    selectedPrograms.value.includes(p.id),
  )
}

async function saveApprovalData() {
  saving.value = true
  try {
    // Prepare payload to match backend model
    const payload = programRowsOrdered.value.map((row) => {
      const approval = approvalData.value[row.id]
      return {
        // id is omitted for new records (autoIncrement)
        program_catalog_id: row.id,
        active: true, // always true for now
        original_approval_date: approval.originalApprovalDate || null,
        approved_through: approval.approvedThrough || null,
      }
    })

    // POST to backend
    await axios.post('http://localhost:3000/api/programs/programs/', payload)
    snackbar.value = {
      show: true,
      message: 'Approval data saved successfully!',
      color: 'success',
    }
  } catch (e: any) {
    snackbar.value = {
      show: true,
      message: e?.message || 'Failed to save approval data',
      color: 'error',
    }
  } finally {
    saving.value = false
  }
}

function programTitleFn(p: ProgramCatalog) {
  return `${p.code} — ${p.name}`
}

async function fetchPrograms(query?: string) {
  loadingPrograms.value = true
  programError.value = ''
  try {
    // Support simple query filtering if backend supports ?q=
    const url =
      query && query.trim()
        ? `http://localhost:3000/api/programs/program-catalogs?q=${encodeURIComponent(query.trim())}`
        : 'http://localhost:3000/api/programs/program-catalogs'
    const { data } = await axios.get(url)
    // Assume data is an array of { id, code, name }
    programOptions.value = Array.isArray(data) ? data : data?.items || []
  } catch (e: any) {
    programError.value = e?.message || 'Failed to load programs'
  } finally {
    loadingPrograms.value = false
  }
}

function handleProgramSearch(q: string) {
  lastSearch.value = q
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchPrograms(q), 350) // debounce
}

function initialLoad() {
  fetchPrograms()
}

onMounted(() => {
  initialLoad()
  buildRows()
})

// Watchers (lazy import to avoid adding watch above)
import { watch } from 'vue'

const dateRules = [(v: string) => !!v || 'Required']
const allDatesValid = computed(() => {
  return programRowsOrdered.value.every((r) => {
    const d = approvalData.value[r.id]
    return d && d.originalApprovalDate && d.approvedThrough
  })
})

watch([selectedPrograms, programOptions], () => {
  buildRows()
})
</script>

<style scoped>
.result-block {
  background: #0f172a;
  color: #f1f5f9;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  max-width: 420px;
  overflow-x: auto;
}
.error-msg {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  color: #dc2626;
}
.approvals-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.approvals-table :deep(.v-data-table__tr) {
  transition: background-color 0.2s ease;
}
.approvals-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc;
}
.date-field :deep(input) {
  font-size: 0.75rem;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
</style>
