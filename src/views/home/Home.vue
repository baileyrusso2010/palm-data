<template>
  <v-container fluid class="bg-grey-lighten-4 h-100">
    <v-row class="statGrid">
      <v-col v-for="(stat, index) in stats" :key="index" cols="12" sm="6" md="3">
        <v-card class="statCard" variant="flat" border rounded="xl" hover>
          <v-card-text class="pa-8 text-center">
            <div class="statValueSimple text-high-emphasis font-weight-bold">
              {{ stat.value }}
            </div>
            <div class="statLabelSimple text-medium-emphasis text-uppercase mt-2">
              {{ stat.title }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card class="rounded-xl" elevation="2">
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4">
            Framework Distribution
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text style="height: 300px; position: relative" class="pa-4">
            <Doughnut :data="chartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import api from '@/api'

type StatCard = {
  title: string
  value: string | number
}

const stats = ref<StatCard[]>([])
onMounted(async () => {
  let data = (await api.get('/metric/summary')).data

  stats.value.push({
    title: 'Attendance Rate',
    value: `${data.attendance_rate}%`,
  })

  stats.value.push({
    title: 'Behavior Incidents this week',
    value: data.behavior_incident_count,
  })

  stats.value.push({
    title: 'Enrollment',
    value: data.enrollment,
  })

  stats.value.push({
    title: 'Enrollment',
    value: data.enrollment,
  })
})

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = ref({
  labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
      data: [40, 20, 80, 10],
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
})
</script>

<style scoped>
.statGrid {
  row-gap: 16px;
}

.statCard {
  background: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.statCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1) !important;
}

.statLabelSimple {
  font-size: 11px;
  letter-spacing: 0.08em;
  font-weight: 700;
  opacity: 0.7;
}

.statValueSimple {
  font-size: 42px;
  line-height: 1;
  letter-spacing: -0.03em;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 960px) {
  .statValueSimple {
    font-size: 36px;
  }
}
</style>
