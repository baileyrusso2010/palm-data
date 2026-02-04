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
            <p class="helper-label">Start Date</p>
            <v-text-field
              v-model="startDate"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>

          <div class="filter-group">
            <p class="helper-label">End Date</p>
            <v-text-field
              v-model="endDate"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
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
          <v-btn
            icon="mdi-download"
            variant="text"
            size="small"
            @click="downloadChart"
            class="download-btn"
          ></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <div class="chart-wrapper">
            <Line ref="chartRef" :data="chartData" :options="chartOptions" :height="380" />
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="grid-layout">
      <v-card class="grid-card" flat>
        <v-card-title class="py-3">Detailed Breakdown</v-card-title>
        <v-divider></v-divider>
        <div style="height: 500px">
          <ag-grid-vue
            :theme="gridTheme"
            :rowData="rowData"
            :columnDefs="colDefs"
            :defaultColDef="defaultColDef"
            :suppressKeyboardEvent="suppressKeyboardEvent"
            :stopEditingWhenCellsLoseFocus="false"
            @cell-focused="onCellFocused"
            style="height: 100%; width: 100%"
          />
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from '@/api'
import { Line } from 'vue-chartjs'
import { computed, onMounted, ref } from 'vue'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

import { AgGridVue } from 'ag-grid-vue3'
import { themeQuartz } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'

const chartRef = ref<any>(null)

const schoolOptions = ref([{ value: 'all', label: 'All Schools' }])

async function getSchools() {
  try {
    const results = await api.get('/schools/district/1')
    results.data.forEach((e: any) => {
      schoolOptions.value.push({ value: e.id, label: e.name })
    })
  } catch (err) {
    console.error(err)
  }
}

function downloadChart() {
  if (chartRef.value && chartRef.value.chart) {
    const url = chartRef.value.chart.toBase64Image()
    const link = document.createElement('a')
    link.download = 'chart.png'
    link.href = url
    link.click()
  }
}

async function getFilteredData() {
  if (selectedMetric.value === 'attendance') {
    await fetchAttendanceData()
  } else if (selectedMetric.value === 'behavior') {
    await fetchBehaviorData()
  }
}

