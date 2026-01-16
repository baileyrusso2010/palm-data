<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import StudentHeader from '../../components/mtss/StudentHeader.vue'
import MtssTimeline from '../../components/mtss/MtssTimeline.vue'
import MtssDetailPanel from '../../components/mtss/MtssDetailPanel.vue'

const route = useRoute()
const studentId = route.params.id as string

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const student = ref<any>(null)
const rawTimelineData = ref<any>(null)
const selectedItem = ref<any>(null)
const showDetails = ref(false)

// Fetch Data
const fetchData = async () => {
  if (!studentId) return
  isLoading.value = true
  error.value = null
  try {
    // 1. Fetch Student Details (if not already part of timeline response, strictly speaking we might need a separate call or the timeline includes it)
    // Assuming timeline endpoint returns `{ student: ..., tracks: ... }` or similar, OR we fetch student separately.
    // For now, let's assume we need to fetch student basic info, or maybe the timeline has it.
    // Based on standard patterns, let's fetch timeline.
    const response = await api.get(`/students/${studentId}/mtss-timeline`)
    // API endpoint per user request: GET /api/students/:studentId/mtss-timeline.
    // Wait, user request said "GET /api/students/:studentId/mtss-timeline".
    // My api.ts has baseURL.
    // NOTE: The user prompt listing says "GET /api/students/:studentId/mtss-timeline".
    // AND "GET /api/mtss/..." for others.
    // I will try `/students/${studentId}/mtss-timeline` first (relative to base URL).

    // Actually, looking at the user request again:
    // "GET /api/students/:studentId/mtss-timeline"
    // "GET /api/mtss/student-tiers?student_id=..."

    const timelineRes = await api.get(`/students/${studentId}/mtss-timeline`)
    rawTimelineData.value = timelineRes.data

    // If the timeline response includes student info, use it. Otherwise we might Mock it or fetch it.
    // For now, let's assume the response structure.
    if (timelineRes.data.student) {
      student.value = timelineRes.data.student
    } else {
      // Fallback or separate fetch if needed.
      // Let's keep the mock student structure filled with data if possible.
      student.value = {
        name: timelineRes.data.studentName || 'Student Name',
        grade: timelineRes.data.grade || 'N/A',
        school: timelineRes.data.school || 'N/A',
        currentTier: timelineRes.data.currentTier || 1,
        daysInTier: timelineRes.data.daysInTier || 0,
        riskLevel: timelineRes.data.riskLevel || 'Low',
      }
    }
  } catch (err: any) {
    console.error('Error fetching MTSS timeline:', err)
    error.value = 'Failed to load student data.'
  } finally {
    isLoading.value = false
  }
}

// Definitions
const definitions = ref({
  interventions: [] as any[],
  domains: [] as any[],
  tiers: [] as any[],
})

// Dialog States
const dialogs = ref({
  tier: false,
  intervention: false,
  screening: false,
  meeting: false,
  referral: false,
})

const editingItem = ref<any>(null) // If null, creating new

// Fetch Definitions
const fetchDefinitions = async () => {
  try {
    const [intRes, domRes, tierRes] = await Promise.all([
      api.get('/mtss/interventions'),
      api.get('/mtss/domains'),
      api.get('/mtss/tiers'),
    ])
    definitions.value.interventions = intRes.data
    definitions.value.domains = domRes.data
    definitions.value.tiers = tierRes.data
  } catch (e) {
    console.error('Failed to fetch definitions', e)
  }
}

onMounted(() => {
  fetchData()
  fetchDefinitions()
})

// CRUD Handlers
const handleAdd = (type: 'tier' | 'intervention' | 'screening' | 'meeting' | 'referral') => {
  editingItem.value = {} // New item
  dialogs.value[type] = true
}

const handleEdit = (item: any) => {
  editingItem.value = { ...item } // Copy item
  showDetails.value = false // Close detail panel

  // Map item.type to dialog key
  if (item.type === 'tier') dialogs.value.tier = true
  if (item.type === 'intervention') dialogs.value.intervention = true
  if (item.type === 'screening') dialogs.value.screening = true
  if (item.type === 'meeting') dialogs.value.meeting = true
  if (item.type === 'referral') dialogs.value.referral = true
}

const handleDelete = async (item: any) => {
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    let endpoint = ''
    if (item.type === 'tier') endpoint = `/mtss/student-tiers/${item.id}`
    if (item.type === 'intervention') endpoint = `/mtss/student-interventions/${item.id}`
    if (item.type === 'screening') endpoint = `/mtss/screenings/${item.id}`
    if (item.type === 'meeting') endpoint = `/mtss/meetings/${item.id}`
    if (item.type === 'referral') endpoint = `/mtss/referrals/${item.id}`

    if (endpoint) {
      await api.delete(endpoint)
      showDetails.value = false
      fetchData() // Refresh timeline
    }
  } catch (e) {
    console.error('Delete failed', e)
  }
}

