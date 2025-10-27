<template>
  <v-app>
    <v-row no-gutters>
      <!-- Sidebar -->
      <v-col cols="2" class="sidebar pa-6" style="min-height: 100vh; border-right: 1px solid #eee">
        <v-sheet elevation="0" class="px-2">
          <h3 class="mb-4">Menu</h3>
          <v-list nav>
            <v-list-item
              v-for="(item, i) in nav"
              :key="i"
              :active="selected === item.key"
              @click="select(item.key)"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>

      <!-- Main content -->
      <v-col cols="10" class="pa-8">
        <v-row align="center" justify="space-between">
          <v-col cols="8">
            <h1 class="display-1">{{ student.fullName }}</h1>
            <div class="subheading grey--text">
              CTE Program: {{ student.program }} | Grade {{ student.grade }} | Cohort
              {{ student.cohort }}
            </div>
          </v-col>
        </v-row>

        <!-- Overview -->
        <div v-if="selected === 'overview'">
          <!-- Student summary card -->
          <v-card class="mb-6" elevation="1">
            <v-card-text>
              <v-row align="center">
                <v-col cols="2" class="text-center">
                  <v-avatar size="48">
                    <v-img :src="student.photo" alt="student" />
                  </v-avatar>
                </v-col>
                <v-col cols="2">
                  <v-sheet class="pa-2 text-center" elevation="0" rounded>
                    <div class="headline">{{ student.cumulativeGrade }}</div>
                    <div class="caption grey--text">Cumulative Grade</div>
                  </v-sheet>
                </v-col>
                <v-col cols="2">
                  <v-sheet class="pa-2 text-center" elevation="0" rounded>
                    <div class="headline">{{ student.wblHours }} hrs</div>
                    <div class="caption grey--text">Work-Based Learning</div>
                  </v-sheet>
                </v-col>
                <v-col cols="2">
                  <v-sheet class="pa-2 text-center" elevation="0" rounded>
                    <div class="headline">{{ student.techEndorsement }}</div>
                    <div class="caption grey--text">Technical Endorsement</div>
                  </v-sheet>
                </v-col>
                <v-col cols="4" class="text-right">
                  <v-btn variant="text" @click="toggleEditTemplate">Edit Template</v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Section cards -->
          <v-row>
            <v-col cols="6">
              <v-card
                class="mb-4"
                elevation="1"
                @click="openSection('part1')"
                style="cursor: pointer"
              >
                <v-card-title>Part 1: Career Development</v-card-title>
                <v-card-text>
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="subtitle-1">Average</div>
                      <div class="headline">{{ averages.part1 }}</div>
                    </div>
                    <div class="grey--text">Click to expand</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card
                class="mb-4"
                elevation="1"
                @click="openSection('part2')"
                style="cursor: pointer"
              >
                <v-card-title>Part 2: Technical Skills</v-card-title>
                <v-card-text>
                  <div class="d-flex justify-space-between">
                    <div>
                      <div class="subtitle-1">Average</div>
                      <div class="headline">{{ averages.part2 }}</div>
                    </div>
                    <div class="grey--text">Click to expand</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-card elevation="1">
                <v-card-title>
                  Part 3: Certifications & Work-Based Learning
                  <v-spacer />
                  <v-btn variant="text" small @click.stop="openSection('part3')"
                    >View Details</v-btn
                  >
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="4">
                      <div class="subtitle-2 grey--text">Total Hours</div>
                      <div class="title">{{ student.wblHours }}</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="subtitle-2 grey--text">Exams Passed</div>
                      <div class="title">{{ student.examsPassed }}</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="subtitle-2 grey--text">Portfolio</div>
                      <div class="title">{{ student.portfolioStatus }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Part 1: Career Development -->
        <div v-else-if="selected === 'part1'">
          <h2>Part 1: Career Development</h2>

          <v-data-table
            :headers="occupationSkillsHeaders"
            :items="occupationSkills"
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ1"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ2"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.seniorQ1"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.seniorQ2"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.comments"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-btn @click="saveResponses" color="primary">Save</v-btn>

          <Part1Editor :data="{}" @update="onPanelUpdate" />
        </div>

        <!-- Part 2: Technical Skills -->
        <div v-else-if="selected === 'part2'">
          <h2>Part 2: Technical Skills</h2>

          <v-data-table
            :headers="technicalSkillsHeaders"
            :items="technicalSkills"
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ1"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ2"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.seniorQ1"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.seniorQ2"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.comments"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
              </tr>
            </template>
          </v-data-table>
          <Part2Editor :data="{}" @update="onPanelUpdate" />

          <v-btn @click="saveResponses" color="primary">Save</v-btn>
        </div>

        <!-- Part 3: Certifications -->
        <div v-else-if="selected === 'part3'">
          <h2>Part 3: Certifications & Work-Based Learning</h2>
          <v-data-table
            :headers="technicalSkillsHeaders"
            :items="technicalSkills"
            class="elevation-1"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.name }}</td>
                <td>{{ item.description }}</td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ1"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
                <td>
                  <v-textarea
                    v-model="item.juniorQ2"
                    dense
                    :rows="1"
                    :auto-grow="false"
                    no-resize
                  />
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>

        <!-- Reports -->
        <div v-else-if="selected === 'reports'">
          <h2>Reports</h2>
          <p>Reports section - implement report generation here.</p>
        </div>

        <!-- Detail drawer / panel -->
        <v-dialog v-model="openPanel" width="900">
          <v-card>
            <v-toolbar flat>
              <v-btn icon @click="openPanel = false"><v-icon>mdi-close</v-icon></v-btn>
              <v-toolbar-title>{{ panelTitle }}</v-toolbar-title>
              <v-spacer />
              <v-btn variant="outlined" @click="savePanel">Save</v-btn>
            </v-toolbar>

            <v-card-text style="max-height: 68vh; overflow: auto">
              <component :is="panelComponent" :data="panelData" @update="onPanelUpdate" />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/api'