async function fetchAttendanceData() {
  try {
    const params: any = {
      groupBy: 'month',
      startDate: startDate.value,
      endDate: endDate.value,
    }

    if (selectedSchool.value !== 'all') params.schoolId = selectedSchool.value
    if (selectedGrade.value !== 'all') params.grade = selectedGrade.value

    const results = await api.get('/attendance/analytics', { params })
    const data = results.data

    // Group by month and calculate stats
    // We get rows like: { time_period: '...', count: 10, attendance_status: { code: 'P' } }
    const groupedByMonth: Record<string, { total: number; present: number }> = {}

    data.forEach((row: any) => {
      const month = row.time_period
      if (!groupedByMonth[month]) groupedByMonth[month] = { total: 0, present: 0 }

      const count = parseInt(row.count)
      groupedByMonth[month].total += count

      // 'P' = Present, 'T' = Tardy. Both count towards positive attendance here.
      if (['P', 'T'].includes(row.attendance_status?.code)) {
        groupedByMonth[month].present += count
      }
    })

    const processedData = Object.keys(groupedByMonth)
      .sort()
      .map((month) => {
        const stats = groupedByMonth[month]
        const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
        return {
          month,
          rate,
        }
      })

    // Update chart with processed data
    chartData.value = {
      labels: processedData.map((d) =>
        new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ),
      datasets: [
        {
          label: 'Attendance Rate',
          data: processedData.map((d) => d.rate),
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }

    // Update Grid
    rowData.value = processedData.map((d) => ({
      month: new Date(d.month).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      attendance_rate: d.rate,
    })) as any

    colDefs.value = [
      { field: 'month', headerName: 'Month', flex: 1 },
      {
        field: 'attendance_rate',
        headerName: 'Attendance Rate',
        flex: 1,
        valueFormatter: (p: any) => p.value + '%',
      },
    ]
  } catch (err) {
    console.error(err)
  }
}

async function fetchBehaviorData() {
  try {
    const params: any = {
      groupBy: 'month',
      startDate: startDate.value,
      endDate: endDate.value,
    }

    if (selectedSchool.value !== 'all') params.schoolId = selectedSchool.value
    if (selectedGrade.value !== 'all') params.grade = selectedGrade.value

    const results = await api.get('/behavior/analytics', { params })
    const data = results.data

    // Behavior data comes as { time_period, count }.
    // It might also be broken down by type if we don't group by it?
    // The query groups by Month. 'groups.forEach'.
    // If only 'month' is passed, it counts all behaviors per month.
    console.log(data)

    chartData.value = {
      labels: data.map((d: any) =>
        new Date(d.time_period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ),
      datasets: [
        {
          label: 'Incidents',
          data: data.map((d: any) => d.count),
          borderColor: '#f59e0b', // amber
          backgroundColor: '#f59e0b',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }

    rowData.value = data.map((d: any) => ({
      month: new Date(d.time_period).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      }),
      count: d.count,
    })) as any

    colDefs.value = [
      { field: 'month', headerName: 'Month', flex: 1 },
      { field: 'count', headerName: 'Total Incidents', flex: 1 },
    ]
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
  { value: 'behavior', label: 'Behavior' },
]

const gradeOptions = [
  { value: 'all', label: 'All Grades / Classes' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
]

const selectedMetric = ref(metrics[0].value)
const startDate = ref('2025-01-01')
const endDate = ref('2025-12-31')
const selectedSchool = ref(schoolOptions.value[0].value)
const selectedGrade = ref(gradeOptions[0].value)

const chartData = ref<ChartData<'line'>>({ labels: [], datasets: [] })
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 12,
      cornerRadius: 4,
      titleFont: {
        size: 13,
        family: "'Inter', sans-serif",
        // weight: '600',
      },
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      borderColor: '#e2e8f0',
      borderWidth: 1,
      callbacks: {
        title: (items) => `${items[0]?.label}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 10,
        color: '#64748b',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
        callback: function (value) {
          return value + '%'
        },
      },
      grid: {
        color: '#e2e8f0',
        // drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    x: {
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
}

const currentSummary = computed(() => {
  const metricLabel = metrics.find((m) => m.value === selectedMetric.value)?.label
  const schoolLabel = schoolOptions.value.find((s) => s.value === selectedSchool.value)?.label
  const gradeLabel = gradeOptions.find((g) => g.value === selectedGrade.value)?.label
  return `${metricLabel} · ${startDate.value} to ${endDate.value} · ${schoolLabel} · ${gradeLabel}`
})

// AG Grid Setup
const gridTheme = themeQuartz
const rowData = ref([])
const colDefs = ref<ColDef[]>([
  { field: 'grade', headerName: 'Grade' },
  { field: 'attendance_rate', headerName: 'Attendance Rate', valueFormatter: (p) => p.value + '%' },
])

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  filter: true,
  sortable: true,
}

const suppressKeyboardEvent = (params: any) => false
const onCellFocused = (params: any) => {
  // Console log or handle focus
}

const emitFilters = () => {
  emit('change', {
    metric: selectedMetric.value,
    dateRange: `${startDate.value} to ${endDate.value}`,
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
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
}

.breakdown-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: stretch;
  max-width: 1400px;
  margin: 0 auto;
}

.grid-layout {
  max-width: 1400px;
  margin: 24px auto 0;
}

.grid-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: none;
}

.grid-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filters-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: none;
  height: 100%;
}

.chart-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: none;
  height: 100%;
}

.filters-card:hover,
.chart-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

.download-btn {
  color: #64748b;
}

.download-btn:hover {
  color: #0f172a;
  background-color: #f1f5f9;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
  font-weight: 500;
}

.chart-summary {
  margin-bottom: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.helper-label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.helper {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

@media (max-width: 1100px) {
  .breakdown-layout {
    grid-template-columns: 1fr;
  }

  .filters-card {
    max-width: 100%;
  }

  .page-shell {
    padding: 16px;
  }
}
</style>
