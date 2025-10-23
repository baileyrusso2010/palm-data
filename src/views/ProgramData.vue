<template>
  <h1>Select a Program</h1>
  <v-row class="mb-4" style="max-width: 1000px; margin: 0 auto">
    <v-col cols="12" sm="6">
      <v-select
        :items="programItems"
        v-model="selectedProgram"
        item-title="label"
        item-value="value"
        label="Select Program"
        @update:modelValue="onProgramSelected"
      ></v-select>
    </v-col>
    <v-col cols="12" sm="6">
      <v-select
        :items="instructors"
        v-model="selectedInstructor"
        item-title="label"
        item-value="value"
        label="Select Instructor"
        :disabled="instructors.length === 0"
        :placeholder="instructors.length === 0 ? 'No instructors available' : 'Select Instructor'"
        @update:modelValue="onInstructorSelected"
      />
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
        <div class="text-caption mb-3"></div>
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
            <tr v-for="row in studentPopulationData" :key="row.year">
              <td>{{ row.year }}</td>
              <td>{{ row.sr }}</td>
              <td>{{ row.jr }}</td>
              <td>{{ row.total }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>

  <v-row style="max-width: 1600px; margin: 0 auto">
    <v-col cols="12" md="4" class="d-flex flex-column">
      <v-card
        class="pa-6 flex-grow-1 d-flex flex-column justify-center"
        elevation="4"
        rounded="lg"
        color="white"
      >
        <div class="text-h6 font-weight-bold mb-2">504 Population</div>
        <div class="text-caption mb-3"></div>
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
            <tr v-for="row in population504Data" :key="row.year">
              <td>{{ row.year }}</td>
              <td>{{ row.sr }}</td>
              <td>{{ row.jr }}</td>
              <td>{{ row.total }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <v-card
        class="pa-6 flex-grow-1 d-flex flex-column justify-center"
        elevation="4"
        rounded="lg"
        color="white"
      >
        <div class="text-h6 font-weight-bold mb-2">Non-Traditional Students</div>
        <div class="text-caption mb-3"></div>
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
            <tr v-for="row in population504Data" :key="row.year">
              <td>{{ row.year }}</td>
              <td>{{ row.sr }}</td>
              <td>{{ row.jr }}</td>
              <td>{{ row.total }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" class="d-flex flex-column">
      <v-card
        class="pa-6 flex-grow-1 d-flex flex-column justify-center"
        elevation="4"
        rounded="lg"
        color="white"
      >
        <div class="text-h6 font-weight-bold mb-2">IEP Population</div>
        <div class="text-caption mb-3"></div>
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
            <tr v-for="row in populationIEPData" :key="row.year">
              <td>{{ row.year }}</td>
              <td>{{ row.sr }}</td>
              <td>{{ row.jr }}</td>
              <td>{{ row.total }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
// Use shared API client and typed interfaces for program data
import api from '../api'
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
import { ref, computed, onMounted } from 'vue'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Instruc tor lis''for the selec t,onst instructors = ref([])
const loadingClasses = ref(false)
const selectedInstructor = ref(null)

const instructors = ref([])

// Class data storage
const studentStats = ref({})

// Program list for the select
const programs = ref([])
const loadingPrograms = ref(false)
const selectedProgram = ref(null)

// Items for v-select
const programItems = computed(() => [{ label: '', value: null }, ...programs.value])

// Initialize with empty/defaults; will be populated from API
const program = ref({
  cipProgramName: '',
  approvedCipCode: '',
  cteProgram: '',
  sedProgramNumber: '',
  teacher: '',
  scedCourseCode: '',
  school: '',
  approvedThrough: '',
  teacherSupport: '',
  originalApprovalDate: '',
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    title: {
      display: true,
      text: 'Program Enrollment Over Years',
    },
  },
})

const chartData = computed(() => ({
  labels: studentPopulationData.value.map((row) => row.year),
  datasets: [
    {
      label: 'Enrollment',
      backgroundColor: '#4db',
      data: studentPopulationData.value.map((row) => row.total),
    },
  ],
}))

async function fetchProgramData() {
  loadingPrograms.value = true
  console.log('Fetching program data...')
  try {
    const response = await api.get('/cte-district-programs')

    for (const program of response.data) {
      if (!program.program_catalog) continue
      programs.value.push({
        label: program.program_catalog.title,
        value: program.id,
        raw: program,
      })
    }

    // if (programs.value.length > 0) {
    //   selectedProgram.value = programs.value[0].value
    //   onProgramSelected(programs.value[0])
    // }
  } catch (error) {
    console.error('Error fetching programs:', error)
  } finally {
    loadingPrograms.value = false
  }
}

onMounted(() => {
  fetchProgramData()
})

const populationIEPData = computed(() => {
  const years = ['2023', '2024', '2025', '2026']
  const data = years.map((year) => {
    const yearData = studentStats.value.byYear?.[year] || {}
    const jr = Object.values(yearData.byGrade || {}).reduce(
      (sum, grade) => sum + (grade.flags?.IEP || 0),
      0,
    ) // Assuming flags are per grade
    const sr = Object.values(yearData.byGrade || {}).reduce(
      (sum, grade) => sum + (grade.flags?.IEP || 0),
      0,
    ) // Adjust if flags are not per grade
    return {
      year: `${year}-${parseInt(year) + 1}`,
      jr,
      sr,
      total: jr + sr,
    }
  })
  // Similar average calculation as above
  const avgJr = data.reduce((sum, row) => sum + row.jr, 0) / data.length
  const avgSr = data.reduce((sum, row) => sum + row.sr, 0) / data.length
  const avgTotal = data.reduce((sum, row) => sum + row.total, 0) / data.length
  data.push({
    year: '4 Yr Avg.',
    jr: avgJr.toFixed(1),
    sr: avgSr.toFixed(1),
    total: avgTotal.toFixed(1),
  })
  return data
})

const population504Data = computed(() => {
  const years = ['2023', '2024', '2025', '2026']
  const data = years.map((year) => {
    const yearData = studentStats.value.byYear?.[year] || {}
    const jr = Object.values(yearData.byGrade || {}).reduce(
      (sum, grade) => sum + (grade.flags?.['504'] || 0),
      0,
    ) // Assuming flags are per grade
    const sr = Object.values(yearData.byGrade || {}).reduce(
      (sum, grade) => sum + (grade.flags?.['504'] || 0),
      0,
    ) // Adjust if flags are not per grade
    return {
      year: `${year}-${parseInt(year) + 1}`,
      jr,
      sr,
      total: jr + sr,
    }
  })
  // Similar average calculation as above
  const avgJr = data.reduce((sum, row) => sum + row.jr, 0) / data.length
  const avgSr = data.reduce((sum, row) => sum + row.sr, 0) / data.length
  const avgTotal = data.reduce((sum, row) => sum + row.total, 0) / data.length
  data.push({
    year: '4 Yr Avg.',
    jr: avgJr.toFixed(1),
    sr: avgSr.toFixed(1),
    total: avgTotal.toFixed(1),
  })
  return data
})

const studentPopulationData = computed(() => {
  const years = ['2023', '2024', '2025', '2026']

  const data = years.map((year) => {
    const yearData = studentStats.value.byYear?.[year] || {}
    const jr = yearData.byGrade?.['11']?.students || 0
    const sr = yearData.byGrade?.['12']?.students || 0

    return {
      year: `${year}-${parseInt(year) + 1}`,
      jr,
      sr,
      total: jr + sr,
    }
  })

  const avgJr = data.reduce((sum, row) => sum + row.jr, 0) / data.length
  const avgSr = data.reduce((sum, row) => sum + row.sr, 0) / data.length
  const avgTotal = data.reduce((sum, row) => sum + row.total, 0) / data.length
  data.push({
    year: '4 Yr Avg.',
    jr: avgJr.toFixed(1),
    sr: avgSr.toFixed(1),
    total: avgTotal.toFixed(1),
  })
  return data
})

function onProgramSelected(opt) {
  if (!opt) return
  let programObj = opt
  // If opt is a value (id), find the full object
  if (typeof opt === 'string' || typeof opt === 'number') {
    programObj = programs.value.find((p) => p.value === opt)
  }
  if (!programObj || !programObj.raw || !programObj.raw.program_catalog) {
    console.error('Invalid program selection:', opt)
    return
  }
  program.value = { ...program.value, ...programObj.raw.program_catalog }
  fetchTeachersByProgram(opt)
  // fetchClassData(programObj.raw.id)
}

async function fetchTeachersByProgram(id = 11) {
  try {
    instructors.value = []
    const response = await api.get(`/staff/${id}`)

    instructors.value = (response.data || []).map((inst) => ({
      label: `${inst.first_name} ${inst.last_name}`,
      value: inst.id,
      raw: inst,
    }))
  } catch (err) {
    console.log('Error getting teachers: ', err)
    instructors.value = []
  }
}

async function onInstructorSelected(instructorID) {
  //going to have to change logic for id in backend
  const response = await api.get(`http://localhost:3000/api/course-instances/${601}/stats`)
  studentStats.value = response.data
}
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
