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
                item-title="title"
                item-value="id"
                return-object
                :rules="[rules.programRequired]"
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
                    :title="item.raw.title"
                    :subtitle="item.raw.state_program_code || item.raw.category || ''"
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
                :rules="[rules.courseRequired]"
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
                :rules="[rules.sessionRequired]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select session"
              />

              <v-select
                v-model="instructor"
                :items="instructors"
                label="Instructor"
                :rules="[rules.instructorRequired]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                aria-label="Select session"
              />

              <!-- Alias Input -->
              <v-text-field
                v-model="alias"
                label="Class Alias"
                :rules="[rules.aliasRequired]"
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
          <v-card-text class="overflow-auto" style="max-height: 50vh">
            <v-list v-if="currentClasses.length > 0">
              <v-list-item v-for="classItem in currentClasses" :key="classItem.id" class="mb-2">
                <v-list-item-content>
                  <v-list-item-title class="text-h6">{{ classItem.alias }}</v-list-item-title>
                  <v-list-item-subtitle
                    >Program: {{ classItem.program.title }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle
                    >Session: {{ classItem.session ?? '-' }}</v-list-item-subtitle
                  >
                  <v-list-item-subtitle>
                    Courses: {{ truncate(classItem.courses.map((c) => c.name).join(', '), 100) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <!-- <template #append>
                  <v-btn
                    color="error"
                    icon
                    @click="removeClass(classItem.id)"
                    aria-label="Remove class"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template> -->
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
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
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

interface Course {
  id: number
  name: string
  course_code?: string
  title?: string
  description?: string | null
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

    // Typed validation rules for Vuetify inputs
    const rules = {
      programRequired: (v: unknown) => (!!v ? true : 'Program is required'),
      courseRequired: (v: unknown) => (!!v ? true : 'Course is required'),
      sessionRequired: (v: unknown) => (!!v ? true : 'Session is required'),
      instructorRequired: (v: unknown) => (!!v ? true : 'Instructor is required'),
      aliasRequired: (v: unknown) =>
        typeof v === 'string' && v.trim() ? true : 'Alias is required',
    }

    // Programs from API (/cte-districts/:id/programs/current)
    const programs = ref<Program[]>([])

    // Courses from API (/course-catalogs)
    const allCourses = ref<Course[]>([])

    // District context (replace with dynamic source as needed)
    const districtId = 1

    async function fetchSchools() {
      loading.value = true

      try {
        const resp = await api.get('/cte-districts/1/schools')
      } catch (error) {
        console.error('Failed to fetch schools:', error)
        snackbar.show = true
        snackbar.message = 'Unable to load school information.'
        snackbar.color = 'error'
      } finally {
        loading.value = false
      }
    }

    async function fetchCurrentPrograms() {
      try {
        const resp = await api.get(`/cte-district-programs`)
        const list = Array.isArray(resp.data) ? resp.data : resp.data?.items || []
        // Filter by district and active if present
        const filtered = list.filter(
          (dp: any) =>
            (dp?.cte_district_id == null || Number(dp.cte_district_id) === districtId) &&
            (dp?.active == null || dp.active === true),
        )
        // Map to Program and de-duplicate by id
        const byId = new Map<number, Program>()
        for (const dp of filtered) {
          const cat = dp?.program_catalog || dp?.program || dp?.catalog || {}
          const programId = Number(dp?.program_id ?? cat?.id)
          const prog: Program = {
            id: programId,
            state_program_code: cat?.state_program_code ?? '',
            title: cat?.title ?? '',
            description: cat?.description ?? undefined,
            category: null,
          }
          if (!byId.has(prog.id)) byId.set(prog.id, prog)
        }
        programs.value = Array.from(byId.values())
      } catch (err) {
        console.error('Failed to load current programs', err)
        snackbar.show = true
        snackbar.message = 'Unable to load current programs.'
        snackbar.color = 'error'
      }
    }

    async function fetchCourseCatalogs() {
      try {
        const resp = await api.get('/course-catalogs')
        const items = Array.isArray(resp.data) ? resp.data : resp.data?.items
        allCourses.value = (items || []).map((c: any) => ({
          id: Number(c.id),
          name: c.title
            ? `${c.course_code ?? ''}${c.course_code ? ' - ' : ''}${c.title}`
            : (c.course_code ?? ''),
          course_code: c.course_code,
          title: c.title,
          description: c.description ?? null,
        }))
      } catch (err) {
        console.error('Failed to load courses', err)
        snackbar.show = true
        snackbar.message = 'Unable to load courses.'
        snackbar.color = 'error'
      }
    }

    onMounted(async () => {
      await Promise.all([fetchCurrentPrograms(), fetchCourseCatalogs(), fetchCurrentClasses()])
    })

    const currentClasses = ref<Class[]>([])

    function normalizeToProgram(src: any): Program {
      return {
        id: Number(src?.id ?? src?.program_id ?? 0),
        state_program_code: src?.state_program_code ?? src?.code ?? '',
        title: src?.title ?? src?.name ?? '',
        description: src?.description ?? undefined,
        category: src?.category ?? null,
      }
    }

    function normalizeToCourse(c: any): Course {
      const title = c?.title ?? c?.name ?? ''
      const course_code = c?.course_code
      return {
        id: Number(c?.id ?? c?.course_id ?? 0),
        name: title
          ? `${course_code ?? ''}${course_code ? ' - ' : ''}${title}`
          : (course_code ?? ''),
        course_code,
        title,
        description: c?.description ?? null,
      }
    }

    function normalizeToClass(input: any): Class | null {
      if (!input) return null
      const id = Number(input.id)
      const alias = input.alias ?? input.name ?? input.title ?? `Class #${id || ''}`
      const programSrc = input.program_catalog || input.program || input.programCatalog
      const program: Program = normalizeToProgram(programSrc ?? { id: input.program_id })
      const rawCourses = input.courses || input.class_courses || input.course_catalogs
      let courses: Course[] = []
      if (Array.isArray(rawCourses)) {
        courses = rawCourses.map((rc: any) => {
          const cat = rc?.course_catalog || rc?.catalog || rc
          return normalizeToCourse(cat)
        })
      } else if (input.course_catalog) {
        courses = [normalizeToCourse(input.course_catalog)]
      }
      const session = input.session ?? input.time_slot ?? input.term ?? undefined
      return { id, alias, program, courses, session }
    }

    async function fetchCurrentClasses() {
      try {
        // Primary endpoint: course-instances
        let data: any[] | undefined
        const resp = await api.get('/course-instances')
        const payload = resp.data
        data = Array.isArray(payload) ? payload : payload?.items || payload?.classes
        // Fallbacks if needed
        if (!data || data.length === 0) {
          try {
            const dResp = await api.get(`/cte-districts/${districtId}/classes`)
            const dPayload = dResp.data
            data = Array.isArray(dPayload) ? dPayload : dPayload?.items || dPayload?.classes
          } catch {}
        }
        if (!data || data.length === 0) {
          try {
            const cResp = await api.get('/classes')
            const cPayload = cResp.data
            data = Array.isArray(cPayload) ? cPayload : cPayload?.items || cPayload?.classes
          } catch {}
        }
        currentClasses.value = (data || []).map(normalizeToClass).filter(Boolean) as Class[]
      } catch (err) {
        console.error('Failed to load current classes', err)
        snackbar.show = true
        snackbar.message = 'Unable to load current classes.'
        snackbar.color = 'error'
      }
    }

    // Filter courses based on selected program
    const availableCourses = computed<Course[]>(() => {
      if (!selectedProgram.value) return []
      // Without program-course mapping from the API, present all courses for now
      return allCourses.value
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
        if (selectedProgram.value) {
          // Check for duplicate class by program
          // const existingClass = currentClasses.value.find(
          //   (c) => c.program.id === selectedProgram.value!.id,
          // )
          // if (existingClass) {
          //   throw new Error('A class for this program already exists.')
          // }

          const picked = allCourses.value.find((c) => c.id === selectedCourse.value)
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

          await api.post('/course-instances', {
            cte_school_id: 1, // Replace with actual school ID
            program_catalog_id: newClass.program.id,
            course_catalog_id: selectedCourse.value,
            alias: newClass.alias,
          })

          await fetchCurrentCourseInstances()
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

    async function fetchCurrentCourseInstances() {
      loading.value = true
      try {
        const resp = await api.get('/course-instances') //put schoolID later as filter
        const items = Array.isArray(resp.data) ? resp.data : resp.data?.items || []
        currentClasses.value = (items || []).map(normalizeToClass).filter(Boolean) as Class[]
      } catch (error) {
        console.error('Failed to fetch current classes:', error)
        snackbar.show = true
        snackbar.message = 'Unable to load current classes.'
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
      rules,
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
