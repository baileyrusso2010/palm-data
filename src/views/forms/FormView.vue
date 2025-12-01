<template>
  <div class="forms-page">
    <!-- Header -->
    <v-app-bar flat color="white" elevation="1">
      <v-app-bar-title>Forms</v-app-bar-title>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Form</v-btn>
    </v-app-bar>

    <!-- Forms List -->
    <v-container class="py-4">
      <v-progress-linear v-if="isLoading" indeterminate class="mb-4" />
      <v-card v-if="forms.length" elevation="1" rounded="lg">
        <v-list lines="one">
          <template v-for="(form, idx) in forms" :key="form.id">
            <v-list-item @click="editForm(form)" class="list-row">
              <div class="row-line">
                <div class="row-left">
                  <span class="title text-truncate">{{ form.name }}</span>
                  <span v-if="form.description" class="sep">•</span>
                  <span v-if="form.description" class="desc text-truncate">{{
                    form.description
                  }}</span>
                </div>
                <div class="row-right text-caption text-medium-emphasis">
                  {{ formatCreated(form) }}
                </div>
              </div>
            </v-list-item>
            <v-divider v-if="idx < forms.length - 1" />
          </template>
        </v-list>
      </v-card>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey" class="mb-4">mdi-file-document-outline</v-icon>
        <div class="text-h6 mb-2">No forms found</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Create your first form to get started.
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create Form</v-btn>
      </div>
    </v-container>

    <!-- Create Form Dialog -->
    <v-dialog v-model="createOpen" max-width="500">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Form' : 'New Form' }}</v-card-title>
        <v-card-text>
          <v-form ref="createFormRef" @submit.prevent="saveForm">
            <v-text-field
              v-model="draft.name"
              label="Name"
              variant="outlined"
              :rules="[rules.required]"
              autofocus
              class="mb-3"
            />
            <v-textarea
              v-model="draft.description"
              label="Description"
              variant="outlined"
              rows="3"
              class="mb-3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeCreate">Cancel</v-btn>
          <v-btn color="primary" @click="saveForm">{{ editMode ? 'Save' : 'Add' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const createOpen = ref(false)
const createFormRef = ref(null)
const editMode = ref(false)
const editingForm = ref(null)
const isLoading = ref(false)

const forms = ref([])

const draft = ref({
  name: '',
  description: '',
})
const rules = { required: (v) => !!v || 'Required' }

onMounted(async () => {
  await fetchForms()
})

async function fetchForms() {
  isLoading.value = true
  try {
    const response = await api.get('/forms')
    console.log('in here')
    forms.value = response.data
  } catch (err) {
    console.error('Error fetching forms:', err)
  } finally {
    isLoading.value = false
  }
}

function editForm(form) {
  editMode.value = true
  editingForm.value = form
  draft.value = { name: form.name, description: form.description }
  createOpen.value = true
}

function openCreate() {
  editMode.value = false
  editingForm.value = null
  draft.value = { name: '', description: '' }
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
}

async function saveForm() {
  const form = createFormRef.value
  if (form && !(await form.validate()).valid) return

  try {
    if (editMode.value) {
      await api.put(`/forms/${editingForm.value.id}`, {
        name: draft.value.name,
        description: draft.value.description,
      })
    } else {
      await api.post('/forms', { name: draft.value.name, description: draft.value.description })
    }
    await fetchForms()
    closeCreate()
  } catch (err) {
    console.error('Error saving form:', err)
  }
}

// Show created date at right; falls back to updated or empty
function formatCreated(item) {
  const d = item.createdAt || item.created_at || item.created || item.updatedAt || item.updated_at
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return ''
  }
}
</script>

<style scoped>
.forms-page {
  min-height: 100vh;
  background: #ffffff;
}

.form-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  height: 320px;
  display: flex;
  flex-direction: column;
}

.form-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.12);
}

.two-line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* Row list layout */
.list-row {
  cursor: pointer;
}
.row-line {
  display: flex;
  align-items: center;
  gap: 12px;
}
.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* enable truncation */
  flex: 1 1 auto;
}
.row-right {
  flex: 0 0 auto;
  white-space: nowrap;
}
.title {
  font-weight: 600;
  max-width: 40%;
}
.desc {
  color: rgba(0, 0, 0, 0.6);
  max-width: 50%;
}
.sep {
  color: rgba(0, 0, 0, 0.28);
}
</style>
