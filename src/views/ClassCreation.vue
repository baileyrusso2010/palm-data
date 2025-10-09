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

    <!-- Class Creation + Current Classes (two-column layout) -->
    <v-row class="g-6" align="start" justify="center">
      <v-col cols="12" md="6">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <v-card-title class="text-h5 font-weight-medium"> Create New Class </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="addClass">
              <!-- Program Dropdown -->
              <v-combobox
                v-model="selectedProgram"
                :items="programs"
                label="Select Program"
                item-title="name"
                item-value="id"
                :rules="[(v) => !!v || 'Program is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select a program for the class"
                :disabled="programs.length === 0"
                @update:modelValue="loadCourses"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="item.raw.category"
                  />
                </template>
                <template #no-data>
                  <v-list-item title="No programs available" />
                </template>
              </v-combobox>

              <!-- Courses Multi-Select -->
              <v-select
                v-model="selectedCourse"
                :items="availableCourses"
                label="Select Courses"
                item-title="name"
                item-value="id"
                :rules="[(v) => !!v || 'Course is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select courses for the class"
                :disabled="!selectedProgram || availableCourses.length === 0"
              />

              <!-- Session Dropdown -->
              <v-select
                v-model="timeSlot"
                :items="timeSlots"
                label="Session"
                :rules="[(v) => !!v || 'Session is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select session"
              />

              <v-select
                v-model="instructor"
                :items="instructors"
                label="Instructor"
                :rules="[(v) => !!v || 'Instructor is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select session"
              />

              <!-- Alias Input -->
              <v-text-field
                v-model="alias"
                label="Class Alias"
                :rules="[(v) => !!v || 'Alias is required']"
                variant="outlined"
                density="comfortable"
                placeholder="e.g., Welding 101"
                class="mb-4"
                aria-label="Enter a unique alias for the class"
              />

              <!-- Add Button -->
              <v-btn
                color="primary"
                type="submit"
                :disabled="
                  !valid ||
                  loading ||
                  programs.length === 0 ||
                  availableCourses.length === 0 ||
                  selectedCourse === null ||
                  timeSlot === null
                "
                :loading="loading"
                block
                size="large"
                class="mt-2"
                aria-label="Add class to school list"
              >
                Add Class
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- Right: Current Classes List -->
      <v-col cols="12" md="6">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <v-card-title class="text-h5 font-weight-medium"> Current Classes </v-card-title>
          <v-card-text>
            <v-list v-if="currentClasses.length > 0">
              <v-list-item v-for="classItem in currentClasses" :key="classItem.id" class="mb-2">
                <v-list-item-content>
                  <v-list-item-title class="text-h6">{{ classItem.alias }}</v-list-item-title>
                  <v-list-item-subtitle>Program: {{ classItem.program.name }}</v-list-item-subtitle>
                  <v-list-item-subtitle
                    >Session: {{ classItem.session ?? '-' }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle>
                    Courses: {{ truncate(classItem.courses.map((c) => c.name).join(', '), 100) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn
                    color="error"
                    icon
                    @click="removeClass(classItem.id)"
                    aria-label="Remove class"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="outlined"> No classes created yet. </v-alert>
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

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue'
import type { VForm } from 'vuetify/components'

interface Program {
  id: number
  name: string
  category: string
}

interface Course {
  id: number
  name: string
  programId: number
}

interface Class {
  id: number
  alias: string
  program: Program
  courses: Course[]
  session?: string
}

interface Snackbar {
  show: boolean
  message: string
  color: 'success' | 'error'
}

export default defineComponent({
  name: 'CreateClass',
  setup() {
    const schoolName = ref<string>('Springfield CTE High School') // Replace with dynamic value
    const valid = ref<boolean>(false)
    const selectedProgram = ref<Program | null>(null)
    const selectedCourse = ref<number | null>(null)
    const alias = ref<string>('')
    const timeSlots = ['Morning', 'Afternoon', 'All Day']
    const timeSlot = ref<string | null>(null)

    const instructors = ['John Doe', 'Jane Smith', 'Emily Johnson'] // Mock instructors
    const instructor = ref<string | null>(null)
    const loading = ref<boolean>(false)
    const form = ref<VForm | null>(null)
    const snackbar = reactive<Snackbar>({
      show: false,
      message: '',
      color: 'success',
    })

    // Mock programs (from state list, as in AddProgram.vue)
    const programs: Program[] = [
      { id: 1, name: 'Welding Technology', category: 'Trades' },
      { id: 2, name: 'Nursing Assistant', category: 'Healthcare' },
      { id: 3, name: 'Cybersecurity', category: 'Information Technology' },
    ]

    // Mock courses tied to programs (replace with API call)
    const allCourses: Course[] = [
      { id: 1, name: 'Welding Basics', programId: 1 },
      { id: 2, name: 'Advanced Welding', programId: 1 },
      { id: 3, name: 'Patient Care Fundamentals', programId: 2 },
      { id: 4, name: 'Medical Terminology', programId: 2 },
      { id: 5, name: 'Network Security', programId: 3 },
      { id: 6, name: 'Ethical Hacking', programId: 3 },
    ]

    // Mock current classes (replace with API call)
    const currentClasses = ref<Class[]>([
      {
        id: 1,
        alias: 'Welding 101',
        program: { id: 1, name: 'Welding Technology', category: 'Trades' },
        courses: [
          { id: 1, name: 'Welding Basics', programId: 1 },
          { id: 2, name: 'Advanced Welding', programId: 1 },
        ],
      },
    ])

    // Filter courses based on selected program
    const availableCourses = computed<Course[]>(() => {
      if (!selectedProgram.value) return []
      return allCourses.filter((course) => course.programId === selectedProgram.value!.id)
    })

    // Load courses when program changes
    const loadCourses = () => {
      selectedCourse.value = null // Reset selected course when program changes
    }

    function truncate(text?: string, length = 100): string {
      if (!text) return ''
      return text.length <= length ? text : text.substring(0, length) + '...'
    }

    const addClass = async () => {
      if (!form.value) return
      const result = await form.value.validate()
      if (!result.valid) return
      if (selectedCourse.value === null) {
        snackbar.show = true
        snackbar.message = 'Select a course.'
        snackbar.color = 'error'
        return
      }
      if (timeSlot.value === null) {
        snackbar.show = true
        snackbar.message = 'Select a session.'
        snackbar.color = 'error'
        return
      }

      loading.value = true
      try {
        // Simulate API call to add class
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock delay
        if (selectedProgram.value) {
          // Check for duplicate class by program
          const existingClass = currentClasses.value.find(
            (c) => c.program.id === selectedProgram.value!.id,
          )
          if (existingClass) {
            throw new Error('A class for this program already exists.')
          }

          const picked = allCourses.find((c) => c.id === selectedCourse.value)
          if (!picked) {
            throw new Error('Selected course not found.')
          }
          const newClass: Class = {
            id: currentClasses.value.length + 1, // Mock ID
            alias: alias.value,
            program: selectedProgram.value,
            courses: [picked],
            session: timeSlot.value,
          }
          currentClasses.value.push(newClass)
          snackbar.show = true
          snackbar.message = `Class ${alias.value} added successfully!`
          snackbar.color = 'success'
          // Reset form
          selectedProgram.value = null
          selectedCourse.value = null
          timeSlot.value = null
          alias.value = ''
          form.value.resetValidation()
        }
      } catch (error: any) {
        snackbar.show = true
        snackbar.message = error.message || 'Failed to add class. Please try again.'
        snackbar.color = 'error'
      } finally {
        loading.value = false
      }
    }

    const removeClass = async (classId: number) => {
      loading.value = true
      try {
        // Simulate API call to remove class
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock delay
        const classItem = currentClasses.value.find((c) => c.id === classId)
        currentClasses.value = currentClasses.value.filter((c) => c.id !== classId)
        snackbar.show = true
        snackbar.message = `Class ${classItem?.alias} removed successfully!`
        snackbar.color = 'success'
      } catch (error) {
        snackbar.show = true
        snackbar.message = 'Failed to remove class. Please try again.'
        snackbar.color = 'error'
      } finally {
        loading.value = false
      }
    }

    return {
      schoolName,
      valid,
      selectedProgram,
      selectedCourse,
      timeSlots,
      timeSlot,
      instructor,
      instructors,
      alias,
      loading,
      snackbar,
      programs,
      availableCourses,
      currentClasses,
      form,
      truncate,
      loadCourses,
      addClass,
      removeClass,
    }
  },
})
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
