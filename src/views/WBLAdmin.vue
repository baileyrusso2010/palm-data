<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card elevation="2" class="pa-6" style="min-width: 400px; max-width: 480px; width: 100%">
      <v-toolbar flat color="transparent" density="comfortable" class="px-0 mb-2">
        <v-toolbar-title class="text-h6 font-weight-bold">Programs</v-toolbar-title>
        <v-spacer />
        <v-btn color="primary" @click="openCreate">Add</v-btn>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :items-per-page="10"
        item-key="id"
        class="elevation-1"
        hide-default-footer
        :no-data-text="search ? 'No matches' : 'No programs yet'"
      >
        <template #item.actions="{ item }">
          <v-btn icon variant="text" size="small" color="primary" @click="openEdit(item)">
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(item)">
            <v-icon size="18">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="dialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold">{{
            isEdit ? 'Edit Program' : 'Add Program'
          }}</v-card-title>
          <v-card-text>
            <v-form ref="formRef" v-model="formValid">
              <v-text-field
                v-model="form.name"
                label="Program Name"
                :rules="nameRules"
                variant="outlined"
                required
                autofocus
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
            <v-btn color="primary" :disabled="!formValid" @click="saveProgram">{{
              isEdit ? 'Save' : 'Create'
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation -->
      <v-dialog v-model="deleteDialog" max-width="340px">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold">Delete Program</v-card-title>
          <v-card-text>
            Are you sure you want to delete <strong>{{ programToDelete?.name }}</strong
            >?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
            <v-btn color="error" @click="deleteProgram">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Program {
  id: number
  name: string
}

// Only Name and Actions columns
const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: 110 },
]

// Sample starting data
const programs = ref<Program[]>([
  { id: 1, name: 'STEM Outreach' },
  {
    id: 2,
    name: 'Health Careers',
  },
  {
    id: 3,
    name: 'Construction Basics',
  },
])

// Search
const search = ref('')
const filteredItems = computed(() => {
  if (!search.value) return programs.value
  const q = search.value.toLowerCase()
  return programs.value.filter((p) => p.name.toLowerCase().includes(q))
})

// Dialog / form state
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const formValid = ref(false)
const formRef = ref()
const form = ref<{ id: number | null; name: string }>({
  id: null,
  name: '',
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length <= 80 || 'Max 80 characters',
]

// CRUD operations
const openCreate = () => {
  isEdit.value = false
  form.value = { id: null, name: '' }
  dialog.value = true
}

const openEdit = (item: Program) => {
  isEdit.value = true
  form.value = { id: item.id, name: item.name }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  form.value = { id: null, name: '' }
}

const saveProgram = async () => {
  // @ts-ignore - Vuetify form instance typing nuance
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isEdit.value && form.value.id != null) {
    const idx = programs.value.findIndex((p) => p.id === form.value.id)
    if (idx !== -1) {
      programs.value[idx] = {
        ...programs.value[idx],
        name: form.value.name.trim(),
      }
    }
  } else {
    const newId = programs.value.length ? Math.max(...programs.value.map((p) => p.id)) + 1 : 1
    programs.value.push({
      id: newId,
      name: form.value.name.trim(),
    })
  }
  dialog.value = false
}

// Delete handling
const programToDelete = ref<Program | null>(null)
const confirmDelete = (item: Program) => {
  programToDelete.value = item
  deleteDialog.value = true
}
const deleteProgram = () => {
  if (programToDelete.value) {
    programs.value = programs.value.filter((p) => p.id !== programToDelete.value!.id)
  }
  deleteDialog.value = false
  programToDelete.value = null
}
</script>

<style scoped>
.v-data-table :deep(th) {
  font-weight: 600;
}
</style>