// Mock navigation
const nav = [
  { key: 'overview', title: 'Overview', icon: 'mdi-view-dashboard' },
  { key: 'part1', title: 'Career Development', icon: 'mdi-account-star' },
  { key: 'part2', title: 'Technical Skills', icon: 'mdi-hammer-wrench' },
  { key: 'part3', title: 'Certifications', icon: 'mdi-certificate' },
  { key: 'reports', title: 'Reports', icon: 'mdi-file-document' },
]

const selected = ref('overview')
function select(k) {
  selected.value = k
}

// Mock student data — replace with fetch from your API
const student = reactive({
  fullName: 'Bailey Russo',
  program: 'Animal Science',
  grade: 12,
  cohort: 2025,
  cumulativeGrade: '3.0',
  wblHours: 54,
  techEndorsement: 'In Progress',
  photo: '',
  examsPassed: 1,
  portfolioStatus: 'Incomplete',
})

const averages = reactive({ part1: 3.0, part2: 2.7 })

// Panel state
const openPanel = ref(false)
const panelTitle = ref('')
const panelComponent = ref('div')
const panelData = ref({})

const occupationSkills = ref([])
const technicalSkills = ref([])

const occupationSkillsHeaders = ref([
  { title: 'Name', key: 'name' },
  { title: 'Expectations', key: 'description' },
  { title: 'Junior Q1', key: 'juniorQ1' },
  { title: 'Junior Q2', key: 'juniorQ2' },
  { title: 'Senior Q1', key: 'seniorQ1' },
  { title: 'Senior Q2', key: 'seniorQ2' },
  { title: 'Comments', key: 'comments' },
])

const technicalSkillsHeaders = ref([
  { title: 'Name', key: 'name' },
  { title: 'Industry & Technical Expectations', key: 'description' },
  { title: 'Junior Q1', key: 'juniorQ1' },
  { title: 'Junior Q2', key: 'juniorQ2' },
  { title: 'Senior Q1', key: 'seniorQ1' },
  { title: 'Senior Q2', key: 'seniorQ2' },
  { title: 'Comments', key: 'comments' },
])

const certficationHeaders = ref([
  { title: 'Clubs, Certs & Student Organizations', key: 'name' },
  { title: 'Role Played / Accomplishment', key: 'description' },
])

onMounted(async () => {
  const response = await api.get('/form/1')
  occupationSkills.value = response.data.form_data.occupationalSkills
  console.log(occupationSkills.value)
  technicalSkills.value = response.data.form_data.industrySkills

  await getStudentData()
})

