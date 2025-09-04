<template>
  <div class="wbl-types-manager d-flex flex-column gap-6">
    <div class="d-flex align-center mb-2 flex-wrap gap-3">
      <div class="text-subtitle-2">WBL Types</div>
      <v-chip size="small" color="primary" variant="flat" v-if="!loading">{{
        types.length
      }}</v-chip>
      <v-spacer />
      <v-btn color="primary" density="comfortable" prepend-icon="mdi-plus" @click="openAddDialog">
        Add Type
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

    <v-skeleton-loader v-if="loading && !types.length" type="table" class="mb-4" />

    <v-data-table
      v-else
      :items="types"
      :headers="headers"
      item-key="id"
      density="comfortable"
      :items-per-page="-1"
      hide-default-footer
      class="wbl-types-table"
    >
      <template #item.actions="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          color="primary"
          :title="'Edit'"
          @click="openEditDialog(item)"
        >
          <v-icon size="18">mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          variant="text"
          color="red"
          :title="'Delete'"
          @click="confirmDelete(item)"
        >
          <v-icon size="18">mdi-delete</v-icon>
        </v-btn>
      </template>
      <template #no-data>
        <div class="text-medium-emphasis py-6">No WBL types found.</div>
      </template>
    </v-data-table>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="420">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1"
          >{{ editId ? 'Edit' : 'Add' }} WBL Type</v-card-title
        >
        <v-divider />
        <v-form v-model="formValid" @submit.prevent="submitType">
          <v-card-text class="pt-5">
            <v-text-field
              v-model="typeName"
              label="Type Name"
              variant="outlined"
              density="comfortable"
              :rules="req"
              required
              maxlength="60"
              counter
            />
            <v-alert
              v-if="saveError"
              type="error"
              variant="tonal"
              density="compact"
              class="py-2 mt-4"
            >
              {{ saveError }}
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false" :disabled="saving">Cancel</v-btn>
            <v-btn color="primary" type="submit" :disabled="!formValid || saving" :loading="saving">
              {{ editId ? 'Save' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="py-3 text-subtitle-1">Delete WBL Type</v-card-title>
        <v-divider />
        <v-card-text class="pt-5">
          Are you sure you want to delete <strong>{{ typeToDelete?.name }}</strong
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

interface WBLType {
  id: number
  name: string
}

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000/api'

const types = ref<WBLType[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)

const dialog = ref(false)
const formValid = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)
const editId = ref<number | null>(null)
const typeName = ref('')

const deleteDialog = ref(false)
const typeToDelete = ref<WBLType | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const showSuccess = ref(false)
const successMessage = ref('')

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: '', key: 'actions', width: 90 },
]

const req = [(v: any) => !!v || 'Required']

function openAddDialog() {
  editId.value = null
  typeName.value = ''
  saveError.value = null
  dialog.value = true
}
function openEditDialog(item: WBLType) {
  editId.value = item.id
  typeName.value = item.name
  saveError.value = null
  dialog.value = true
}

async function fetchTypes() {
  loading.value = true
  loadError.value = null
  try {
    const res = await axios.get(`${API_BASE}/wbl/types`)
    types.value = res.data
  } catch (e: any) {
    loadError.value = e.message || 'Failed to load types'
  } finally {
    loading.value = false
  }
}

async function submitType() {
  if (!formValid.value) return
  saving.value = true
  saveError.value = null
  try {
    if (editId.value) {
      const res = await axios.put(`${API_BASE}/wbl/types/${editId.value}`, { name: typeName.value })
      const idx = types.value.findIndex((t) => t.id === editId.value)
      if (idx !== -1) types.value[idx] = res.data
      successMessage.value = 'Type updated'
    } else {
      const res = await axios.post(`${API_BASE}/wbl/types`, { name: typeName.value })
      types.value.push(res.data)
      successMessage.value = 'Type added'
    }
    showSuccess.value = true
    dialog.value = false
  } catch (e: any) {
    saveError.value = e.message || 'Failed to save type'
  } finally {
    saving.value = false
  }
}

function confirmDelete(item: WBLType) {
  typeToDelete.value = item
  deleteError.value = null
  deleteDialog.value = true
}
function closeDelete() {
  deleteDialog.value = false
  typeToDelete.value = null
}
async function performDelete() {
  if (!typeToDelete.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await axios.delete(`${API_BASE}/wbl/types/${typeToDelete.value.id}`)
    types.value = types.value.filter((t) => t.id !== typeToDelete.value!.id)
    successMessage.value = 'Type deleted'
    showSuccess.value = true
    closeDelete()
  } catch (e: any) {
    deleteError.value = e.message || 'Delete failed'
  } finally {
    deleting.value = false
  }
}

onMounted(fetchTypes)
</script>

<style scoped>
.wbl-types-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.wbl-types-manager .gap-6 {
  gap: 1.5rem;
}
</style>
