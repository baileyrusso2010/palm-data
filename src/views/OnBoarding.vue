<template>
  <v-container fluid class="pa-6">
    <!-- School Header -->
    <v-row justify="center" class="mb-4">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold text-center text-grey-darken-3">
          {{ schoolName }}
        </h1>
      </v-col>
    </v-row>

    <!-- Two-column layout: programs on left, current programs on right -->
    <v-row class="g-6" align="start" justify="center">
      <!-- Left: Add Program Form -->
      <v-col cols="12" md="6">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <v-card-title class="text-h5 font-weight-medium"> Add New Program </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="addProgram">
              <!-- Program Dropdown -->
              <v-combobox
                v-model="selectedProgram"
                :items="availablePrograms"
                label="Select Program"
                item-title="name"
                item-value="id"
                :rules="[(v) => !!v || 'Program is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select a program from the state list"
                :disabled="availablePrograms.length === 0"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="item.raw.category"
                  />
                </template>
                <template #no-data>
                  <v-list-item title="No programs available to add" />
                </template>
              </v-combobox>

              <!-- Description Field -->
              <v-textarea
                v-model="description"
                label="Description (Optional)"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Add any school-specific details..."
                class="mb-4"
                aria-label="Enter additional program details"
              />

              <!-- Add Button -->
              <v-btn
                color="primary"
                type="submit"
                :disabled="!valid || loading || availablePrograms.length === 0"
                :loading="loading"
                block
                size="large"
                class="mt-2"
                aria-label="Add program to school list"
              >
                Add Program
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: Current Programs List -->
      <v-col cols="12" md="6">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <v-card-title class="text-h5 font-weight-medium"> Current Programs </v-card-title>
          <v-card-text>
            <v-list v-if="currentPrograms.length > 0">
              <v-list-item v-for="program in currentPrograms" :key="program.id" class="mb-2">
                <v-list-item-content>
                  <v-list-item-title class="text-h6">{{ program.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ program.category }}</v-list-item-subtitle>
                  <v-list-item-subtitle v-if="program.description">
                    {{ truncate(program.description, 100) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    color="error"
                    icon
                    @click="removeProgram(program.id)"
                    aria-label="Remove program"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="outlined"> No programs added yet. </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toast Notification -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue'
import type { VForm } from 'vuetify/components'

interface Program {
  id: number
  name: string
  category: string
  description?: string
}

interface Snackbar {
  show: boolean
  message: string
  color: 'success' | 'error'
}

const schoolName = ref<string>('Springfield CTE High School') // Replace with dynamic value
const valid = ref<boolean>(false)
const selectedProgram = ref<Program | null>(null)
const description = ref<string>('')
const loading = ref<boolean>(false)
const form = ref<VForm | null>(null)
const snackbar = reactive<Snackbar>({
  show: false,
  message: '',
  color: 'success',
})

// Mock state program list (replace with API call)
const statePrograms: Program[] = [
  { id: 1, name: 'Welding Technology', category: 'Trades' },
  { id: 2, name: 'Nursing Assistant', category: 'Healthcare' },
  { id: 3, name: 'Cybersecurity', category: 'Information Technology' },
  { id: 4, name: 'Automotive Repair', category: 'Trades' },
  { id: 5, name: 'Graphic Design', category: 'Arts' },
]

// Mock current programs for the school (replace with API call)
const currentPrograms = ref<Program[]>([
  {
    id: 2,
    name: 'Nursing Assistant',
    category: 'Healthcare',
    description: 'Prepares students for healthcare careers.',
  },
])

// Filter out programs already added to the school
const availablePrograms = computed<Program[]>(() => {
  const currentProgramIds = currentPrograms.value.map((p) => p.id)
  return statePrograms.filter((program) => !currentProgramIds.includes(program.id))
})

function truncate(text?: string, length = 100): string {
  if (!text) return ''
  return text.length <= length ? text : text.substring(0, length) + '...'
}

const addProgram = async () => {
  if (!form.value) return
  const result = await form.value.validate()
  if (!result.valid) return

  loading.value = true
  try {
    // Simulate API call to add program
    await new Promise((resolve) => setTimeout(resolve, 800)) // Mock delay
    if (selectedProgram.value) {
      currentPrograms.value.push({
        ...selectedProgram.value,
        description: description.value || undefined,
      })
      snackbar.show = true
      snackbar.message = `${selectedProgram.value.name} added to the program list!`
      snackbar.color = 'success'
      // Reset form
      selectedProgram.value = null
      description.value = ''
      form.value.resetValidation()
    }
  } catch (error) {
    snackbar.show = true
    snackbar.message = 'Failed to add program. Please try again.'
    snackbar.color = 'error'
  } finally {
    loading.value = false
  }
}

const removeProgram = async (programId: number) => {
  loading.value = true
  try {
    // Simulate API call to remove program
    await new Promise((resolve) => setTimeout(resolve, 600)) // Mock delay
    const program = currentPrograms.value.find((p) => p.id === programId)
    currentPrograms.value = currentPrograms.value.filter((p) => p.id !== programId)
    snackbar.show = true
    snackbar.message = `${program?.name} removed from the program list!`
    snackbar.color = 'success'
  } catch (error) {
    snackbar.show = true
    snackbar.message = 'Failed to remove program. Please try again.'
    snackbar.color = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Ensure form elements are accessible and visually consistent */
.v-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.8rem !important;
  }
  .v-btn {
    font-size: 0.9rem;
  }
  .v-list-item {
    padding: 8px 0;
  }
}
</style>
