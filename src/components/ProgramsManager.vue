<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8">Add Programs to District</h1>
    <v-card class="mb-8" elevation="2">
      <v-card-title class="text-h6 font-weight-bold">Programs</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="7" lg="6">
            <search-multi-select
              v-model="selectedPrograms"
              :items="programOptions"
              :loading="loadingPrograms"
              :item-title="programTitleFn"
              item-value="id"
              label="Add Programs"
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
              <v-btn size="x-small" variant="text" color="primary" class="ml-2" @click="initialLoad"
                >Retry</v-btn
              >
            </div>
          </v-col>
        </v-row>
        <v-form ref="formRef">
          <v-data-table
            :headers="programHeadersWithActions"
            :items="programRowsOrdered"
            item-key="id"
            class="elevation-1 approvals-table mt-6"
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
            <template #item.actions="{ item }">
              <v-btn color="primary" variant="text" size="small" @click="goToClasses(item)">
                <v-icon start size="18">mdi-book-open-variant</v-icon>
                Manage Classes
              </v-btn>
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
      </v-card-text>
    </v-card>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import SearchMultiSelect from '@/components/SearchMultiSelect.vue'
import api from '../api'

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

const approvalData = ref<
  Record<string | number, { originalApprovalDate: string; approvedThrough: string }>
>({})

const programHeadersWithActions = [
  { title: 'Program Name', key: 'name', sortable: true },
  { title: 'Code', key: 'code', sortable: true, width: 120 },
  { title: 'Original Approval Date', key: 'originalApprovalDate', sortable: false },
  { title: 'Approved Through', key: 'approvedThrough', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 160 },
]

const router = useRouter()
function goToClasses(item: any) {
  router.push({ path: '/classes', query: { programId: item.id } })
}

const programRowsOrdered = ref<any[]>([])

function buildRows() {
  for (const prog of programOptions.value) {
    if (selectedPrograms.value.includes(prog.id) && !approvalData.value[prog.id]) {
      approvalData.value[prog.id] = { originalApprovalDate: '', approvedThrough: '' }
    }
  }
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
    const payload = programRowsOrdered.value.map((row) => {
      const approval = approvalData.value[row.id]
      return {
        program_catalog_id: row.id,
        active: true,
        original_approval_date: approval.originalApprovalDate || null,
        approved_through: approval.approvedThrough || null,
      }
    })
    await api.post('/programs/', payload)
    snackbar.value = { show: true, message: 'Approval data saved successfully!', color: 'success' }
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

// Accept a generic item since SearchMultiSelect expects (item: GenericItem)=>string
function programTitleFn(p: ProgramCatalog | { [k: string]: any }) {
  // Fallbacks guard against missing fields on generic items
  const code = (p as any).code ?? ''
  const name = (p as any).name ?? ''
  return `${code} — ${name}`.trim()
}

async function fetchPrograms(query?: string) {
  loadingPrograms.value = true
  programError.value = ''
  try {
    const url =
      query && query.trim()
        ? `/program-catalogs?q=${encodeURIComponent(query.trim())}`
        : '/program-catalogs'
    const { data } = await api.get(url)
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
  searchTimeout = setTimeout(() => fetchPrograms(q), 350)
}

async function fetchExistingPrograms() {
  try {
    const { data } = await api.get('/programs')
    if (Array.isArray(data)) {
      for (const prog of data) {
        if (!selectedPrograms.value.includes(prog.program_catalog_id)) {
          selectedPrograms.value.push(prog.program_catalog_id)
        }
        approvalData.value[prog.program_catalog_id] = {
          originalApprovalDate: prog.original_approval_date?.slice(0, 10) || '',
          approvedThrough: prog.approved_through?.slice(0, 10) || '',
        }
        if (
          !programOptions.value.some((p) => p.id === prog.program_catalog_id) &&
          prog.program_catalog
        ) {
          programOptions.value.push({
            id: prog.program_catalog.id,
            code: prog.program_catalog.code,
            name: prog.program_catalog.name,
          })
        }
      }
      buildRows()
    }
  } catch {}
}

function initialLoad() {
  fetchPrograms()
}

onMounted(() => {
  initialLoad()
  fetchExistingPrograms()
  buildRows()
})

const dateRules = [(v: string) => !!v || 'Required']
const allDatesValid = computed(() =>
  programRowsOrdered.value.every((r) => {
    const d = approvalData.value[r.id]
    return d && d.originalApprovalDate && d.approvedThrough
  }),
)

watch([selectedPrograms, programOptions], () => buildRows())
</script>

<style scoped>
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
