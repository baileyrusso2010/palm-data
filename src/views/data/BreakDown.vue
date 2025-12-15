<template>
  <v-card class="filters-card" flat>
    <v-card-title class="py-3">Filters</v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pt-4">
      <div class="filter-group">
        <p class="helper-label">Metric</p>
        <v-select
          v-model="selectedMetric"
          :items="metrics"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="emitFilters"
        />
      </div>

      <div class="filter-group">
        <p class="helper-label">Date Range</p>
        <v-select
          v-model="dateRange"
          :items="dateRanges"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="emitFilters"
        />
      </div>

      <div class="filter-group">
        <p class="helper-label">School</p>
        <v-select
          v-model="selectedSchool"
          :items="schoolOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="emitFilters"
        />
      </div>

      <div class="filter-group">
        <p class="helper-label">Grade / Class</p>
        <v-select
          v-model="selectedGrade"
          :items="gradeOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="emitFilters"
        />
      </div>

      <div class="filter-group">
        <p class="helper-label">Demographics (optional)</p>
        <v-select
          v-model="selectedDemographic"
          :items="demographicOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          @update:model-value="emitFilters"
        />
      </div>

      <p class="helper">Showing: {{ currentSummary }}</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type FilterPayload = {
  metric: string
  dateRange: string
  school: string
  grade: string
  demographic: string | null
}

const emit = defineEmits<{ (e: 'change', value: FilterPayload): void }>()

const metrics = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'assessments', label: 'Assessments' },
  { value: 'behavior', label: 'Behavior Incidents' },
]

const dateRanges = [
  { value: 'last7', label: 'Last 7 days' },
  { value: 'month', label: 'This Month' },
  { value: 'semester', label: 'This Semester' },
]

const schoolOptions = [
  { value: 'all', label: 'All Schools' },
  { value: 'north', label: 'North High' },
  { value: 'south', label: 'South High' },
  { value: 'central', label: 'Central Academy' },
]

const gradeOptions = [
  { value: 'all', label: 'All Grades / Classes' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
]

const demographicOptions = [
  { value: 'none', label: 'All Demographics' },
  { value: 'ell', label: 'ELL' },
  { value: 'iep', label: 'IEP' },
  { value: 'econ', label: 'Economically Disadvantaged' },
]

const selectedMetric = ref(metrics[0].value)
const dateRange = ref(dateRanges[0].value)
const selectedSchool = ref(schoolOptions[0].value)
const selectedGrade = ref(gradeOptions[0].value)
const selectedDemographic = ref<string | null>(demographicOptions[0].value)

const currentSummary = computed(() => {
  const metricLabel = metrics.find((m) => m.value === selectedMetric.value)?.label
  const dateLabel = dateRanges.find((d) => d.value === dateRange.value)?.label
  const schoolLabel = schoolOptions.find((s) => s.value === selectedSchool.value)?.label
  const gradeLabel = gradeOptions.find((g) => g.value === selectedGrade.value)?.label
  const demoLabel = demographicOptions.find((d) => d.value === selectedDemographic.value)?.label
  return `${metricLabel} · ${dateLabel} · ${schoolLabel} · ${gradeLabel}${demoLabel ? ` · ${demoLabel}` : ''}`
})

const emitFilters = () => {
  emit('change', {
    metric: selectedMetric.value,
    dateRange: dateRange.value,
    school: selectedSchool.value,
    grade: selectedGrade.value,
    demographic: selectedDemographic.value,
  })
}
</script>

<style scoped>
.filters-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.helper-label {
  margin: 0;
  font-size: 0.9rem;
  color: #475467;
}

.helper {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #5f6b7a;
}
</style>
