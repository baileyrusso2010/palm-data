<template>
  <div class="setup-page">
    <v-container fluid class="pa-4">
      <!-- Header -->
      <header class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <p class="eyebrow mb-1">Assessment Workflow</p>
            <h1 class="text-h4 font-weight-bold text-slate-900">Start New Assessment</h1>
            <p class="meta mt-1">Select a form and rubric to begin evaluating a student</p>
          </div>
          <div>
            <v-btn color="white" variant="outlined" prepend-icon="mdi-arrow-left" to="/assessments">
              Cancel
            </v-btn>
          </div>
        </div>
      </header>

      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="app-card">
            <!-- Progress / Steps -->
            <div class="d-flex align-center mb-8 px-4">
              <div
                class="step-item d-flex align-center"
                :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
              >
                <div class="step-circle mr-3">1</div>
                <span class="step-label font-weight-bold">Select Form</span>
              </div>
              <div class="step-connector mx-4 flex-grow-1"></div>
              <div
                class="step-item d-flex align-center"
                :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
              >
                <div class="step-circle mr-3">2</div>
                <span class="step-label font-weight-bold">Choose Rubric</span>
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- Step 1: Select Form -->
            <div v-if="currentStep === 1">
              <h3 class="text-h6 font-weight-bold mb-4">Which form would you like to use?</h3>

              <div v-if="loadingForms" class="d-flex justify-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>

              <div v-else-if="forms.length === 0" class="text-center py-8">
                <p class="text-grey mb-4">No forms available.</p>
              </div>

              <div v-else>
                <v-radio-group v-model="selectedForm" color="primary">
                  <div
                    v-for="form in forms"
                    :key="form.id"
                    class="selection-item mb-3 pa-3 rounded-lg border cursor-pointer"
                    :class="{ selected: selectedForm && selectedForm.id === form.id }"
                    @click="selectedForm = form"
                  >
                    <div class="d-flex align-center w-100">
                      <v-radio :value="form" class="flex-shrink-0 mr-2"></v-radio>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-slate-900">{{ form.name }}</div>
                        <div class="text-caption text-medium-emphasis">ID: {{ form.id }}</div>
                      </div>
                      <v-chip
                        v-if="form.rubric_id"
                        size="x-small"
                        color="info"
                        variant="flat"
                        class="ml-2"
                      >
                        Has Default Rubric
                      </v-chip>
                    </div>
                  </div>
                </v-radio-group>
              </div>

              <div class="d-flex justify-end mt-6">
                <v-btn
                  color="primary"
                  size="large"
                  variant="elevated"
                  @click="goToStep2"
                  :disabled="!selectedForm"
                  width="120"
                >
                  Next
                </v-btn>
              </div>
            </div>

            <!-- Step 2: Select Rubric -->
            <div v-else-if="currentStep === 2">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-bold">Select Grading Rubric</h3>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-refresh"
                  @click="fetchRubrics"
                >
                  Refresh
                </v-btn>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-6">
                Select the rubric to apply to <strong>{{ selectedForm?.name }}</strong
                >.
              </p>

              <div v-if="loadingRubrics" class="d-flex justify-center py-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>

              <div v-else-if="rubrics.length === 0" class="text-center py-8">
                <p class="text-grey">No rubrics available.</p>
                <v-btn color="primary" variant="text" to="/rubric/create">Create Rubric</v-btn>
              </div>

              <div v-else class="rubric-list">
                <v-radio-group v-model="selectedRubric" color="primary">
                  <div
                    v-for="rubric in rubrics"
                    :key="rubric.id"
                    class="selection-item mb-3 pa-3 rounded-lg border cursor-pointer"
                    :class="{ selected: selectedRubric && selectedRubric.id === rubric.id }"
                    @click="selectedRubric = rubric"
                  >
                    <div class="d-flex align-center w-100">
                      <v-radio :value="rubric" class="flex-shrink-0 mr-2"></v-radio>
                      <div class="flex-grow-1">
                        <div class="font-weight-bold text-slate-900">{{ rubric.name }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ rubric.entries?.length || '?' }} criteria
                        </div>
                      </div>
                      <v-chip
                        v-if="selectedForm?.rubric_id === rubric.id"
                        size="x-small"
                        color="success"
                        variant="tonal"
                        class="ml-2"
                      >
                        Default
                      </v-chip>
                    </div>
                  </div>
                </v-radio-group>
              </div>

              <div class="d-flex justify-space-between mt-6">
                <v-btn
                  variant="outlined"
                  size="large"
                  @click="handleBack"
                  prepend-icon="mdi-arrow-left"
                >
                  Back
                </v-btn>
                <v-btn
                  color="primary"
                  size="large"
                  variant="elevated"
                  @click="startAssessment"
                  :disabled="!selectedRubric"
                  width="180"
                  prepend-icon="mdi-check"
                >
                  Start Assessment
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const currentStep = ref(1)

