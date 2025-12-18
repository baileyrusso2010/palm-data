<template>
  <v-container fluid class="pa-4">
    <!-- Context Bar -->
    <v-row class="mb-3">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div class="text-subtitle-2 font-weight-medium">
          District: Rochester CSD · School: East HS · Today
        </div>
        <v-btn variant="text" size="small">Change Scope</v-btn>
      </v-col>
    </v-row>

    <!-- Signal Strip -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="3" v-for="signal in signals" :key="signal.label">
        <v-card elevation="2" class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 font-weight-bold">{{ signal.value }}</div>
              <div class="text-caption text-medium-emphasis">{{ signal.label }}</div>
            </div>
            <v-icon :color="signal.color" size="32">{{ signal.icon }}</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row>
      <!-- Ranked List -->
      <v-col cols="12" md="8">
        <v-card elevation="2" class="h-100">
          <v-card-title class="text-subtitle-1 font-weight-bold">
            Students Requiring Attention
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="students"
            item-key="name"
            density="comfortable"
            class="elevation-0"
          >
            <template #item.risk="{ item }">
              <v-chip :color="riskColor(item.risk)" size="small" label>
                {{ item.risk }}
              </v-chip>
            </template>
            <template #item.trend="{ item }">
              <span class="font-weight-medium">{{ item.trend }}</span>
            </template>
            <template #item.action="{ item }">
              <v-btn variant="text" size="small">View</v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Supporting Chart Placeholder -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="pa-4 risk-drivers-card h-100">
          <div class="text-subtitle-1 font-weight-bold mb-2">
            Risk Drivers Breakdown
          </div>
          <div class="text-caption text-medium-emphasis mb-4">
            High Risk Students (23)
          </div>
          <div class="chart-wrapper">
            <Bar :data="riskDriversData" :options="riskDriversOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- What Changed -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="1" class="pa-3">
          <div class="text-subtitle-2 font-weight-bold mb-1">What changed since last login</div>
          <ul class="text-caption">
            <li>5 students escalated to high risk</li>
            <li>3 interventions marked complete</li>
            <li>1 school improved attendance trend</li>
          </ul>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const signals = [
  { label: 'At Risk', value: 23, icon: 'mdi-alert-circle', color: 'red' },
  { label: 'Trending Down', value: 41, icon: 'mdi-trending-down', color: 'orange' },
  { label: 'Improving', value: 12, icon: 'mdi-trending-up', color: 'green' },
  { label: 'Schools Deviating', value: 2, icon: 'mdi-school', color: 'purple' },
]

const headers = [
  { text: 'Student', value: 'name' },
  { text: 'Risk', value: 'risk' },
  { text: 'Primary Driver', value: 'driver' },
  { text: 'Trend', value: 'trend' },
  { text: 'Action', value: 'action', sortable: false },
]

const students = [
  { name: 'J. Smith', risk: 'High', driver: 'Attendance', trend: '↓↓↓' },
  { name: 'A. Perez', risk: 'High', driver: 'Grades', trend: '↓↓' },
  { name: 'L. Chen', risk: 'Medium', driver: 'Behavior', trend: '↓' },
  { name: 'M. Davis', risk: 'Medium', driver: 'Attendance', trend: '↓' },
]

const riskDriversData = ref({
  labels: ['Attendance', 'Grades', 'Behavior'],
  datasets: [
    {
      data: [14, 7, 2],
      backgroundColor: '#64748b',
      borderRadius: 4,
      barThickness: 24,
    },
  ],
})

const riskDriversOptions = ref({
  indexAxis: 'y',
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
        weight: '600',
      },
      bodyFont: {
        size: 12,
        family: "'Inter', sans-serif",
      },
      borderColor: '#e2e8f0',
      borderWidth: 1,
      callbacks: {
        label: function(context) {
          return context.parsed.x + ' students'
        }
      }
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#64748b',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
      grid: {
        color: '#e2e8f0',
        drawBorder: false,
      },
      border: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: '#0f172a',
        font: {
          size: 12,
          family: "'Inter', sans-serif",
          weight: '600',
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
})

function riskColor(level) {
  if (level === 'High') return 'red'
  if (level === 'Medium') return 'orange'
  return 'green'
}
</script>

<style scoped>
.pa-4 {
  background: #f5f7fa;
  height: 100vh;
}

.text-subtitle-2 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.v-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.text-h6 {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}

.text-caption {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.text-subtitle-1 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

ul {
  padding-left: 1rem;
  margin: 0;
}

ul li {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 4px;
}

.v-chip {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.v-data-table) {
  background: transparent;
}

:deep(.v-data-table-header) {
  background: #f8fafc;
}

:deep(.v-data-table-header th) {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #64748b !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0 !important;
}

:deep(.v-data-table tbody tr) {
  border-bottom: 1px solid #e2e8f0;
}

:deep(.v-data-table tbody td) {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 500;
}

.risk-drivers-card {
  height: 100%;
}

.chart-wrapper {
  height: min(300px, 100%);
  min-height: 200px;
  position: relative;
}
</style>
