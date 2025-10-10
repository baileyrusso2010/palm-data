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
        <v-card ref="leftCard" class="pa-6" elevation="2" rounded="lg">
          <v-card-title class="text-h5 font-weight-medium"> Add New Program </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="addProgram">
              <!-- Program Dropdown -->
              <v-combobox
                v-model="selectedProgram"
                :items="availablePrograms"
                label="Select Program"
                item-title="title"
                item-value="id"
                return-object
                :rules="[(v) => !!v || 'Program is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select a program from the state list"
                :disabled="loadingPrograms || availablePrograms.length === 0"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.title" />
                </template>
                <template #no-data>
                  <v-list-item
                    :title="loadingPrograms ? 'Loading programs…' : 'No programs available to add'"
                  />
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
                :disabled="!valid || loading || loadingPrograms || availablePrograms.length === 0"
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
        <v-card
          class="pa-6 d-flex flex-column"
          :style="{ height: rightCardHeight }"
          elevation="2"
          rounded="lg"
        >
          <v-card-title class="text-h5 font-weight-medium"> Current Programs </v-card-title>
          <v-card-text class="flex-grow-1" style="min-height: 200">
            <div class="overflow-auto">
              <v-list v-if="currentPrograms.length > 0">
                <v-list-item v-for="program in currentPrograms" :key="program.id" class="mb-2">
                  <v-list-item-content>
                    <v-list-item-title class="text-h6">{{ program.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      program.state_program_code || program.category
                    }}</v-list-item-subtitle>
                    <v-list-item-subtitle v-if="program.description">
                      {{ truncate(program.description, 100) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="outlined"> No programs added yet. </v-alert>
            </div>
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
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import type { VForm } from 'vuetify/components'
import api from '../api'

interface Program {
  id: number
  state_program_code: string
  title: string
  description?: string
  // Optional fields in case backend includes categorization
  category?: string | null
}

interface Snackbar {
  show: boolean
  message: string
  color: 'success' | 'error'
}

interface School {
  id: number
  name: string
}

const schoolName = ref<string>('Orleans/Niagra Boces') // Replace with dynamic value
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

// State program list from API
const statePrograms = ref<Program[]>([])
const loadingPrograms = ref<boolean>(false)
// Current programs from API
const currentPrograms = ref<Program[]>([])
const loadingCurrentPrograms = ref<boolean>(false)
// Height sync: measure left card and apply to right card
const leftCard = ref<HTMLElement | null>(null)
const rightCardHeight = ref<string>('')

// TODO: Replace with real district selection/context
const districtId = 1

onMounted(async () => {
  // Fetch state program catalog
  loadingPrograms.value = true
  try {
    const resp = await api.get('/program-catalogs')
    console.log('Program catalogs response:', resp)
    // Accept either { items: Program[] } or raw Program[]
    const items = Array.isArray(resp.data) ? resp.data : resp.data?.items
    statePrograms.value = (items || []) as Program[]
  } catch (error) {
    console.error('Failed to fetch program catalogs:', error)
    snackbar.show = true
    snackbar.message = 'Unable to load program catalog.'
    snackbar.color = 'error'
  } finally {
    loadingPrograms.value = false
  }

  // Fetch current programs for district
  await fetchCurrentPrograms()
  await nextTick()
  updateRightCardHeight()
  window.addEventListener('resize', updateRightCardHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateRightCardHeight)
})

function updateRightCardHeight() {
  if (leftCard.value) {
    const h = leftCard.value.offsetHeight
    rightCardHeight.value = h ? `${h}px` : ''
  }
}

function normalizeToProgram(input: any): Program | null {
  if (!input || typeof input !== 'object') return null
  // Direct shape already matches Program
  if ('id' in input && 'title' in input) {
    return {
      id: Number((input as any).id),
      state_program_code: (input as any).state_program_code ?? (input as any).code ?? '',
      title: (input as any).title ?? (input as any).name ?? '',
      description: (input as any).description ?? undefined,
      category: (input as any).category ?? null,
    }
  }
  // Nested shapes
  const nested = (input as any).program || (input as any).catalog || (input as any).program_catalog
  if (nested && typeof nested === 'object') {
    return normalizeToProgram(nested)
  }
  return null
}

async function fetchCurrentPrograms() {
  loadingCurrentPrograms.value = true
  try {
    const resp = await api.get(`/cte-districts/${districtId}/programs/current`)
    const raw = Array.isArray(resp.data) ? resp.data : resp.data?.programs
    const normalized = (raw || []).map((p: any) => normalizeToProgram(p)).filter(Boolean)
    currentPrograms.value = normalized as Program[]
  } catch (error) {
    console.error('Failed to fetch current programs:', error)
    snackbar.show = true
    snackbar.message = 'Unable to load current programs.'
    snackbar.color = 'error'
  } finally {
    loadingCurrentPrograms.value = false
    await nextTick()
    updateRightCardHeight()
  }
}

// Filter out programs already added to the school
const availablePrograms = computed<Program[]>(() => {
  const currentProgramIds = currentPrograms.value.map((p) => p.id)
  return statePrograms.value.filter((program) => !currentProgramIds.includes(program.id))
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
    if (selectedProgram.value) {
      await api.post('/cte-district-programs', {
        cte_district_id: districtId,
        program_id: selectedProgram.value.id,
      })
      // Refresh current programs after successful add
      await fetchCurrentPrograms()
      snackbar.show = true
      snackbar.message = `${selectedProgram.value.title} added to the program list!`
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
    snackbar.message = `${program?.title} removed from the program list!`
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
