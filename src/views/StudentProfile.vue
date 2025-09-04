<template>
  <v-container class="py-8 student-profile" fluid>
    <v-breadcrumbs :items="breadcrumbs" class="px-0 mb-4" density="comfortable">
      <template #title="{ item }">
        <RouterLink v-if="item.href" :to="item.href" class="text-decoration-none">{{
          item.title
        }}</RouterLink>
        <span v-else>{{ item.title }}</span>
      </template>
    </v-breadcrumbs>

    <v-row>
      <v-col cols="12" md="4" lg="3">
        <v-card class="elevation-2 mb-6">
          <v-card-text class="pt-6 pb-5 d-flex flex-column align-center text-center">
            <v-avatar size="84" color="primary" class="mb-4 elevation-2">
              <span class="text-h6 font-weight-bold">{{ initials(studentDisplay.name) }}</span>
            </v-avatar>
            <div class="text-subtitle-1 font-weight-medium mb-1">{{ studentDisplay.name }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ studentDisplay.email }}</div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="justify-center">
            <v-btn size="small" variant="text" prepend-icon="mdi-email" :href="mailtoHref"
              >Email</v-btn
            >
          </v-card-actions>
        </v-card>

        <v-card class="elevation-2 mb-6">
          <v-card-title class="py-3 text-subtitle-2 d-flex align-center">
            <span>Flags</span>
            <v-spacer />
            <v-btn
              size="small"
              variant="text"
              density="comfortable"
              :title="'Add Flag'"
              @click="openAddFlagDialog"
              class="pa-0"
              style="min-width: unset; height: unset"
            >
              <PhPlusCircle :size="32" color="#112aee" weight="duotone" />
            </v-btn>
          </v-card-title>
          <v-divider />

          <v-card-text class="pt-4">
            <div class="d-flex flex-row flex-wrap align-start justify-start gap-4">
              <template v-if="fakeFlags.length">
                <v-tooltip
                  v-for="flag in fakeFlags"
                  :key="flag.id"
                  location="bottom"
                  :text="flagTooltip(flag)"
                >
                  <template #activator="{ props }">
                    <div
                      v-bind="props"
                      class="flag-item d-flex flex-column align-center text-center px-2"
                      style="min-width: 68px"
                    >
                      <PhFlag :size="32" :color="flag.color || '#e53935'" weight="duotone" />
                      <div
                        class="text-caption mt-2 font-weight-medium text-truncate"
                        style="max-width: 64px"
                      >
                        {{ flag.label }}
                      </div>
                    </div>
                  </template>
                </v-tooltip>
              </template>
              <div v-else class="text-medium-emphasis text-caption">No flags</div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="elevation-2">
          <v-card-title class="py-3 text-subtitle-2">At a Glance</v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Total WBL Hours</div>
                <div class="text-h6 font-weight-medium">{{ totalHours }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis mb-1">Entries</div>
                <div class="text-body-2">{{ hoursEntries.length }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8" lg="9">
        <v-card class="elevation-2">
          <v-card-title class="d-flex align-center flex-wrap gap-3 py-3">
            <div class="text-subtitle-1">WBL Hours</div>
            <v-spacer />
            <v-btn
              color="primary"
              density="comfortable"
              prepend-icon="mdi-plus"
              @click="openAddDialog"
              >Add Hours</v-btn
            >
          </v-card-title>
          <v-divider />
          <v-expand-transition>
            <v-alert
              v-if="saveError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="ma-4"
              closable
              @click:close="saveError = null"
              >{{ saveError }}</v-alert
            >
          </v-expand-transition>
          <v-data-table
            :items="hoursEntriesSorted"
            :headers="hoursHeaders"
            item-key="_id"
            density="comfortable"
            hide-default-footer
            :no-data-text="hoursLoading ? 'Loading…' : 'No hours logged yet'"
            class="hours-table"
            :items-per-page="-1"
            height="520"
            virtual-scroll
          >
            <template #item.date="{ item }">
              {{ new Date(item.date).toLocaleDateString() }}
            </template>
            <template #item.hours="{ item }">
              <span class="font-weight-medium">{{ item.hours.toFixed(2) }}</span>
            </template>
            <template #item.programTypeId="{ item }">
              {{ programTypeName(item.programTypeId) }}
            </template>
            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="primary"
                :title="'Remove entry'"
                @click="removeEntry(item._id)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Hours Dialog -->
    <v-dialog v-model="addDialog" max-width="520">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Add WBL Hours</v-card-title>
        <v-divider />
        <v-form @submit.prevent="addHours" v-model="formValid">
          <v-card-text class="pt-5">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newEntry.date"
                  label="Date"
                  type="date"
                  density="comfortable"
                  variant="outlined"
                  :max="today"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newEntry.hours"
                  label="Hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  density="comfortable"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required', (v) => v > 0 || 'Must be > 0']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newEntry.programTypeId"
                  :items="programTypes"
                  item-title="name"
                  item-value="id"
                  label="Program Type"
                  density="comfortable"
                  variant="outlined"
                  :loading="loading && !programTypes.length"
                  :disabled="!programTypes.length"
                  :rules="[(v) => !!v || 'Select a type']"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newEntry.activity"
                  label="Activity / Notes"
                  density="comfortable"
                  variant="outlined"
                  maxlength="120"
                  counter="120"
                  placeholder="e.g. Job shadowing at local company"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
            <v-btn color="primary" type="submit" :disabled="!formValid || adding" :loading="adding"
              >Add</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Add Flag Dialog -->
    <v-dialog v-model="addFlagDialog" max-width="520">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Add Flag</v-card-title>
        <v-divider />
        <v-form v-model="addFlagValid" @submit.prevent="submitAddFlag">
          <v-card-text class="pt-5">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newFlag.type"
                  :items="flagTypes"
                  item-title="label"
                  item-value="value"
                  label="Flag Type"
                  density="comfortable"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newFlag.startDate"
                  type="date"
                  label="Start Date"
                  density="comfortable"
                  variant="outlined"
                  :max="newFlag.endDate || undefined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newFlag.endDate"
                  type="date"
                  label="End Date (optional)"
                  density="comfortable"
                  variant="outlined"
                  :min="newFlag.startDate || undefined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newFlag.notes"
                  label="Notes"
                  density="comfortable"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  maxlength="240"
                  counter="240"
                  placeholder="Context / reason for flag"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="addFlagDialog = false">Cancel</v-btn>
            <v-btn color="primary" type="submit" :disabled="!addFlagValid || !newFlag.type"
              >Add Flag</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSuccess" color="success" timeout="2500" location="bottom end">
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showDanger" color="red" timeout="2500" location="bottom end">
      {{ dangerMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PhFlag, PhPlusCircle } from '@phosphor-icons/vue'
import api from '../api'

// Demo flags (replace with real data or API call as needed)
interface FakeFlag {
  id: number
  label: string
  color?: string
  startDate?: string
  endDate?: string
  notes?: string
  type?: string
}
const fakeFlags = ref<FakeFlag[]>([
  { id: 1, label: 'Missing Paperwork', color: '#f87171', type: 'missing_paperwork' },
  { id: 2, label: 'Attendance Issue', color: '#fb923c', type: 'attendance_issue' },
  { id: 3, label: 'Needs Review', color: '#fbbf24', type: 'needs_review' },
])

// Flag catalog (placeholder for API)
const flagTypes = [
  { value: 'missing_paperwork', label: 'Missing Paperwork', color: '#f87171' },
  { value: 'attendance_issue', label: 'Attendance Issue', color: '#fb923c' },
  { value: 'needs_review', label: 'Needs Review', color: '#fbbf24' },
  { value: 'at_risk', label: 'At Risk', color: '#f472b6' },
  { value: 'honor', label: 'Honor', color: '#34d399' },
]

// Add flag dialog state
const addFlagDialog = ref(false)
const addFlagValid = ref(false)
const newFlag = ref<{
  type: string | null
  notes: string
  startDate: string
  endDate: string | null
}>({ type: null, notes: '', startDate: new Date().toISOString().slice(0, 10), endDate: null })

function openAddFlagDialog() {
  newFlag.value = {
    type: null,
    notes: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
  }
  addFlagDialog.value = true
}

function submitAddFlag() {
  if (!newFlag.value.type) return
  const catalog = flagTypes.find((t) => t.value === newFlag.value.type)!
  const nextId = (fakeFlags.value.reduce((m, f) => Math.max(m, f.id), 0) || 0) + 1
  fakeFlags.value.push({
    id: nextId,
    type: catalog.value,
    label: catalog.label,
    color: catalog.color,
    notes: newFlag.value.notes || undefined,
    startDate: newFlag.value.startDate || undefined,
    endDate: newFlag.value.endDate || undefined,
  })
  addFlagDialog.value = false
}

function flagTooltip(flag: FakeFlag) {
  const range =
    flag.startDate || flag.endDate
      ? `${flag.startDate || '—'}${flag.endDate ? ' → ' + flag.endDate : ''}`
      : ''
  return [flag.label, range, flag.notes].filter(Boolean).join('\n')
}

// Basic student fetch + local WBL entry management (replace fetch endpoints with real API later)
interface ApiStudent {
  id: number
  firstName: string
  lastName: string
  email: string
}
interface WblEntry {
  _id: string // client-generated for now
  date: string // ISO date (yyyy-mm-dd)
  hours: number // fractional hours in UI
  activity: string
  programTypeId?: number
}

const route = useRoute()
const studentId = computed(() => route.params.id)

const loading = ref(false)
const loadError = ref<string | null>(null)
const studentDisplay = ref({ id: 0, name: '—', email: '' })

async function fetchStudent() {
  loading.value = true
  loadError.value = null
  try {
    const res = await api.get<ApiStudent>(`/student/${studentId.value}`)
    studentDisplay.value = {
      id: res.data.id,
      name: `${res.data.firstName} ${res.data.lastName}`.trim(),
      email: res.data.email,
    }
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load student'
  } finally {
    loading.value = false
  }
}

async function fetchProgramTypes() {
  loading.value = true
  loadError.value = null

  try {
    const res = await api.get(`/wbl/types`)
    // Expecting an array like: [{ id: 4, name: 'Co-op' }, ...]
    const data: { id: number; name: string }[] = await res.data
    programTypes.value = data
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load student'
  } finally {
    loading.value = false
  }
}

// WBL Hours (client side for now)
const hoursEntries = ref<WblEntry[]>([])
const hoursLoading = ref(false)
const saveError = ref<string | null>(null)
const adding = ref(false)

const hoursHeaders = [
  { title: 'Date', key: 'date', sortable: true, width: 120 },
  { title: 'Activity', key: 'activity', sortable: false },
  { title: 'Hours', key: 'hours', sortable: true, width: 100 },
  { title: 'Program Type', key: 'programTypeId', sortable: false, width: 140 },
  { title: '', key: 'actions', width: 60 },
]

const hoursEntriesSorted = computed(() =>
  [...hoursEntries.value].sort((a, b) => b.date.localeCompare(a.date)),
)
const totalHours = computed(() =>
  hoursEntries.value.reduce((sum, e) => sum + (isFinite(e.hours) ? e.hours : 0), 0).toFixed(2),
)

// Dialog state
const addDialog = ref(false)
const formValid = ref(false)
const today = new Date().toISOString().slice(0, 10)
const newEntry = ref<WblEntry>({ _id: '', date: today, hours: 0.25, activity: '' })
const programTypes = ref<{ id: number; name: string }[]>([])
function programTypeName(id?: number) {
  return programTypes.value.find((p) => p.id === id)?.name || '—'
}

const showSuccess = ref(false)
const successMessage = ref('')

const showDanger = ref(false)
const dangerMessage = ref('')

function openAddDialog() {
  newEntry.value = { _id: '', date: today, hours: 0.25, activity: '', programTypeId: undefined }
  addDialog.value = true
  saveError.value = null
}

async function addHours() {
  if (!formValid.value) return
  adding.value = true
  saveError.value = null
  try {
    const minutes = Math.round(newEntry.value.hours * 60)
    const payload: any = {
      studentId: studentDisplay.value.id,
      date: new Date(newEntry.value.date).toISOString(),
      // Provide both 'hours' and 'time' for compatibility if backend varies
      hours: minutes,
      time: minutes,
      notes: newEntry.value.activity,
      wblTypeId: newEntry.value.programTypeId,
    }
    const res = await api.post(`/wbl/hours`, payload)
    if (!res.data) {
      let msg = `Failed to add hours (${res.status})`
      try {
        const errJson = await res.data
        if (errJson?.message) msg = errJson.message
      } catch (_) {}
      throw new Error(msg)
    }
    // Expect API to return created entry (with id or _id). Fallback to local if not.
    let created: any = null
    try {
      created = await res.data
    } catch (_) {}
    const minutesReturned = created?.hours ?? created?.time ?? created?.minutes ?? minutes
    const localEntry: WblEntry = {
      _id: String(created?._id || created?.id || crypto.randomUUID()),
      date: created?.date ? String(created.date).slice(0, 10) : newEntry.value.date,
      // Convert minutes back to fractional hours
      hours: minutesReturned != null ? Number(minutesReturned) / 60 : newEntry.value.hours,
      activity: created?.notes ?? created?.activity ?? newEntry.value.activity,
      programTypeId: created?.wblTypeId ?? created?.programTypeId ?? newEntry.value.programTypeId,
    }
    hoursEntries.value.push(localEntry)
    addDialog.value = false
    successMessage.value = 'Hours added'
    showSuccess.value = true
  } catch (e: any) {
    saveError.value = e.message || 'Failed to add hours'
  } finally {
    adding.value = false
  }
}

async function removeEntry(id: string) {
  try {
    const res = await api.delete(`/wbl/hours/${id}`)
    if (res.status !== 200) {
      throw new Error(`Failed to delete hours (${res.status})`)
    }

    hoursEntries.value = hoursEntries.value.filter((e) => e._id !== id)
    successMessage.value = 'Deleted Hours'
    showSuccess.value = true
  } catch (e: any) {
    saveError.value = e.message || 'Failed to delete hours'
    dangerMessage.value = 'Failed to delete'
    showDanger.value = true
  } finally {
  }
}

async function fetchHours() {
  const id = studentDisplay.value.id
  if (!id) return
  hoursLoading.value = true
  try {
    const res = await api.get(`/wbl/hours/${id}`)
    const data: any[] = res.data
    hoursEntries.value = data.map((d) => {
      const minutes = d.hours ?? d.time ?? d.minutes ?? 0
      const fractional = minutes ? Number(minutes) / 60 : 0
      return {
        _id: String(d.id ?? d._id ?? crypto.randomUUID()),
        date: d.date ? String(d.date).slice(0, 10) : today,
        hours: isFinite(fractional) ? fractional : 0,
        activity: d.notes || d.activity || '',
        programTypeId: d.wblTypeId ?? d.programTypeId,
      }
    })
  } catch (e: any) {
    saveError.value = e.message || 'Failed to load hours'
  } finally {
    hoursLoading.value = false
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

const mailtoHref = computed(() => `mailto:${studentDisplay.value.email}`)

onMounted(() => {
  fetchStudent()
  fetchProgramTypes()
  // hours will be fetched when student id becomes available (watch below)
})

// Once student id is set, load hours
watch(
  () => studentDisplay.value.id,
  (id) => {
    if (id) fetchHours()
  },
  { immediate: true },
)

const breadcrumbs = computed(() => [
  { title: 'Classes', href: '/classes' },
  { title: loading.value ? 'Loading…' : studentDisplay.value.name || 'Student' },
])
</script>

<style scoped>
.student-profile .v-card-title {
  font-weight: 600;
}
.hours-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hours-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc;
}
.gap-4 {
  gap: 1rem;
}
</style>