async function getStudentData() {
  const response = await api.get('/form/1/student/1')
  const responses = response.data[0].responses
  occupationSkills.value.forEach((skill) => {
    if (responses[skill.id]) {
      skill.juniorQ1 = responses[skill.id].juniorQ1 || ''
      skill.juniorQ2 = responses[skill.id].juniorQ2 || ''
      skill.seniorQ1 = responses[skill.id].seniorQ1 || ''
      skill.seniorQ2 = responses[skill.id].seniorQ2 || ''
      skill.comments = responses[skill.id].comments || ''
    }
  })

  technicalSkills.value.forEach((skill) => {
    if (responses[skill.id]) {
      skill.juniorQ1 = responses[skill.id].juniorQ1 || ''
      skill.juniorQ2 = responses[skill.id].juniorQ2 || ''
      skill.seniorQ1 = responses[skill.id].seniorQ1 || ''
      skill.seniorQ2 = responses[skill.id].seniorQ2 || ''
      skill.comments = responses[skill.id].comments || ''
    }
  })
}

async function saveResponses() {
  const responses = {}

  occupationSkills.value.forEach((skill) => {
    responses[skill.id] = {
      juniorQ1: skill.juniorQ1,
      juniorQ2: skill.juniorQ2,
      seniorQ1: skill.seniorQ1,
      seniorQ2: skill.seniorQ2,
      comments: skill.comments,
    }
  })

  technicalSkills.value.forEach((skill) => {
    responses[skill.id] = {
      juniorQ1: skill.juniorQ1,
      juniorQ2: skill.juniorQ2,
      seniorQ1: skill.seniorQ1,
      seniorQ2: skill.seniorQ2,
      comments: skill.comments,
    }
  })

  await api.post('/form/1/student/1', { responses })
}

function openSection(key) {
  if (key === 'part1') {
    panelTitle.value = 'Part 1: Career Development'
    panelComponent.value = Part1Editor
    panelData.value = {
      /* pass whatever part1 JSON */
    }
  } else if (key === 'part2') {
    panelTitle.value = 'Part 2: Technical Skills'
    panelComponent.value = Part2Editor
    panelData.value = {}
  } else {
    panelTitle.value = 'Details'
    panelComponent.value = GenericEditor
    panelData.value = {}
  }
  openPanel.value = true
}

function toggleEditTemplate() {
  alert('Open template editor — implement drag/drop fields here')
}

function savePanel() {
  // handle save/update of JSONB row
  openPanel.value = false
}

function onPanelUpdate(payload) {
  console.log('panel update', payload)
}

// --- Simple inline editor components ---
const Part1Editor = {
  props: ['data'],
  template: `
    <div>
      <h3>Performance Skills (editable)</h3>
      <v-simple-table>
        <tbody>
          <tr v-for="field in fields" :key="field.key">
            <td style="width:40%"><strong>{{ field.label }}</strong></td>
            <td>
              <v-radio-group v-model="field.value" row>
                <v-radio v-for="n in 4" :key="n" :label="n" :value="n"/>
              </v-radio-group>
            </td>
            <td>
              <v-textarea v-model="field.comment" rows="1" placeholder="Comment (optional)" />
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  `,
  setup() {
    const fields = ref([
      { key: 'attendance', label: 'Attendance', value: 3, comment: '' },
      { key: 'punctuality', label: 'Punctuality', value: 3, comment: '' },
      { key: 'initiative', label: 'Takes Initiative', value: 4, comment: '' },
      { key: 'quality', label: 'Quality of Work', value: 3, comment: '' },
    ])

    return { fields }
  },
}

const Part2Editor = {
  props: ['data'],
  template: `
    <div>
      <h3>Technical Skills (editable)</h3>
      <v-simple-table>
        <tbody>
          <tr v-for="field in fields" :key="field.key">
            <td style="width:40%"><strong>{{ field.label }}</strong></td>
            <td>
              <v-radio-group v-model="field.value" row>
                <v-radio v-for="n in 4" :key="n" :label="n" :value="n"/>
              </v-radio-group>
            </td>
            <td>
              <v-textarea v-model="field.comment" rows="1" placeholder="Comment (optional)" />
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  `,
  setup() {
    const fields = ref([
      { key: 'safety', label: 'Safety & Health', value: 2, comment: '' },
      { key: 'techuse', label: 'Computer & Tech Literacy', value: 3, comment: '' },
      { key: 'jobskill', label: 'Job Specific Skills', value: 2, comment: '' },
    ])

    return { fields }
  },
}

const GenericEditor = {
  props: ['data'],
  template: `<div><h3>Generic Details</h3><p>Replace with a custom editor for the chosen section.</p></div>`,
}
</script>

<style scoped>
.sidebar {
  background: #fbfbfb;
}
.title {
  font-weight: 600;
}
</style>
