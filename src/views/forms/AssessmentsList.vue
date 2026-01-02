<template>
  <div class="assessments-page">
    <v-container fluid class="pa-4">
      <!-- Header -->
      <header class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div>
            <p class="eyebrow mb-1">Assessment Workflow</p>
            <h1 class="text-h4 font-weight-bold text-slate-900">Assessments</h1>
            <p class="meta mt-1">Select an existing assessment form or start a new workflow</p>
          </div>
          <div>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              to="/assessments/setup"
            >
              Start New Assessment
            </v-btn>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <v-row>
        <v-col cols="12">
          <v-card class="app-card">
            <div class="card-header px-4 pt-4 pb-2 border-b">
              <h2 class="text-h6 font-weight-bold">Available Assessments</h2>
              <p class="text-caption text-medium-emphasis">
                Select a form below to begin a new evaluation
              </p>
            </div>

            <div v-if="loading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="forms.length === 0" class="text-center py-12">
              <v-icon size="64" color="grey-lighten-2" class="mb-4"
                >mdi-file-document-outline</v-icon
              >
              <h3 class="text-h6 text-grey-darken-1 mb-2">No Assessments Found</h3>
              <p class="text-caption text-grey mb-6">
                There are no forms available for assessment yet.
              </p>
            </div>

            <v-list v-else lines="two" class="pa-0">
              <template v-for="(form, index) in forms" :key="form.id">
                <v-list-item class="py-3 px-4 assessment-item" @click="startAssessment(form)">
                  <template v-slot:prepend>
                    <v-avatar color="primary-lighten-4" class="mr-3" rounded="lg">
                      <v-icon color="primary">mdi-clipboard-text</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-bold text-slate-900 mb-1">
                    {{ form.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="d-flex align-center">
                    <span class="mr-4">
                      <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                      Created {{ new Date(form.createdAt).toLocaleDateString() }}
                    </span>
                    <v-chip v-if="form.rubric_id" size="x-small" color="success" variant="tonal">
                      Default Rubric Linked
                    </v-chip>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn variant="text" color="primary" append-icon="mdi-arrow-right">
                      Resume Assessment
                    </v-btn>
                  </template>
                </v-list-item>
                <v-divider v-if="index < forms.length - 1"></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const forms = ref<any[]>([])
const loading = ref(false)

const fetchForms = async () => {
  loading.value = true
  try {
    const res = await api.get('/forms/class')
    console.log(res.data)
    forms.value = res.data || []
  } catch (error) {
    console.error('Error fetching forms:', error)
  } finally {
    loading.value = false
  }
}

const startAssessment = (form: any) => {
  // Navigate to setup wizard, pre-selecting this form and moving to step 2 (Rubric selection)
  router.push({
    path: '/forms/builder',
    query: {
      formId: form.form_id,
      rubricId: form.rubric_id,
      formName: form.name,
    },
  })
}

onMounted(() => {
  fetchForms()
})
</script>

<style scoped>
.assessments-page {
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
  overflow: hidden;
}

.assessment-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.assessment-item:hover {
  background-color: #f8fafc;
}
</style>