const handleEndIntervention = async (item: any) => {
  if (!confirm('End this intervention today?')) return
  try {
    await api.put(`/mtss/student-interventions/${item.id}`, {
      ...item,
      end_date: new Date().toISOString(),
    })
    showDetails.value = false
    fetchData()
  } catch (e) {
    console.error('Failed to end intervention', e)
  }
}

const saveItem = async (type: string, data: any) => {
  try {
    let endpoint = ''
    let method = 'post'
    let payload = { ...data, student_id: studentId }

    // If editing
    if (editingItem.value && editingItem.value.id) {
      method = 'put'
      // Endpoint logic
      if (type === 'tier') endpoint = `/mtss/student-tiers/${editingItem.value.id}`
      if (type === 'intervention') endpoint = `/mtss/student-interventions/${editingItem.value.id}`
      if (type === 'screening') endpoint = `/mtss/screenings/${editingItem.value.id}`
      if (type === 'meeting') endpoint = `/mtss/meetings/${editingItem.value.id}`
      if (type === 'referral') endpoint = `/mtss/referrals/${editingItem.value.id}`
    } else {
      // Creating
      if (type === 'tier') endpoint = `/mtss/student-tiers`
      if (type === 'intervention') endpoint = `/mtss/student-interventions`
      if (type === 'screening') endpoint = `/mtss/screenings`
      if (type === 'meeting') endpoint = `/mtss/meetings`
      if (type === 'referral') endpoint = `/mtss/referrals`
    }

    if (method === 'put') {
      await api.put(endpoint, payload)
    } else {
      await api.post(endpoint, payload)
    }

    // Close dialog
    // @ts-ignore
    dialogs.value[type] = false
    fetchData()
  } catch (e) {
    console.error('Save failed', e)
  }
}

// Transform API data to Timeline Tracks
const tracks = computed(() => {
  if (!rawTimelineData.value) return []

  // We expect rawTimelineData to have arrays: tiers, interventions, screenings, meetings
  const { tiers, interventions, screenings, meetings } = rawTimelineData.value

  const t = []

  // 1. Tiers Track
  if (tiers && tiers.length > 0) {
    t.push({
      id: 'tier',
      title: 'Tier History',
      height: 60,
      events: tiers.map((item: any) => ({
        id: item.id,
        type: 'tier',
        title: item.tierName || `Tier ${item.tier_id}`, // Adjust based on actual DTO
        startDate: item.start_date,
        endDate: item.end_date,
        color: getTierColor(item.tier_id),
        data: item,
      })),
    })
  } else {
    // Always show track even if empty?
    t.push({ id: 'tier', title: 'Tier History', height: 60, events: [] })
  }

  // 2. Interventions Track
  if (interventions) {
    t.push({
      id: 'interventions',
      title: 'Interventions',
      height: 100,
      events: interventions.map((item: any) => ({
        id: item.id,
        type: 'intervention',
        title: item.intervention_name || 'Intervention',
        subtitle: item.provider || '',
        startDate: item.start_date,
        endDate: item.end_date,
        color: '#2196F3',
        data: item,
      })),
    })
  } else {
    t.push({ id: 'interventions', title: 'Interventions', height: 100, events: [] })
  }

  // 3. Screenings Track
  if (screenings) {
    t.push({
      id: 'screenings',
      title: 'Screenings',
      height: 80,
      events: screenings.map((item: any) => ({
        id: item.id,
        type: 'screening',
        title: item.name || 'Screening',
        startDate: item.date,
        data: item,
      })),
    })
  } else {
    t.push({ id: 'screenings', title: 'Screenings', height: 80, events: [] })
  }

  // 4. Meetings
  if (meetings) {
    t.push({
      id: 'meetings',
      title: 'Meetings',
      height: 80,
      events: meetings.map((item: any) => ({
        id: item.id,
        type: 'meeting',
        title: item.type || 'Meeting',
        startDate: item.date,
        color: 'purple',
        data: item,
      })),
    })
  } else {
    t.push({ id: 'meetings', title: 'Meetings', height: 80, events: [] })
  }

  return t
})

const getTierColor = (tierId: number | string) => {
  // Simple logic, can be enhanced
  if (String(tierId).includes('1')) return '#4CAF50'
  if (String(tierId).includes('2')) return '#FF9800'
  if (String(tierId).includes('3')) return '#F44336'
  return 'grey'
}

const handleSelect = (item: any) => {
  selectedItem.value = item
  showDetails.value = true
}
</script>

