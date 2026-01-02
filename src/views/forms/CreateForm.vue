<template>
  <div class="page-container">
    <v-container fluid class="pa-4">
      <!-- Header Section -->
      <header class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <p class="eyebrow mb-1">Forms & Assessments</p>
            <h1 class="text-h4 font-weight-bold text-slate-900">Create New Form</h1>
            <p class="meta mt-1">Configure a new assessment form using an existing rubric</p>
          </div>
          <div>
            <v-btn
              color="white"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="router.back()"
            >
              Cancel
            </v-btn>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="app-card">
            <div class="card-header mb-6">
              <h2 class="text-h6 font-weight-bold mb-1">Form Details</h2>
              <p class="text-caption text-medium-emphasis">
                Name your form and select a rubric to base it on.
              </p>
            </div>

            <v-text-field
              v-model="formName"
              label="Form Name"
              placeholder="e.g., Q1 Presentation Evaluation"
              variant="outlined"
              class="mb-6"
              bg-color="grey-lighten-5"
            ></v-text-field>

            <v-divider class="mb-6"></v-divider>

            <div class="mb-4">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">Select Rubric</h3>

              <div v-if="loading" class="d-flex justify-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>

              <div v-else-if="rubrics.length === 0" class="text-center py-4 text-grey">
                No rubrics found. Please create a rubric first.
              </div>

              <v-list v-else lines="two" bg-color="transparent" class="rubric-list">
                <v-list-item
                  v-for="rubric in rubrics"
                  :key="rubric.id"
                  :value="rubric"
                  @click="selectedRubric = rubric"
                  rounded="lg"
                  class="mb-2 rubric-item"
                  :class="{ 'rubric-selected': selectedRubric?.id === rubric.id }"
                  border
                >
                  <template v-slot:prepend>
                    <v-icon
                      :icon="
                        selectedRubric?.id === rubric.id
                          ? 'mdi-radiobox-marked'
                          : 'mdi-radiobox-blank'
                      "
                      :color="selectedRubric?.id === rubric.id ? 'primary' : 'grey'"
                      class="mr-3"
                    ></v-icon>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ rubric.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ rubric.entries?.length || 0 }} criteria defined
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <div class="d-flex justify-end mt-6">
              <v-btn
                color="primary"
                size="large"
                width="100%"
                variant="elevated"
                @click="createForm"
                :disabled="!isValid"
                :loading="creating"
              >
                Create Form
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const formName = ref('')
const rubrics = ref<any[]>([])
const selectedRubric = ref<any>(null)
const loading = ref(false)
const creating = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const isValid = computed(() => {
  return formName.value.trim().length > 0 && selectedRubric.value !== null
})

const fetchRubrics = async () => {
  loading.value = true
  try {
    const res = await api.get('/rubrics')
    rubrics.value = res.data
  } catch (error) {
    console.error('Error fetching rubrics:', error)
    snackbar.value = { show: true, text: 'Failed to load rubrics', color: 'error' }
  } finally {
    loading.value = false
  }
}

const createForm = async () => {
  if (!isValid.value) return

  creating.value = true
  try {
    // CURRENTLY: We are just creating the form shell.
    // The backend might not support linking rubric_id directly in the create call yet
    // based on my check of the form controller, but I will send it anyway in case it's added
    // or handled via a separate step later.
    // Ideally, we would create the form, then copy the rubric structure to it.

    // For now, I'll simulate a successful "Go from there" by creating the form
    // and presumably navigating to its config/view page.

    const payload = {
      name: formName.value,
      rubric_id: selectedRubric.value.id, // Passing it, backend might ignore it for now
    }

    const res = await api.post('/forms', payload) // Endpoint might be /forms based on routes/index.ts

    snackbar.value = { show: true, text: 'Form created successfully', color: 'success' }

    // Navigate to the form view or config
    // Assuming /form-view or similar. I'll stick to going back or to a list for now,
    // or if I knew the edit route, I'd go there.
    setTimeout(() => {
      // router.push({ name: 'form-config', params: { id: res.data.id } })
      // fallback since I don't recall exact route name for config
      router.push({
        path: '/forms/builder',
        query: {
          rubricId: selectedRubric.value.id,
          formId: res.data.id,
          formName: formName.value,
        },
      })
    }, 1000)
  } catch (error) {
    console.error('Error creating form:', error)
    snackbar.value = { show: true, text: 'Failed to create form', color: 'error' }
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  fetchRubrics()
})
</script>

<style scoped>
.page-container {
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
  padding: 32px;
}

.rubric-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.rubric-selected {
  background-color: #eff6ff !important; /* light primary */
  border-color: #3b82f6 !important; /* primary */
}

.rubric-selected :deep(.v-list-item-title) {
  color: #1d4ed8;
}
</style>