// Data
const forms = ref<any[]>([])
const rubrics = ref<any[]>([])
const loadingForms = ref(false)
const loadingRubrics = ref(false)

// Selection
const selectedForm = ref<any>(null)
const selectedRubric = ref<any>(null)

// Methods
const fetchForms = async () => {
  loadingForms.value = true
  try {
    const res = await api.get('/forms')
    forms.value = res.data || []
  } catch (err) {
    console.error('Error fetching forms:', err)
  } finally {
    loadingForms.value = false
  }
}

const initialize = async () => {
  const formId = route.query.formId ? Number(route.query.formId) : null
  const step = route.query.step ? Number(route.query.step) : 1

  if (formId) {
    loadingForms.value = true
    try {
      // Fetch single form to set as selected
      const res = await api.get(`/forms/${formId}`)
      selectedForm.value = res.data

      // If requested to skip directly to step 2
      if (step === 2) {
        currentStep.value = 2
        fetchRubrics()
      } else {
        // Even if step 1, we might want to pre-select it in the list if we fetched all forms
        await fetchForms()
        const match = forms.value.find((f) => f.id === formId)
        if (match) selectedForm.value = match
      }
    } catch (err) {
      console.error('Error fetching specific form', err)
      // Fallback to normal flow
      fetchForms()
    } finally {
      loadingForms.value = false
    }
  } else {
    fetchForms()
  }
}

const fetchRubrics = async () => {
  loadingRubrics.value = true
  try {
    const res = await api.get('/rubrics')
    rubrics.value = res.data || []

    // Auto-select if form has a default rubric
    if (selectedForm.value?.rubric_id) {
      const match = rubrics.value.find((r) => r.id === selectedForm.value.rubric_id)
      if (match) selectedRubric.value = match
    }
  } catch (err) {
    console.error('Error fetching rubrics:', err)
  } finally {
    loadingRubrics.value = false
  }
}

const goToStep2 = () => {
  currentStep.value = 2
  fetchRubrics()
}

const handleBack = () => {
  if (route.query.step == '2') {
    router.push('/assessments')
  } else {
    currentStep.value = 1
  }
}

const startAssessment = () => {
  if (!selectedForm.value || !selectedRubric.value) return

  router.push({
    path: '/forms/builder',
    query: {
      formId: selectedForm.value.id,
      rubricId: selectedRubric.value.id,
      formName: selectedForm.value.name,
      rubricName: selectedRubric.value.name,
    },
  })
}

onMounted(() => {
  // Using useRoute inside onMounted or setup, but ensuring we have access
  initialize()
})
</script>

<style scoped>
.setup-page {
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

/* Stepper Styles */
.step-item {
  opacity: 0.5;
  transition: all 0.3s ease;
}
.step-item.active {
  opacity: 1;
}
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  border: 2px solid #cbd5e1;
}
.step-item.active .step-circle {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
.step-item.completed .step-circle {
  background-color: #10b981; /* Green for completed */
  border-color: #10b981;
  color: white;
}
.step-connector {
  height: 2px;
  background-color: #e2e8f0;
}

/* Selection Items */
.selection-item {
  transition: all 0.2s ease;
  background-color: #fff;
}
.selection-item:hover {
  border-color: #94a3b8 !important;
  background-color: #f8fafc;
}
.selection-item.selected {
  border-color: #3b82f6 !important;
  background-color: #eff6ff;
  box-shadow: 0 0 0 1px #3b82f6;
}

:deep(.v-selection-control__input input) {
  cursor: pointer;
}
</style>
