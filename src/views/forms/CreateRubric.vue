<template>
  <v-container fluid class="create-rubric-page pa-6">
    <div
      v-if="!started"
      class="d-flex align-center justify-center fill-height"
      style="min-height: 80vh"
    >
      <v-card width="500" class="pa-6" elevation="2">
        <div class="text-center mb-6">
          <v-icon size="48" color="primary" class="mb-4">mdi-table-edit</v-icon>
          <h2 class="text-h5 font-weight-bold mb-2">Create New Rubric</h2>
          <p class="text-body-2 text-medium-emphasis">Give your rubric a name to get started</p>
        </div>

        <v-text-field
          v-model="rubricName"
          label="Rubric Name"
          placeholder="e.g. Science Fair Project Rubric"
          variant="outlined"
          autofocus
        ></v-text-field>

        <v-btn
          block
          color="primary"
          size="large"
          class="mt-4"
          @click="createRubric"
          :disabled="!rubricName.trim()"
        >
          Start Creating
        </v-btn>
      </v-card>
    </div>

    <!-- Page Header -->
    <div v-else class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="page-title">{{ rubricName }}</h1>
          <p class="page-subtitle">
            Define criteria, descriptions, and point values for your rubric
          </p>
        </div>
        <v-btn color="primary" variant="flat" class="text-capitalize" @click="saveRubricMatrix">
          <v-icon start>mdi-content-save</v-icon>
          Save Rubric
        </v-btn>
      </div>
    </div>

    <v-card v-if="started" elevation="2" class="rubric-card overflow-hidden">
      <!-- Toolbar -->
      <div class="d-flex align-center pa-4 bg-white border-b justify-space-between">
        <h2 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">Rubric Matrix</h2>
        <div class="text-caption text-slate-500">{{ criteria.length }} criteria defined</div>
      </div>

      <!-- Transposed Grid Wrapper -->
      <div class="matrix-wrapper">
        <table class="rubric-matrix">
          <tbody>
            <!-- Row 1: Criterion Name -->
            <tr>
              <th class="matrix-header sticky-col">
                <div class="d-flex align-center text-slate-900">
                  <v-icon size="18" class="mr-2" color="primary">mdi-format-title</v-icon>
                  Criterion Name
                </div>
              </th>
              <td v-for="(item, index) in criteria" :key="`name-${index}`" class="matrix-cell">
                <div class="cell-content">
                  <input
                    v-model="item.label"
                    class="ghost-input title-input"
                    placeholder="e.g. Grammar"
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    color="grey"
                    class="delete-col-btn"
                    @click="removeCriterion(index)"
                    icon
                  >
                    <PhTrash :size="16" />
                  </v-btn>
                </div>
              </td>
              <td class="add-col-cell" rowspan="3">
                <button class="add-col-btn" @click="addCriterion">
                  <div class="d-flex flex-column align-center">
                    <v-icon size="24" class="mb-1">mdi-plus-circle-outline</v-icon>
                    <span>Add Criterion</span>
                  </div>
                </button>
              </td>
            </tr>

            <!-- Row 2: Description -->
            <tr>
              <th class="matrix-header sticky-col">
                <div class="d-flex align-center text-slate-900">
                  <v-icon size="18" class="mr-2" color="primary">mdi-text</v-icon>
                  Description
                </div>
              </th>
              <td v-for="(item, index) in criteria" :key="`desc-${index}`" class="matrix-cell">
                <textarea
                  v-model="item.description"
                  class="ghost-textarea"
                  placeholder="Describe the requirements for this criterion..."
                  rows="4"
                ></textarea>
              </td>
            </tr>

            <!-- Row 3: Value -->
            <tr>
              <th class="matrix-header sticky-col bottom-header">
                <div class="d-flex align-center text-slate-900">
                  <v-icon size="18" class="mr-2" color="primary">mdi-star-circle-outline</v-icon>
                  Value (Points)
                </div>
              </th>
              <td
                v-for="(item, index) in criteria"
                :key="`val-${index}`"
                class="matrix-cell bottom-cell"
              >
                <div class="pa-3">
                  <v-text-field
                    v-model.number="item.value"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    suffix="pts"
                    placeholder="0"
                    bg-color="transparent"
                    class="centered-input"
                  ></v-text-field>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </v-container>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
    {{ snackbar.text }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@/styles/CreateRubric.css'
import { PhTrash } from '@phosphor-icons/vue'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const started = ref(false)
const criteria = ref([])
const rubricName = ref('')
const rubricId = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

onMounted(async () => {
  if (route.query.id) {
    rubricId.value = route.query.id
    await getRubric()
    started.value = true
  }
})

async function getRubric() {
  if (!rubricId.value) return
  try {
    const response = await api.get(`/rubrics/${rubricId.value}`)
    rubricName.value = response.data.name
    // If criteria exist, load them, otherwise default to one empty row
    if (response.data.criteria && response.data.criteria.length > 0) {
      criteria.value = response.data.criteria
    }

    criteria.value = response.data.rubric_levels
    console.log(criteria.value)
  } catch (error) {
    console.error('Error fetching rubric:', error)
    snackbar.value = {
      show: true,
      text: 'Error loading rubric',
      color: 'error',
    }
  }
}

async function createRubric() {
  const name = rubricName.value.trim()
  if (!name) return

  try {
    const response = await api.post('/rubrics', {
      name,
      description: '',
      criteria: criteria.value,
    })

    rubricId.value = response.data.id
    rubricName.value = response.data.name
    started.value = true

    router.replace({ query: { ...route.query, id: rubricId.value } })

    snackbar.value = {
      show: true,
      text: 'Rubric created successfully',
      color: 'success',
    }
  } catch (error) {
    console.error(error)
    snackbar.value = {
      show: true,
      text: 'Error creating rubric',
      color: 'error',
    }
  }
}

async function saveRubricMatrix() {
  if (!rubricId.value) {
    return
  }

  try {
    for (let a in criteria.value) {
      if (!criteria.value[a].label) continue

      await api.put(`/rubrics/${rubricId.value}/entries`, {
        id: criteria.value[a].id,
        rubric_id: Number(rubricId.value),
        value: criteria.value[a].value,
        label: criteria.value[a].label,
        description: criteria.value[a].description,
        sort_order: a,
      })
    }

    criteria.value = []

    await getRubric()

    snackbar.value = {
      show: true,
      text: 'Rubric saved successfully',
      color: 'success',
    }
  } catch (error) {
    console.error(error)
    snackbar.value = {
      show: true,
      text: 'Error saving rubric',
      color: 'error',
    }
  }
}

const totalPoints = computed(() => {
  return criteria.value.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
})

const addCriterion = () => {
  criteria.value.push({ name: '', description: '', value: 0 })
}

const removeCriterion = (index) => {
  criteria.value.splice(index, 1)
}
</script>
