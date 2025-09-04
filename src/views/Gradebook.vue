<template>
  <v-container class="py-10">
    <h1 class="text-h4 font-weight-bold mb-8">Gradebook</h1>

    <div v-if="error" class="text-error mb-4">{{ error }}</div>
    <div v-if="loading" class="mb-4">Loading gradebook...</div>

    <div class="table-scroll-wrapper" v-if="!loading">
      <v-data-table
        :headers="headers"
        :items="items"
        fixed-header
        height="500"
        class="sticky-first-col gradebook-table"
        density="comfortable"
        :items-per-page="-1"
        :no-data-text="error || 'No data'"
      >
        <!-- Assignment score cells -->
        <template v-for="a in assignmentKeys" :key="a" v-slot:[`item.${a}`]="{ value }">
          <span>{{ value == null ? '—' : value }}</span>
        </template>
        <!-- Average column bold -->
        <template #item.average="{ value }">
          <strong>{{ value == null ? '—' : value }}</strong>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import api from '../api'

interface Assignment {
  id: number
  name: string
  max_score: number
  weight: number
  due_date: string | null
}
interface GradeCell {
  gradeId: number
  score: number
  pass_fail: string | null
  letter: string | null
  updatedAt: string
}
interface Row {
  studentId: number
  studentName: string
  grades: Record<string, GradeCell | null>
}
interface GradebookMatrix {
  courseId: number
  assignments: Assignment[]
  students: { id: number; firstName: string; lastName: string }[]
  rows: Row[]
  meta: { assignmentCount: number; studentCount: number; generatedAt: string }
}

type DataTableHeader = {
  title: string
  key: string
  sortable?: boolean
  align?: 'start' | 'end' | 'center'
}

const headers = ref<DataTableHeader[]>([])
const items = ref<Record<string, any>[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const assignmentKeys = ref<string[]>([])

async function fetchGradebook(courseId: number) {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get<GradebookMatrix>(`/gradebook/${courseId}/matrix`)
    buildTable(data)
  } catch (e: any) {
    error.value = e?.message || 'Failed to load gradebook'
  } finally {
    loading.value = false
  }
}

function buildTable(matrix: GradebookMatrix) {
  // Build headers: first Student then each assignment, finally Average
  headers.value = [
    { title: 'Student', key: 'studentName', sortable: true, align: 'start' },
    ...matrix.assignments.map((a) => ({ title: a.name, key: `a_${a.id}`, sortable: false })),
    { title: 'Average', key: 'average', sortable: true },
  ]

  assignmentKeys.value = matrix.assignments.map((a) => `a_${a.id}`)

  items.value = matrix.rows.map((r) => {
    const row: Record<string, any> = { studentName: r.studentName }
    let sum = 0
    let count = 0
    for (const a of matrix.assignments) {
      const key = `a_${a.id}`
      const g = r.grades[String(a.id)]
      const score = g?.score ?? null
      if (score != null) {
        sum += score
        count++
      }
      row[key] = score
    }
    row.average = count ? +(sum / count).toFixed(2) : null
    return row
  })
}

onMounted(() => {
  fetchGradebook(1)
})

// Optional: expose computed total students / assignments if needed elsewhere
const totalStudents = computed(() => items.value.length)
const totalAssignments = computed(() => assignmentKeys.value.length)
</script>

<style scoped>
/* Wrapper to allow horizontal scrolling */
.table-scroll-wrapper {
  overflow: auto;
  max-width: 100%;
}

/* Allow the table to expand beyond container width for horizontal scroll */
.sticky-first-col :deep(table) {
  width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

/* Base cells */
.gradebook-table :deep(th),
.gradebook-table :deep(td) {
  white-space: nowrap;
  padding: 6px 12px;
  font-variant-numeric: tabular-nums;
}

/* Header styling */
.gradebook-table :deep(thead th) {
  background: var(--v-theme-primary) !important;
  /* color: #fff !important; */
  font-weight: 600;
  top: 0;
  border-bottom: 2px solid rgba(255, 255, 255, 0.25);
}

/* Vertical dividers */
.gradebook-table :deep(thead th),
.gradebook-table :deep(tbody td) {
  border-right: 1px solid var(--v-theme-outline-variant);
}
.gradebook-table :deep(thead th:last-child),
.gradebook-table :deep(tbody td:last-child) {
  border-right: none;
}

/* Row striping */
.gradebook-table :deep(tbody tr:nth-child(even) td) {
  background: color-mix(in srgb, var(--v-theme-surface) 95%, var(--v-theme-primary));
}

/* Hover highlight */
.gradebook-table :deep(tbody tr:hover td) {
  background: color-mix(in srgb, var(--v-theme-primary) 18%, var(--v-theme-surface));
}

/* Average column emphasis */
.gradebook-table :deep(tbody td:last-child) {
  font-weight: 600;
}

/* Sticky first column */
.sticky-first-col :deep(table thead th:first-child),
.sticky-first-col :deep(table tbody td:first-child) {
  position: sticky;
  left: 0;
  background: var(--v-theme-primary) !important;
  /* color: #fff; */
  box-shadow: 2px 0 0 var(--v-theme-outline-variant);
  z-index: 4;
}

/* Maintain striping for sticky first cell on even rows */
.gradebook-table :deep(tbody tr:nth-child(even) td:first-child) {
  background: color-mix(in srgb, var(--v-theme-primary) 15%, var(--v-theme-surface)) !important;
}

/* Elevate first header cell */
.sticky-first-col :deep(table thead th:first-child) {
  z-index: 6;
}
</style>