<template>
  <div class="students-page d-flex flex-column">
    <!-- Top Header -->
    <StudentHeader v-if="student" :student="student" />
    <v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

    <div
      class="d-flex flex-grow-1 overflow-hidden position-relative pa-6"
      v-if="!isLoading && student"
    >
      <!-- Main Content -->
      <v-card class="flex-grow-1 d-flex flex-column overflow-hidden mtss-card" elevation="0">
        <MtssTimeline :tracks="tracks" @select-item="handleSelect" />

        <!-- Floating Action Button -->
        <v-menu location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="ph:plus"
              v-bind="props"
              color="primary"
              variant="elevated"
              size="large"
              style="position: absolute; bottom: 24px; right: 24px; z-index: 1000"
            ></v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="handleAdd('tier')" prepend-icon="ph:chart-bar">
              <v-list-item-title>Tier Placement</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleAdd('intervention')" prepend-icon="ph:first-aid">
              <v-list-item-title>Intervention</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleAdd('screening')" prepend-icon="ph:magnifying-glass">
              <v-list-item-title>Screening</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleAdd('meeting')" prepend-icon="ph:users-three">
              <v-list-item-title>Meeting</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleAdd('referral')" prepend-icon="ph:warning-circle">
              <v-list-item-title>Referral</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card>

      <!-- Detail Panel -->
      <MtssDetailPanel
        v-model="showDetails"
        :item="selectedItem"
        @edit="handleEdit"
        @delete="handleDelete"
        @end="handleEndIntervention"
      />

      <!-- DIALOGS -->
      <!-- Tier Dialog -->
      <v-dialog v-model="dialogs.tier" max-width="500">
        <v-card title="Tier Placement">
          <v-card-text>
            <v-autocomplete
              label="Select Tier"
              v-model="editingItem.tier_id"
              :items="definitions.tiers"
              item-title="name"
              item-value="id"
            ></v-autocomplete>
            <v-text-field
              type="date"
              label="Start Date"
              v-model="editingItem.start_date"
            ></v-text-field>
            <v-textarea label="Notes" v-model="editingItem.details"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogs.tier = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveItem('tier', editingItem)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Intervention Dialog -->
      <v-dialog v-model="dialogs.intervention" max-width="500">
        <v-card title="Student Intervention">
          <v-card-text>
            <v-autocomplete
              label="Intervention"
              v-model="editingItem.intervention_id"
              :items="definitions.interventions"
              item-title="name"
              item-value="id"
            ></v-autocomplete>
            <v-text-field
              type="date"
              label="Start Date"
              v-model="editingItem.start_date"
            ></v-text-field>
            <v-textarea label="Details / Provider" v-model="editingItem.details"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogs.intervention = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveItem('intervention', editingItem)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Screening Dialog -->
      <v-dialog v-model="dialogs.screening" max-width="500">
        <v-card title="Screening Record">
          <v-card-text>
            <v-text-field label="Screening Name" v-model="editingItem.name"></v-text-field>
            <v-text-field type="date" label="Date" v-model="editingItem.date"></v-text-field>
            <v-text-field label="Score" v-model="editingItem.score"></v-text-field>
            <v-textarea label="Details" v-model="editingItem.details"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogs.screening = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveItem('screening', editingItem)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Meeting Dialog -->
      <v-dialog v-model="dialogs.meeting" max-width="500">
        <v-card title="Meeting">
          <v-card-text>
            <v-select
              label="Type"
              v-model="editingItem.type"
              :items="['Tier 2 Review', 'Tier 3 Review', 'Parent Conference', 'Other']"
            ></v-select>
            <v-text-field type="date" label="Date" v-model="editingItem.date"></v-text-field>
            <v-textarea label="Outcome / Notes" v-model="editingItem.outcome"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogs.meeting = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveItem('meeting', editingItem)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Referral Dialog -->
      <v-dialog v-model="dialogs.referral" max-width="500">
        <v-card title="Referral">
          <v-card-text>
            <v-text-field type="date" label="Date" v-model="editingItem.date"></v-text-field>
            <v-text-field label="Referral Reason" v-model="editingItem.reason"></v-text-field>
            <v-textarea label="Details" v-model="editingItem.details"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogs.referral = false">Cancel</v-btn>
            <v-btn color="primary" @click="saveItem('referral', editingItem)">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div v-else-if="!isLoading && !student" class="d-flex justify-center align-center h-100">
      <v-alert type="error" v-if="error">{{ error }}</v-alert>
      <div v-else>No student data found.</div>
    </div>
  </div>
</template>

<style scoped>
.students-page {
  background: #f5f7fa;
  height: 100vh;
  overflow: hidden;
}

.mtss-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
}
</style>
```
