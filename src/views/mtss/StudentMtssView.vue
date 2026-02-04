<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import StudentHeader from '../../components/mtss/StudentHeader.vue'
import MtssTimeline from '../../components/mtss/MtssTimeline.vue'
import MtssDetailPanel from '../../components/mtss/MtssDetailPanel.vue'
import { PhPlus } from '@phosphor-icons/vue'
import { DateTime } from 'luxon'

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
    const timelineRes = await api.get(`/mtss/students/${studentId}/timeline`)
    rawTimelineData.value = timelineRes.data

    const studentData = await api.get(`/students/${studentId}`)
    console.log(studentData.data)

    // If the timeline response includes student info, use it. Otherwise we might Mock it or fetch it.
    // For now, let's assume the response structure.
    if (timelineRes.data.student) {
      student.value = timelineRes.data.student
    } else {
      // Fallback or separate fetch if needed.
      // Let's keep the mock student structure filled with data if possible.

      console.log(timelineRes.data.tiers)

      let currentTier = null
      let daysInTier = 0

      timelineRes.data.tiers.forEach((tier: any) => {
        if (tier.end_date === null) {
          currentTier = tier.tier_id
          //this is start_date "2025-09-22T04:00:00.000Z"
          daysInTier = Math.abs(
            Math.floor(DateTime.fromISO(tier.start_date).diff(DateTime.now(), 'days').days),
          )
        }
      })

      student.value = {
        name: studentData.data.first_name + ' ' + studentData.data.last_name || 'Student Name',
        grade: studentData.data.grade || 'N/A',
        school: studentData.data.school || 'N/A',
        currentTier: currentTier || 1,
        daysInTier: daysInTier || 0,
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
  const today = new Date().toISOString().substring(0, 10)
  editingItem.value = {
    start_date: today,
    date: today,
    tier_id: null,
    domain_id: null,
    intervention_id: null,
  }
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
    // Base payload with student_id
    let payload: any = { student_id: studentId }
    const today = new Date().toISOString().substring(0, 10)

    // Construct specific payloads based on type
    if (type === 'tier') {
      endpoint = '/mtss/student-tiers'
      payload = {
        ...payload,
        tier_id: data.tier_id,
        domain_id: data.domain_id,
        start_date: data.start_date || today,
        reason: data.details, // Map details to reason
      }
    } else if (type === 'intervention') {
      endpoint = '/mtss/student-interventions'
      payload = {
        ...payload,
        intervention_id: data.intervention_id,
        start_date: data.start_date || today,
        status: data.status || 'active',
      }
    } else if (type === 'screening') {
      endpoint = '/mtss/screenings'
      payload = {
        ...payload,
        domain_id: data.domain_id,
        assessment_name: data.name,
        screening_date: data.date || today,
        score: data.score,
        benchmark: data.benchmark,
      }
    } else if (type === 'meeting') {
      endpoint = '/mtss/meetings'
      payload = {
        ...payload,
        meeting_type: data.type,
        meeting_date: data.date || today,
        outcome: data.outcome,
      }
    } else if (type === 'referral') {
      endpoint = '/mtss/referrals'
      payload = {
        ...payload,
        referral_type: data.reason, // Assuming reason text is the type for now
        referral_date: data.date || today,
        status: data.status || 'pending',
      }
    }

    // If editing, append ID and change method
    if (editingItem.value && editingItem.value.id) {
      method = 'put'
      endpoint = `${endpoint}/${editingItem.value.id}`
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
    // Optional: set error state to show user
  }
}

// Transform API data to Timeline Tracks
const tracks = computed(() => {
  if (!rawTimelineData.value) return []

  // We expect rawTimelineData to have arrays: tiers, interventions, screenings, meetings, referrals
  const { tiers, interventions, screenings, meetings, referrals } = rawTimelineData.value

  const t = []

  // 1. Tiers Track
  if (tiers && tiers.length > 0) {
    t.push({
      id: 'tier',
      title: 'Tier History',
      height: 60,
      events: tiers.map((item: any) => {
        const tierDef = definitions.value.tiers.find((d: any) => d.id === item.tier_id)
        return {
          id: item.id,
          type: 'tier',
          title: tierDef ? tierDef.name : `Tier ${item.tier_id}`,
          startDate: item.start_date,
          endDate: item.end_date,
          color: getTierColor(item.tier_id),
          data: item,
        }
      }),
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
        title: item.Intervention?.name || item.intervention_name || 'Intervention',
        subtitle: item.Intervention?.provider || item.provider || '',
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
        title: item.assessment_name || item.name || 'Screening',
        startDate: item.screening_date || item.date,
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
        title: item.meeting_type || item.type || 'Meeting',
        startDate: item.meeting_date || item.date,
        color: 'purple',
        data: item,
      })),
    })
  } else {
    t.push({ id: 'meetings', title: 'Meetings', height: 80, events: [] })
  }

  // 5. Referrals
  if (referrals) {
    t.push({
      id: 'referrals',
      title: 'Referrals',
      height: 80,
      events: referrals.map((item: any) => ({
        id: item.id,
        type: 'referral',
        title: item.referral_type || 'Referral',
        startDate: item.referral_date || item.date,
        color: 'orange',
        data: item,
      })),
    })
  } else {
    t.push({ id: 'referrals', title: 'Referrals', height: 80, events: [] })
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
              :icon="PhPlus"
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
            <v-autocomplete
              label="Domain"
              v-model="editingItem.domain_id"
              :items="definitions.domains"
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
            <v-autocomplete
              label="Domain"
              v-model="editingItem.domain_id"
              :items="definitions.domains"
              item-title="name"
              item-value="id"
            ></v-autocomplete>
            <v-text-field label="Screening Name" v-model="editingItem.name"></v-text-field>
            <v-text-field type="date" label="Date" v-model="editingItem.date"></v-text-field>
            <v-text-field label="Score" v-model="editingItem.score"></v-text-field>
            <v-text-field label="Benchmark" v-model="editingItem.benchmark"></v-text-field>
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
