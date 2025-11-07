<template>
  <div class="forms-page">
    <!-- Header -->
    <v-app-bar flat color="white" elevation="1">
      <v-app-bar-title>Forms</v-app-bar-title>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Form</v-btn>
    </v-app-bar>

    <!-- Search and Filters -->
    <v-container class="py-4">
      <v-row align="center" class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search forms"
            variant="outlined"
            density="comfortable"
            clearable
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-btn-toggle v-model="viewMode" mandatory>
            <v-btn value="grid" icon><v-icon>mdi-view-grid</v-icon></v-btn>
            <v-btn value="list" icon><v-icon>mdi-view-list</v-icon></v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <!-- Forms List/Grid -->
      <v-row v-if="filteredForms.length" dense>
        <!-- Grid View -->
        <v-col
          v-if="viewMode === 'grid'"
          v-for="form in filteredForms"
          :key="form.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card elevation="0" class="form-card pa-6" rounded="lg" @click="editForm(form)">
            <div class="d-flex flex-column align-center text-center mb-4">
              <v-icon size="48" color="primary" class="mb-3">mdi-clipboard-text-outline</v-icon>
              <div class="text-h6 font-weight-medium mb-2">{{ form.title }}</div>
              <div class="text-body-2 text-medium-emphasis two-line-clamp">
                {{ form.description }}
              </div>
            </div>
            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between mb-3">
              <v-chip :color="statusColor(form.status)" size="small" label variant="flat">
                {{ form.status }}
              </v-chip>
              <v-chip size="small" variant="outlined" color="primary">
                {{ form.category }}
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mb-4 text-center">
              {{ formatDate(form.updatedAt) }}
            </div>
          </v-card>
        </v-col>

        <!-- List View -->
        <v-col v-else cols="12">
          <v-card elevation="2">
            <v-list>
              <v-list-item
                v-for="form in filteredForms"
                :key="form.id"
                :title="form.title"
                :subtitle="form.description"
                @click="editForm(form)"
              >
                <template #append>
                  <v-chip :color="statusColor(form.status)" size="small" label class="mr-2">{{
                    form.status
                  }}</v-chip>
                  <v-chip size="small" variant="outlined" color="primary" class="mr-2">{{
                    form.category
                  }}</v-chip>
                  <div class="text-caption mr-4">{{ formatDate(form.updatedAt) }}</div>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

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
          <v-form ref="createFormRef" @submit.prevent="createForm">
            <v-text-field
              v-model="draft.title"
              label="Title"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-3"
            />
            <v-textarea
              v-model="draft.description"
              label="Description"
              variant="outlined"
              rows="3"
              class="mb-3"
            />
            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="draft.category"
                  :items="categories"
                  label="Category"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="draft.status"
                  :items="statuses"
                  label="Status"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeCreate">Cancel</v-btn>
          <v-btn color="primary" @click="createForm">{{ editMode ? 'Save' : 'Add' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const viewMode = ref('grid')
const categoryFilter = ref('All')
const createOpen = ref(false)
const createFormRef = ref(null)
const editMode = ref(false)
const editingForm = ref(null)

const forms = ref([
  {
    id: 1,
    title: 'CTE Program Survey',
    description: 'Collect feedback on CTE program experience and outcomes.',
    category: 'Form',
    status: 'Published',
    updatedAt: '2025-10-05T12:00:00Z',
  },
])

const categories = computed(() => Array.from(new Set(forms.value.map((f) => f.category))).sort())
const statuses = ['Draft', 'Published', 'Archived']

const draft = ref({
  title: '',
  description: '',
  category: categories.value[0] || '',
  status: 'Draft',
})
const rules = { required: (v) => !!v || 'Required' }

const filteredForms = computed(() => {
  const q = search.value.toLowerCase()
  return forms.value.filter(
    (f) =>
      (categoryFilter.value === 'All' || f.category === categoryFilter.value) &&
      (f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)),
  )
})

function statusColor(status) {
  return status === 'Published' ? 'success' : status === 'Draft' ? 'grey' : 'error'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

function editForm(form) {
  editMode.value = true
  editingForm.value = form
  draft.value = { ...form }
  createOpen.value = true
}

function openCreate() {
  editMode.value = false
  editingForm.value = null
  draft.value = {
    title: '',
    description: '',
    category: categories.value[0] || '',
    status: 'Draft',
  }
  createOpen.value = true
}
function closeCreate() {
  createOpen.value = false
}
async function createForm() {
  const form = createFormRef.value
  if (form && !(await form.validate()).valid) return
  if (editMode.value) {
    // Edit existing form
    const index = forms.value.findIndex((f) => f.id === editingForm.value.id)
    if (index !== -1) {
      forms.value[index] = {
        ...editingForm.value,
        ...draft.value,
        updatedAt: new Date().toISOString(),
      }
    }
  } else {
    // Create new form
    forms.value.push({ ...draft.value, id: Date.now(), updatedAt: new Date().toISOString() })
  }
  closeCreate()
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
</style>
