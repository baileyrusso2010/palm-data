<template>
  <div class="page-shell">
    <div class="breakdown-layout">
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

          <v-btn block color="primary" @click="getFilteredData()">Search</v-btn>
        </v-card-text>
      </v-card>

      <v-card class="chart-card" flat>
        <v-card-title class="py-3 chart-header">
          <div>
            <div class="title">Metric Breakdown</div>
            <div class="subtitle">{{ currentSummary }}</div>
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <div class="chart-wrapper">
            <Bar :data="chartData" :options="chartOptions" :height="380" />
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '@/api'
import { Bar } from 'vue-chartjs'
import { computed, onMounted, ref } from 'vue'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

let schoolOptions = ref([{ value: 'all', label: 'All Schools' }])

async function getSchools() {
  try {
    const results = await api.get('/cte-schools')
    results.data.forEach((e: any) => {
      schoolOptions.value.push({ value: e.id, label: e.name })
    })
  } catch (err) {
    console.error(err)
  }
}

async function getFilteredData() {
  try {
    const payload = {
      metric: 'assessment',
      level: 'school',
      filters: {},
      startDate: '2025-09-01',
      endDate: '2025-12-15',
    }
    const results = await api.post('/metric', payload)
    console.log(results)

    const labels = results.data.map((e: any) => e.cte_school_name)
    chartData.value = {
      labels,
      datasets: [
        {
          label: selectedMetric.value,
          data: results.data.map((e: any) => e.value),
          backgroundColor: '#0ea5e9',
          hoverBackgroundColor: '#0284c7',
          borderRadius: 6,
          maxBarThickness: 98,
        },
      ],
    }
  } catch (err) {
    console.error(err)
  }
}

type FilterPayload = {
  metric: string
  dateRange: string
  school: string
  grade: string
}

const emit = defineEmits<{ (e: 'change', value: FilterPayload): void }>()

const metrics = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'assessments', label: 'Assessments' },
  //  { value: 'behavior', label: 'Behavior Incidents' },
]

const dateRanges = [
  { value: 'last7', label: 'Last 7 days' },
  { value: 'month', label: 'This Month' },
  { value: 'semester', label: 'This Semester' },
]

const gradeOptions = [
  { value: 'all', label: 'All Grades / Classes' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
]

const selectedMetric = ref(metrics[0].value)
const dateRange = ref(dateRanges[0].value)
const selectedSchool = ref(schoolOptions.value[0].value)
const selectedGrade = ref(gradeOptions[0].value)

const chartData = ref<ChartData<'bar'>>({ labels: [], datasets: [] })
const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        title: (items) => `${items[0]?.label}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
      },
      grid: {
        color: '#e5e7eb',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const currentSummary = computed(() => {
  const metricLabel = metrics.find((m) => m.value === selectedMetric.value)?.label
  const dateLabel = dateRanges.find((d) => d.value === dateRange.value)?.label
  const schoolLabel = schoolOptions.value.find((s) => s.value === selectedSchool.value)?.label
  const gradeLabel = gradeOptions.find((g) => g.value === selectedGrade.value)?.label
  return `${metricLabel} · ${dateLabel} · ${schoolLabel} · ${gradeLabel}`
})

const emitFilters = () => {
  emit('change', {
    metric: selectedMetric.value,
    dateRange: dateRange.value,
    school: selectedSchool.value,
    grade: selectedGrade.value,
  })
}

onMounted(async () => {
  await Promise.all([getSchools()])
  await getFilteredData()
})
</script>

<style scoped>
.page-shell {
  padding: 16px 20px;
  background: #f5f7fb;
  min-height: 100%;
}

.breakdown-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
}

.filters-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.08);
}

.chart-card {
  width: 100%;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 14px;
  min-height: 520px;
  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.08);
}

.chart-wrapper {
  position: relative;
  height: 460px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  font-size: 0.9rem;
  color: #475467;
  margin-top: 4px;
}

.chart-summary {
  margin-bottom: 0.5rem;
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

@media (max-width: 1100px) {
  .breakdown-layout {
    grid-template-columns: 1fr;
  }

  .filters-card {
    max-width: 100%;
  }

  .page-shell {
    padding: 14px;
  }
}
</style>
