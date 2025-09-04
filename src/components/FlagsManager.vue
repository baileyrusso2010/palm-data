<template>
  <div class="flags-manager d-flex flex-column gap-6">
    <div class="d-flex align-center mb-2 flex-wrap gap-3">
      <div class="text-subtitle-2">Flags</div>
      <v-chip size="small" color="primary" variant="flat" v-if="!loading">{{
        flags.length
      }}</v-chip>
      <v-spacer />
      <v-btn color="primary" density="comfortable" prepend-icon="mdi-plus" @click="openAddDialog">
        Add Flag
      </v-btn>
    </div>

    <v-alert
      v-if="loadError"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-2"
      closable
      @click:close="loadError = null"
      >{{ loadError }}</v-alert
    >

    <v-skeleton-loader v-if="loading && !flags.length" type="table" class="mb-4" />

    <v-data-table
      v-else
      :items="flags"
      :headers="headers"
      item-key="id"
      density="comfortable"
      :items-per-page="-1"
      hide-default-footer
      class="flags-table"
    >
      <template #item.color="{ item }">
        <div class="d-flex align-center">
          <div
            class="color-swatch mr-2"
            :style="{ background: item.color || '#ccc' }"
            :title="item.color"
          />
          <code class="text-caption">{{ item.color || '—' }}</code>
        </div>
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          color="primary"
          :title="'Delete'"
          @click="confirmDelete(item)"
        >
          <v-icon size="18">mdi-delete</v-icon>
        </v-btn>
      </template>
      <template #no-data>
        <div class="text-medium-emphasis py-6">No flags found.</div>
      </template>
    </v-data-table>

    <!-- Add Flag Dialog -->
    <v-dialog v-model="addDialog" max-width="520">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Add Flag</v-card-title>
        <v-divider />
        <v-form v-model="formValid" @submit.prevent="submitAdd">
          <v-card-text class="pt-5">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newFlag.name"
                  label="Name"
                  variant="outlined"
                  density="comfortable"
                  :rules="req"
                  required
                  maxlength="40"
                  counter
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newFlag.color"
                  label="Color"
                  variant="outlined"
                  density="comfortable"
                  placeholder="#ff0000"
                  hint="Hex color (#rrggbb)"
                  persistent-hint
                  :rules="colorRules"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newFlag.description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                  rows="2"
                  :rules="req"
                  required
                  maxlength="160"
                  counter
                />
              </v-col>
              <v-col cols="12" v-if="saveError">
                <v-alert type="error" variant="tonal" density="compact" class="py-2">
                  {{ saveError }}
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="addDialog = false" :disabled="adding">Cancel</v-btn>
            <v-btn color="primary" type="submit" :disabled="!formValid || adding" :loading="adding">
              Add
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Delete Flag</v-card-title>
        <v-divider />
        <v-card-text class="pt-5">
          Are you sure you want to delete <strong>{{ flagToDelete?.name }}</strong
          >? This cannot be undone.
          <v-alert v-if="deleteError" type="error" variant="tonal" density="compact" class="mt-4">{{
            deleteError
          }}</v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDelete" :disabled="deleting">Cancel</v-btn>
          <v-btn color="red" @click="performDelete" :loading="deleting" :disabled="deleting"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSuccess" color="success" timeout="2500" location="bottom end">
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface FlagRecord {
  id: number
  name: string
  description: string
  color?: string | null
}

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000/api'

const flags = ref<FlagRecord[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)

const addDialog = ref(false)
const formValid = ref(false)
const adding = ref(false)
const saveError = ref<string | null>(null)

const newFlag = ref<{ name: string; description: string; color: string }>({
  name: '',
  description: '',
  color: '',
})

const deleteDialog = ref(false)
const flagToDelete = ref<FlagRecord | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const showSuccess = ref(false)
const successMessage = ref('')

const headers = [
  { title: 'Name', key: 'name', sortable: true, width: 180 },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Color', key: 'color', width: 140 },
  { title: '', key: 'actions', width: 70 },
]

const req = [(v: any) => !!v || 'Required']
const colorRules = [(v: string) => !v || /^#([0-9a-fA-F]{6})$/.test(v) || 'Use #rrggbb']

function openAddDialog() {
  newFlag.value = { name: '', description: '', color: '' }
  saveError.value = null
  addDialog.value = true
}

async function fetchFlags() {
  loading.value = true
  loadError.value = null
  try {
    const res = await axios.get(`${API_BASE}/flags`)

    console.log(res)
    const data: FlagRecord[] = await res.data
    flags.value = data
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load flags'
  } finally {
    loading.value = false
  }
}

async function submitAdd() {
  if (!formValid.value) return
  adding.value = true
  saveError.value = null
  try {
    const payload = { ...newFlag.value, color: newFlag.value.color || undefined }
    const res = await fetch(`${API_BASE}/flags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let msg = `Failed (${res.status})`
      try {
        const j = await res.json()
        if (j?.message) msg = j.message
      } catch (_) {}
      throw new Error(msg)
    }
    const created: FlagRecord = await res.json()
    flags.value.push(created)
    successMessage.value = 'Flag added'
    showSuccess.value = true
    addDialog.value = false
  } catch (e: any) {
    saveError.value = e.message || 'Failed to add flag'
  } finally {
    adding.value = false
  }
}

function confirmDelete(flag: FlagRecord) {
  flagToDelete.value = flag
  deleteError.value = null
  deleteDialog.value = true
}
function closeDelete() {
  deleteDialog.value = false
  flagToDelete.value = null
}
async function performDelete() {
  if (!flagToDelete.value) return
  deleting.value = true
  deleteError.value = null
  try {
    const res = await fetch(`${API_BASE}/flags/${flagToDelete.value.id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed (${res.status})`)
    flags.value = flags.value.filter((f) => f.id !== flagToDelete.value!.id)
    successMessage.value = 'Flag deleted'
    showSuccess.value = true
    closeDelete()
  } catch (e: any) {
    deleteError.value = e.message || 'Delete failed'
  } finally {
    deleting.value = false
  }
}

onMounted(fetchFlags)
</script>

<style scoped>
.flags-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.flags-manager .gap-6 {
  gap: 1.5rem;
}
</style>
