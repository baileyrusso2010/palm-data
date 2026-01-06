<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../api'

const tab = ref(null)
const isLoading = ref(false)

// Data
const interventions = ref<any[]>([])
const domains = ref<any[]>([])
const tiers = ref<any[]>([])

// Dialogs
const interventionDialog = ref(false)
const domainDialog = ref(false)
const tierDialog = ref(false)

// Editing State
const editedItem = ref<any>({})
const defaultItem = ref<any>({})
const dialogTitle = ref('')

// Headers
const interventionHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const domainHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const tierHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Level', key: 'level' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
  isLoading.value = true
  try {
    const [intRes, domRes, tierRes] = await Promise.all([
      api.get('/mtss/interventions'),
      api.get('/mtss/domains'),
      api.get('/mtss/tiers'),
    ])
    interventions.value = intRes.data
    domains.value = domRes.data
    tiers.value = tierRes.data
  } catch (e) {
    console.error('Error fetching definitions', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const openInterventionDialog = (item?: any) => {
  editedItem.value = item ? { ...item } : { name: '', type: '', description: '' }
  dialogTitle.value = item ? 'Edit Intervention' : 'New Intervention'
  interventionDialog.value = true
}

const openDomainDialog = (item?: any) => {
  editedItem.value = item ? { ...item } : { name: '', description: '' }
  dialogTitle.value = item ? 'Edit Domain' : 'New Domain'
  domainDialog.value = true
}

const openTierDialog = (item?: any) => {
  editedItem.value = item ? { ...item } : { name: '', level: 1, description: '' }
  dialogTitle.value = item ? 'Edit Tier' : 'New Tier'
  tierDialog.value = true
}

const saveIntervention = async () => {
  try {
    if (editedItem.value.id) {
      await api.put(`/mtss/interventions/${editedItem.value.id}`, editedItem.value)
    } else {
      await api.post('/mtss/interventions', editedItem.value)
    }
    interventionDialog.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

const saveDomain = async () => {
  try {
    if (editedItem.value.id) {
      await api.put(`/mtss/domains/${editedItem.value.id}`, editedItem.value)
    } else {
      await api.post('/mtss/domains', editedItem.value)
    }
    domainDialog.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

const saveTier = async () => {
  try {
    if (editedItem.value.id) {
      await api.put(`/mtss/tiers/${editedItem.value.id}`, editedItem.value)
    } else {
      await api.post('/mtss/tiers', editedItem.value)
    }
    tierDialog.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

const deleteItem = async (endpoint: string, id: any) => {
  if (!confirm('Are you sure you want to delete this item?')) return
  try {
    await api.delete(`${endpoint}/${id}`)
    fetchData()
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4 font-weight-bold">MTSS Configuration</h1>
    </div>

    <v-card :loading="isLoading">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="interventions">Interventions</v-tab>
        <v-tab value="domains">Domains</v-tab>
        <v-tab value="tiers">Tiers</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- Interventions -->
        <v-window-item value="interventions">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6">Intervention Definitions</h2>
              <v-btn
                color="primary"
                prepend-icon="ph:plus"
                variant="flat"
                @click="openInterventionDialog()"
                >Add Intervention</v-btn
              >
            </div>

            <v-data-table :items="interventions" :headers="interventionHeaders">
              <template v-slot:item.actions="{ item }">
                <v-icon size="small" class="me-2" @click="openInterventionDialog(item)"
                  >ph:pencil-simple</v-icon
                >
                <v-icon size="small" @click="deleteItem('/mtss/interventions', item.id)"
                  >ph:trash</v-icon
                >
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Domains -->
        <v-window-item value="domains">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6">Domains</h2>
              <v-btn
                color="primary"
                prepend-icon="ph:plus"
                variant="flat"
                @click="openDomainDialog()"
                >Add Domain</v-btn
              >
            </div>
            <v-data-table :items="domains" :headers="domainHeaders">
              <template v-slot:item.actions="{ item }">
                <v-icon size="small" class="me-2" @click="openDomainDialog(item)"
                  >ph:pencil-simple</v-icon
                >
                <v-icon size="small" @click="deleteItem('/mtss/domains', item.id)">ph:trash</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- Tiers -->
        <v-window-item value="tiers">
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6">Tiers</h2>
              <v-btn color="primary" prepend-icon="ph:plus" variant="flat" @click="openTierDialog()"
                >Add Tier</v-btn
              >
            </div>
            <v-data-table :items="tiers" :headers="tierHeaders">
              <template v-slot:item.actions="{ item }">
                <v-icon size="small" class="me-2" @click="openTierDialog(item)"
                  >ph:pencil-simple</v-icon
                >
                <v-icon size="small" @click="deleteItem('/mtss/tiers', item.id)">ph:trash</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Dialogs -->
    <!-- Intervention Dialog -->
    <v-dialog v-model="interventionDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
          <v-text-field v-model="editedItem.type" label="Type"></v-text-field>
          <v-textarea v-model="editedItem.description" label="Description"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="interventionDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue-darken-1" variant="text" @click="saveIntervention">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Domain Dialog -->
    <v-dialog v-model="domainDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
          <v-textarea v-model="editedItem.description" label="Description"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="domainDialog = false">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveDomain">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Tier Dialog -->
    <v-dialog v-model="tierDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedItem.name" label="Name"></v-text-field>
          <v-text-field v-model="editedItem.level" label="Level" type="number"></v-text-field>
          <v-textarea v-model="editedItem.description" label="Description"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="tierDialog = false">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveTier">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
