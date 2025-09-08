<template>
  <v-container class="py-10 home-view" fluid>
    <div class="d-flex align-center flex-wrap gap-4 mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">{{ schoolName || 'School' }}</h1>
        <div class="text-medium-emphasis text-caption" v-if="schoolMotto">{{ schoolMotto }}</div>
      </div>
    </div>

    <v-alert v-if="classesError" type="error" variant="tonal" density="comfortable" class="mb-6">
      {{ classesError }}
    </v-alert>

    <v-skeleton-loader
      v-if="loadingClasses && !classes.length"
      type="table"
      class="mb-8"
      :loading="true"
    />

    <section v-if="classes.length" class="classes-section py-2">
      <v-row class="mb-8" justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h5 font-weight-bold text-primary mb-2">Classes</h2>
          <v-text-field
            v-model="search"
            placeholder="Search classes"
            density="comfortable"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="mx-auto"
            style="max-width: 340px"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="c in filteredClasses"
          :key="c.id || c.alias"
          cols="12"
          md="8"
          lg="3"
          class="mb-10"
        >
          <!-- Image Card -->
          <v-card class="class-image-card mb-4" elevation="8" rounded="xl" @click="openClass(c)">
            <v-img :src="imageForClass(c)" height="220" cover class="project-image"> </v-img>
          </v-card>
          <!-- Content Card -->
          <v-card
            class="class-content-card"
            elevation="0"
            rounded="xl"
            @click="openClass(c)"
            style="cursor: pointer"
          >
            <v-card-text class="pa-6">
              <div class="mb-3">
                <h4
                  class="text-h6 font-weight-bold text-primary mb-1 text-truncate"
                  :title="c.alias"
                >
                  {{ c.alias }}
                </h4>
                <p class="text-subtitle-2 text-grey-darken-2 mb-2 text-truncate" :title="c.program">
                  {{ c.program }}
                </p>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4 two-line-clamp" :title="c.course">
                {{ c.course }}
              </p>
              <div class="d-flex align-center justify-space-between">
                <div
                  class="text-caption font-weight-medium text-truncate"
                  style="max-width: 70%"
                  :title="c.teacher"
                >
                  {{ c.teacher }}
                </div>
                <v-icon size="18" color="primary" v-if="c.id">mdi-eye</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <!-- Empty state when there are no classes -->
    <div
      v-else-if="!loadingClasses"
      class="empty-state d-flex flex-column align-center justify-center text-center my-16"
    >
      <v-sheet class="pa-10 empty-sheet" color="surface" rounded="xl" elevation="0" border>
        <v-icon size="56" color="primary" class="mb-3">mdi-school-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-2">No classes yet</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Set up your programs and create your first class to get started.
        </p>
        <v-btn
          color="primary"
          size="large"
          rounded="lg"
          prepend-icon="mdi-rocket-launch-outline"
          :to="{ name: 'onboard' }"
        >
          Start onboarding
        </v-btn>
      </v-sheet>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import chalk from 'chalk'

// Basic school info (placeholder endpoint; adjust if different)
const schoolName = ref<string>('')
const schoolMotto = ref<string>('')
const loadingSchool = ref(false)

async function fetchSchool() {
  loadingSchool.value = true
  try {
    // Adjust endpoint to your backend; using placeholder
    const { data } = await api.get('/cte-school-district/1') //change later
    // Accept flexible shapes
    schoolName.value = data?.name || data?.school_name || 'Your School'
    schoolMotto.value = data?.motto || ''
    console.log(chalk.blue('Hello world!'))
  } catch {
    schoolName.value = 'Your School'
  } finally {
    loadingSchool.value = false
  }
}

interface ClassRow {
  id: number | string
  program: string
  course: string
  teacher: string
  alias: string
}

const classes = ref<ClassRow[]>([])
const loadingClasses = ref(false)
const classesError = ref<string | null>(null)
const search = ref('')

// (table headers removed; using card layout)

async function fetchClasses() {
  loadingClasses.value = true
  classesError.value = null
  try {
    const { data } = await api.get('/courses')
    // Accept multiple shapes: array, { items: [] }, { courses: [] }
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.courses)
        ? data.courses
        : Array.isArray(data?.items)
          ? data.items
          : []
    classes.value = raw.map((c) => {
      // users can be an object or array (pick first)
      const user = Array.isArray(c.users) ? c.users[0] : c.users
      // Fallback id if backend omitted it to avoid Router navigation errors
      const fallbackId = c.course_catalog?.id || c.course_catalog?.course_code || null
      return {
        id: c.id ?? fallbackId,
        alias: c.alias || c.course_catalog?.course_name || 'Untitled',
        program:
          c.program?.program_catalog?.code && c.program?.program_catalog?.name
            ? `${c.program.program_catalog.code} — ${c.program.program_catalog.name}`
            : c.program_code_name || c.program?.name || '—',
        course:
          c.course_catalog?.course_code && c.course_catalog?.course_name
            ? `${c.course_catalog.course_code} — ${c.course_catalog.course_name}`
            : c.course_code_name || c.course_catalog?.course_name || '—',
        teacher: user?.name || '—',
      }
    })
  } catch (e: any) {
    classesError.value = e?.message || 'Failed to load classes'
  } finally {
    loadingClasses.value = false
  }
}

const filteredClasses = computed(() => {
  if (!search.value.trim()) return classes.value
  const q = search.value.toLowerCase()
  return classes.value.filter(
    (c) =>
      c.alias.toLowerCase().includes(q) ||
      c.program.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q) ||
      c.teacher.toLowerCase().includes(q),
  )
})

// --- Card helpers ---
const router = useRouter()
function goToClass(c: ClassRow) {
  console.log(c.id)
  if (!c.id) return
  router.push({ name: 'class-view', params: { id: c.id } })
}

function openClass(c: ClassRow) {
  goToClass(c)
}

// Simple deterministic image selection based on course/program codes
const stockImages = [
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1600195077075-7c815f540a3c?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
]
function imageForClass(c: ClassRow) {
  const key = (c.course || c.program || c.alias || '').length
  return stockImages[key % stockImages.length]
}

onMounted(() => {
  console.log('[Home] mounted')
  fetchSchool()
  fetchClasses()
})
</script>

<style scoped>
.classes-table :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.classes-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc;
}
.link-hover:hover {
  text-decoration: underline;
}
.gap-4 {
  gap: 1rem;
}
/* Empty state */
.empty-state {
  min-height: 50vh;
}
.empty-sheet {
  max-width: 560px;
}
/* Portfolio style cards */
.class-image-card {
  overflow: hidden;
  transition:
    transform 0.35s cubic-bezier(0.16, 0.8, 0.24, 1),
    box-shadow 0.3s;
}
.class-image-card .v-img::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.55) 100%);
  opacity: 0.7;
  transition: opacity 0.3s;
}
.class-image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px -8px rgba(0, 0, 0, 0.35);
}
.class-image-card:hover .v-img::after {
  opacity: 0.9;
}
.class-image-card .class-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.28s;
}
.class-image-card:hover .class-overlay {
  opacity: 1;
}
.overlay-buttons .overlay-btn {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.45);
}
.class-content-card {
  transition:
    box-shadow 0.3s,
    transform 0.35s cubic-bezier(0.16, 0.8, 0.24, 1);
}
.class-content-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -6px rgba(0, 0, 0, 0.28);
}
.two-line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
