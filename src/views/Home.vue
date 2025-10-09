<template>
  <v-container fluid class="py-10 px-6 bg-grey-lighten-5">
    <!-- Header Section -->
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 font-weight-bold gradient-text mb-2">
          {{ districtTitle }}
        </h1>
        <div v-if="loading" class="mt-6">
          <v-progress-circular indeterminate color="primary" size="40" />
        </div>
        <p v-else-if="schools.length" class="text-body-1 text-grey-darken-1 mt-3">
          <v-icon color="primary" class="mr-1">mdi-school</v-icon>
          {{ schools.length }} {{ schools.length === 1 ? 'School' : 'Schools' }}
        </p>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-row v-if="error" class="justify-center mt-8">
      <v-col cols="12" md="8">
        <v-alert
          type="error"
          variant="tonal"
          :text="error"
          icon="mdi-alert-circle"
          class="rounded-lg"
        />
      </v-col>
    </v-row>

    <!-- Schools Section -->
    <div v-if="!loading">
      <v-row v-for="s in schools" :key="s.id" class="school-section mt-12 mb-16" justify="start">
        <v-col cols="12">
          <!-- School Header -->
          <div class="school-header mb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" size="32" class="mr-3">mdi-school-outline</v-icon>
              <h2 class="school-title text-h4 font-weight-bold">{{ s.name }}</h2>
            </div>
            <v-divider class="school-divider mt-4" thickness="3" color="primary" />
          </div>

          <!-- Grid of Classes -->
          <v-row class="cards-row mt-8">
            <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="3">
              <v-card
                class="class-card pa-4 ma-2"
                elevation="4"
                min-width="300"
                max-width="340"
                rounded="lg"
                hover
                color="white"
                link
              >
                <v-card-title class="text-h6 font-weight-bold primary--text">
                  Welding 101
                </v-card-title>
                <v-card-subtitle class="text-subtitle-2 text-grey-darken-1 mt-1">
                  Mrs. Shay - Morning
                </v-card-subtitle>
                <v-card-text class="mt-2">
                  <v-chip color="success" variant="flat" size="small" class="font-weight-medium">
                    Active
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- No Schools Found -->
      <div v-if="schools.length === 0" class="text-center mt-12">
        <v-icon icon="mdi-school-outline" size="64" color="grey-darken-1" class="mb-4" />
        <div class="text-h6 text-grey-darken-2 font-weight-medium">No schools found</div>
        <p class="text-body-2 text-grey-darken-1 mt-2">
          Please check back later or contact support.
        </p>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

type School = {
  id: number
  district_id: number
  name: string
  address?: string | null
  phone_number?: string | null
  website?: string | null
  home_schools?: any[]
}

type District = {
  district_id: number
  name?: string
  district_name?: string
  schools?: School[]
}

const loading = ref(false)
const error = ref<string | null>(null)
const district = ref<District | null>(null)

// In the future this could come from a route param
const districtId = 1

async function fetchDistrict() {
  loading.value = true
  error.value = null
  try {
    // Primary: fetch from backend
    const resp = await api.get(`/cte-districts/${districtId}`)
    const raw = resp?.data
    const payload: any = raw?.data ?? raw
    if (!payload || typeof payload !== 'object') {
      throw new Error('Unexpected response from server')
    }

    // Normalize district shape
    const base: District = {
      district_id: payload.district_id ?? payload.id ?? districtId,
      name: payload.name ?? payload.district_name,
      district_name: payload.district_name ?? payload.name,
      schools: Array.isArray(payload.schools) ? (payload.schools as School[]) : [],
    }

    district.value = base
    console.log('District payload:', payload)
    console.log('Initial schools:', district.value?.schools)

    // If schools not included, attempt to fetch them separately
    if (!Array.isArray(district.value.schools) || district.value.schools.length === 0) {
      try {
        const sResp = await api.get(`/cte-districts/${districtId}/schools`)
        const sRaw = sResp?.data
        const sPayload: any = sRaw?.data ?? sRaw
        const list: any = Array.isArray(sPayload)
          ? sPayload
          : Array.isArray(sPayload?.schools)
            ? sPayload.schools
            : []
        if (Array.isArray(list)) {
          district.value = {
            ...district.value,
            schools: list as School[],
          }
          console.log('Fetched schools separately:', district.value.schools)
        }
      } catch (e) {
        console.warn('Could not fetch schools separately:', e)
      }
    }
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load district'
  } finally {
    loading.value = false
  }
}

const schools = computed(() => district.value?.schools ?? [])
const districtTitle = computed(
  () => (district.value as any)?.name || (district.value as any)?.district_name || 'District',
)

onMounted(fetchDistrict)
</script>

<style scoped>
/* Gradient text for the district title */
.gradient-text {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* School title styling */
.school-title {
  letter-spacing: 0.3px;
  color: var(--v-theme-on-background);
  transition: color 0.3s ease;
}

/* School divider styling */
.school-divider {
  opacity: 0.8;
  border-radius: 2px;
}

/* Class card hover effect */
.class-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.class-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

/* Ensure cards have consistent spacing */
.cards-row {
  margin: -8px;
}

.cards-row > .v-col {
  padding: 8px;
}
</style>
