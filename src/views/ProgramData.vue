<template>
  <h1>Select a Program</h1>
  <v-row class="mb-4" style="max-width: 1000px; margin: 0 auto">
    <v-col cols="12" sm="6">
      <v-select
        label="Select"
        :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
        variant="outlined"
      ></v-select>
    </v-col>
    <v-col cols="12" sm="6">
      <v-select
        label="Select"
        :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
        variant="outlined"
      ></v-select>
    </v-col>
  </v-row>
  <v-container fluid class="pa-6" style="max-width: 1600px; margin: 0 auto">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6" elevation="4" rounded="lg" color="white">
          <div class="program-card-title">
            <v-icon left color="primary">mdi-welding</v-icon>
            Program Details
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="program-info-row">
            <!-- Program Identification Column -->
            <div class="program-info-col">
              <div class="program-section-title">
                <v-icon left small color="primary">mdi-information-outline</v-icon>
                Program Identification
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-book-open-variant</v-icon>
                <span class="program-info-label">CIP Program Name:</span>
                <span class="program-info-value">{{ program.cipProgramName }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-code-tags</v-icon>
                <span class="program-info-label">Approved CIP Code:</span>
                <span class="program-info-value">{{ program.approvedCipCode }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-school-outline</v-icon>
                <span class="program-info-label">CTE Program:</span>
                <span class="program-info-value">{{ program.cteProgram }}</span>
              </div>
            </div>
            <!-- Administrative Information Column -->
            <div class="program-info-col">
              <div class="program-section-title">
                <v-icon left small color="primary">mdi-file-document-outline</v-icon>
                Administrative Information
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-numeric</v-icon>
                <span class="program-info-label">SED Program #:</span>
                <span class="program-info-value">{{ program.sedProgramNumber }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-code-braces</v-icon>
                <span class="program-info-label">SCED Course Code:</span>
                <span class="program-info-value">{{ program.scedCourseCode }}</span>
              </div>
            </div>
            <!-- Personnel Column -->
            <div class="program-info-col">
              <div class="program-section-title">
                <v-icon left small color="primary">mdi-account-group</v-icon>
                Personnel
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-account-tie</v-icon>
                <span class="program-info-label">Teacher:</span>
                <span class="program-info-value">{{ program.teacher }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-account-plus</v-icon>
                <span class="program-info-label">Teacher Support:</span>
                <span class="program-info-value">{{ program.teacherSupport }}</span>
              </div>
            </div>
            <!-- Institutional & Approval Information Column -->
            <div class="program-info-col">
              <div class="program-section-title">
                <v-icon left small color="primary">mdi-office-building</v-icon>
                Institutional & Approval
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-domain</v-icon>
                <span class="program-info-label">School:</span>
                <span class="program-info-value">{{ program.school }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-calendar-check</v-icon>
                <span class="program-info-label">Approved Through:</span>
                <span class="program-info-value">{{ program.approvedThrough }}</span>
              </div>
              <div class="program-info-item">
                <v-icon color="primary" size="small">mdi-calendar-star</v-icon>
                <span class="program-info-label">Original Approval Date:</span>
                <span class="program-info-value">{{ program.originalApprovalDate }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Student Population and Chart Row -->
  <v-row class="mb-4 d-flex align-stretch" style="max-width: 1600px; margin: 0 auto">
    <v-col cols="12" md="6" class="d-flex flex-column">
      <v-card
        class="pa-6 flex-grow-1 d-flex flex-column justify-center"
        elevation="4"
        rounded="lg"
        color="white"
      >
        <Bar :data="chartData" :options="chartOptions" style="height: 260px" />
      </v-card>
    </v-col>
    <v-col cols="12" md="6" class="d-flex flex-column">
      <v-card
        class="pa-6 flex-grow-1 d-flex flex-column justify-center"
        elevation="4"
        rounded="lg"
        color="white"
      >
        <div class="text-h6 font-weight-bold mb-2">Student Population Based on Registration</div>
        <div class="text-caption mb-3">(See Actual Graduation Data Below)</div>
        <v-table density="compact" class="student-table">
          <thead>
            <tr>
              <th>School Year</th>
              <th>Sr.</th>
              <th>Jr.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2024-2025</td>
              <td>11</td>
              <td>19</td>
              <td>30</td>
            </tr>
            <tr>
              <td>2023-2024</td>
              <td>12</td>
              <td>15</td>
              <td>27</td>
            </tr>
            <tr>
              <td>2022-2023</td>
              <td>11</td>
              <td>16</td>
              <td>27</td>
            </tr>
            <tr>
              <td>2021-2022</td>
              <td>8</td>
              <td>11</td>
              <td>19</td>
            </tr>
            <tr class="font-weight-bold">
              <td>4 Yr Avg.</td>
              <td>10.5</td>
              <td>15.3</td>
              <td>25.8</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Define the Program type with all the required attributes
type Program = {
  cipProgramName: string
  approvedCipCode: string
  cteProgram: string
  sedProgramNumber: string
  teacher: string
  scedCourseCode: string
  school: string
  approvedThrough: string
  teacherSupport: string
  originalApprovalDate: string
}

// Sample program data - in a real app, this would come from an API
const program: Program = {
  cipProgramName: 'Welding Technology/Welder',
  approvedCipCode: '48.0508',
  cteProgram: 'Welding',
  sedProgramNumber: '00210-N',
  teacher: 'Bailey Russo',
  scedCourseCode: '13207',
  school: 'Niagra Boces',
  approvedThrough: '6/30/2029',
  teacherSupport: 'Aide',
  originalApprovalDate: '2002-2003',
}

// Chart data and options for Bar chart
import { ref } from 'vue'

const chartData = ref({
  labels: ['2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      label: 'Enrollment',
      backgroundColor: '#3949ab',
      data: [30, 45, 40, 50, 60],
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Program Enrollment Over Years',
    },
  },
})
</script>

<style scoped>
.program-card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #1a237e;
  letter-spacing: 0.5px;
}

.program-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 24px;
}

.program-info-col {
  flex: 1 1 0;
  min-width: 220px;
  max-width: 400px;
  padding: 0 18px;
  border-right: 1px solid #e0e0e0;
  overflow-wrap: break-word;
  word-break: break-word;
}
.program-info-col:last-child {
  border-right: none;
}

.program-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3949ab;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.program-info-item {
  margin-bottom: 18px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.program-info-label {
  font-size: 0.95rem;
  color: #757575;
  min-width: 120px;
}
.program-info-value {
  font-size: 1.08rem;
  font-weight: 500;
  color: #222;
  word-break: break-word;
  max-width: 200px;
  display: inline-block;
}
.v-card {
  box-shadow: 0 4px 24px 0 rgba(60, 60, 100, 0.1);
  border-radius: 18px;
}
.v-card-title {
  background: linear-gradient(90deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px 12px 0 0;
  padding: 24px 32px 18px 32px;
}
.v-card-text {
  padding: 0;
}
.student-table {
  width: 100%;
  font-size: 1rem;
  border-collapse: collapse;
}
.student-table th,
.student-table td {
  padding: 6px 10px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}
.student-table th {
  background: #f5f5fa;
  font-weight: 600;
  color: #3949ab;
}
.student-table tr.font-weight-bold td {
  font-weight: 700;
  background: #f3e5f5;
}
@media (max-width: 900px) {
  .program-info-row {
    flex-direction: column;
  }
  .program-info-col {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    min-width: unset;
    max-width: unset;
    padding-bottom: 18px;
    margin-bottom: 12px;
  }
  .program-info-col:last-child {
    border-bottom: none;
  }
  .program-info-value {
    max-width: unset;
  }
}
</style>
