<template>
  <v-container fluid class="d-flex align-center justify-center fill-height bg-grey-lighten-5 pa-0">
    <v-card class="w-100 h-100 rounded-0 d-flex flex-column" flat>
      <!-- Header -->
      <div class="px-8 py-6 bg-white border-b border-opacity-50">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">New Evaluation</h1>
        <p class="text-subtitle-1 text-grey-darken-1 mt-1">
          Select a form to begin the evaluation process
        </p>
      </div>

      <!-- Main Content -->
      <v-row class="flex-grow-1 ma-0 overflow-hidden">
        <!-- Sidebar / Stepper Indicator (Visual only for now matching "Step 1") -->
        <v-col cols="12" md="3" lg="2" class="bg-grey-lighten-5 border-e pa-0 hidden-sm-and-down">
          <v-list class="bg-transparent py-4 text-left">
            <v-list-item
              prepend-icon="mdi-file-document-outline"
              title="Select Form"
              subtitle="Step 1"
              active
              active-color="primary"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-account-details-outline"
              title="Edit Form"
              subtitle="Step 2"
              disabled
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-pencil-box-outline"
              title="Deploy Form"
              subtitle="Step 3"
              disabled
            ></v-list-item>
          </v-list>
        </v-col>

        <!-- Selection Area -->
        <v-col cols="12" md="9" lg="10" class="d-flex flex-column h-100 pa-0 bg-white">
          <!-- Search / Filter -->
          <div class="px-8 pt-8 pb-4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search forms..."
              variant="outlined"
              density="comfortable"
              hide-details
              class="max-width-600 rounded-lg"
              bg-color="grey-lighten-5"
            ></v-text-field>
          </div>

          <!-- Scrollable List -->
          <div class="flex-grow-1 overflow-y-auto px-8 pb-4">
            <v-item-group v-model="selectedFormId">
              <v-row>
                <v-col v-for="form in filteredForms" :key="form.id" cols="12" lg="6" xl="4">
                  <v-item v-slot="{ isSelected, toggle }" :value="form.id">
                    <v-card
                      :color="isSelected ? 'primary-lighten-5' : 'white'"
                      :class="[
                        'transition-swing',
                        isSelected
                          ? 'border-primary v-card--active-border'
                          : 'border-grey-lighten-2',
                      ]"
                      class="d-flex align-center pa-4 cursor-pointer rounded-lg border"
                      elevation="0"
                      @click="toggle"
                      height="100%"
                    >
                      <!-- Icon Box -->
                      <v-avatar
                        :color="isSelected ? 'primary' : 'grey-lighten-4'"
                        :variant="isSelected ? 'flat' : 'flat'"
                        size="56"
                        class="rounded-lg mr-4"
                      >
                        <v-icon :color="isSelected ? 'white' : 'grey-darken-1'" size="28">
                          {{ form.icon || 'mdi-file-edit-outline' }}
                        </v-icon>
                      </v-avatar>

                      <!-- Content -->
                      <div class="flex-grow-1">
                        <div class="d-flex justify-space-between align-start mb-1">
                          <h3
                            :class="isSelected ? 'text-primary' : 'text-grey-darken-3'"
                            class="text-h6 font-weight-bold mb-0"
                          >
                            {{ form.title }}
                          </h3>
                          <v-chip
                            size="x-small"
                            :color="form.categoryColor"
                            variant="tonal"
                            class="font-weight-medium"
                          >
                            {{ form.category }}
                          </v-chip>
                        </div>
                        <p class="text-body-2 text-grey-darken-1 mb-2 clamp-2">
                          {{ form.description }}
                        </p>
                        <div class="d-flex align-center text-caption text-grey">
                          <v-icon size="small" class="mr-1">mdi-format-list-checks</v-icon>
                          <span class="mr-3">{{ form.sections }} Sections</span>
                          <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                          <span>~{{ form.estimatedTime }} mins</span>
                        </div>
                      </div>

                      <!-- Checkmark -->
                      <div class="ml-4">
                        <v-icon
                          v-if="isSelected"
                          color="primary"
                          icon="mdi-check-circle"
                          size="32"
                        ></v-icon>
                        <v-icon
                          v-else
                          color="grey-lighten-2"
                          icon="mdi-circle-outline"
                          size="32"
                        ></v-icon>
                      </div>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>

            <div v-if="filteredForms.length === 0" class="text-center mt-12">
              <v-icon size="64" color="grey-lighten-2">mdi-file-search-outline</v-icon>
              <h3 class="text-h6 text-grey mt-4">No forms found</h3>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-8 py-6 border-t bg-white d-flex align-center justify-end">
            <!-- Selected Info (optional) -->
            <div
              v-if="selectedFormId"
              class="mr-auto d-flex align-center text-body-2 text-grey-darken-2"
            >
              <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
              Selected: <span class="font-weight-bold ml-1">{{ getSelectedForm?.title }}</span>
            </div>

            <v-btn
              variant="text"
              color="grey-darken-1"
              class="mr-4 text-none font-weight-regular"
              size="large"
            >
              Cancel
            </v-btn>
            <v-btn
              color="black"
              size="large"
              class="px-8 text-none font-weight-bold rounded-lg"
              elevation="2"
              :disabled="!selectedFormId"
              @click="handleContinue"
            >
              Continue
              <v-icon right class="ml-2">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const selectedFormId = ref<number | null>(null)

// Mock Data
const forms = [
  {
    id: 1,
    title: 'Behavioral Assessment',
    category: 'Behavioral',
    categoryColor: 'orange',
    description: 'Weekly student behavior tracking and assessment form.',
    sections: 4,
    estimatedTime: 5,
    icon: 'mdi-account-alert-outline',
  },
  {
    id: 2,
    title: 'Academic Progress Report',
    category: 'Academic',
    categoryColor: 'blue',
    description: 'Quarterly evaluation of academic performance across core subjects.',
    sections: 6,
    estimatedTime: 15,
    icon: 'mdi-school-outline',
  },
  {
    id: 3,
    title: 'Social Skills Observation',
    category: 'Social',
    categoryColor: 'teal',
    description: 'Observation checklist for peer interactions and group activities.',
    sections: 3,
    estimatedTime: 8,
    icon: 'mdi-account-group-outline',
  },
  {
    id: 4,
    title: 'IEP Goal Tracking',
    category: 'Special Ed',
    categoryColor: 'purple',
    description: 'Tracking progress towards specific IEP goals.',
    sections: 5,
    estimatedTime: 10,
    icon: 'mdi-bullseye-arrow',
  },
  {
    id: 5,
    title: 'Speech Therapy Log',
    category: 'Therapy',
    categoryColor: 'pink',
    description: 'Log for speech therapy sessions and progress notes.',
    sections: 2,
    estimatedTime: 5,
    icon: 'mdi-microphone-outline',
  },
]

// Filter logic
const filteredForms = computed(() => {
  if (!search.value) return forms
  const q = search.value.toLowerCase()
  return forms.filter(
    (f) => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q),
  )
})

const getSelectedForm = computed(() => forms.find((f) => f.id === selectedFormId.value))

function handleContinue() {
  if (selectedFormId.value) {
    // For now, log or dummy navigate. Adjust route as needed.
    console.log('Selected Form ID:', selectedFormId.value)
    // Could navigate to the create form with ID
    // router.push({ name: 'create-form', params: { id: selectedFormId.value } })
  }
}
</script>

<style scoped>
.v-card--active-border {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
/*.v-container {
    max-width: 1400px;
}*/
</style>
