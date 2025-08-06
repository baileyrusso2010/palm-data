<template>
  <v-container class="py-8 settings-container">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-h3 font-weight-bold text-primary mb-2">Settings</h1>
          <p class="text-h6 text-medium-emphasis">Manage your WBL Learning Hour Types</p>
        </div>

        <!-- Main Card -->
        <v-card class="settings-card" elevation="12" rounded="xl">
          <v-card-title class="card-header pa-6">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon size="32" color="primary" class="mr-3">mdi-cog</v-icon>
                <span class="text-h5 font-weight-bold">WBL Learning Hour Types</span>
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                @click="addNewType"
                prepend-icon="mdi-plus"
                rounded="xl"
                class="add-btn"
              >
                Add Type
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pa-6">
            <!-- Type List -->
            <div class="type-list">
              <v-card
                v-for="(type, index) in types"
                :key="type.id"
                class="type-item mb-4"
                elevation="2"
                rounded="lg"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center">
                    <v-avatar size="40" color="primary" class="mr-4">
                      <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                    </v-avatar>

                    <div class="flex-grow-1 mr-4">
                      <v-text-field
                        v-if="type.editing"
                        v-model="type.tempName"
                        variant="outlined"
                        density="compact"
                        hide-details
                        autofocus
                        @keyup.enter="saveType(type)"
                        @keyup.escape="cancelEdit(type)"
                      ></v-text-field>
                      <div v-else class="type-name">
                        <span class="text-h6 font-weight-medium">{{ type.name }}</span>
                      </div>
                    </div>

                    <div class="type-actions">
                      <template v-if="type.editing">
                        <v-btn
                          icon
                          size="small"
                          color="success"
                          @click="saveType(type)"
                          class="mr-2"
                        >
                          <v-icon>mdi-check</v-icon>
                        </v-btn>
                        <v-btn icon size="small" color="grey" @click="cancelEdit(type)">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </template>
                      <template v-else>
                        <v-btn
                          icon
                          size="small"
                          color="primary"
                          @click="editType(type)"
                          class="mr-2"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="small" color="error" @click="deleteType(type.id)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Empty State -->
              <v-card v-if="types.length === 0" class="empty-state pa-8" elevation="1" rounded="lg">
                <div class="text-center">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-open</v-icon>
                  <h3 class="text-h6 font-weight-medium text-medium-emphasis mb-2">
                    No types found
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    Click "Add Type" to create your first WBL learning hour type.
                  </p>
                </div>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WblType {
  id: number
  name: string
  editing?: boolean
  tempName?: string
}

const types = ref<WblType[]>([
  { id: 1, name: 'Internship' },
  { id: 2, name: 'Job Shadow' },
  { id: 3, name: 'Apprenticeship' },
  { id: 4, name: 'Cooperative Education' },
])

function addNewType() {
  const newType: WblType = {
    id: Date.now(),
    name: '',
    editing: true,
    tempName: '',
  }
  types.value.unshift(newType)
}

function editType(type: WblType) {
  type.editing = true
  type.tempName = type.name
}

function saveType(type: WblType) {
  if (!type.tempName?.trim()) {
    // If empty name and it's a new item, remove it
    if (!type.name) {
      deleteType(type.id)
      return
    }
    // If existing item, cancel edit
    cancelEdit(type)
    return
  }

  type.name = type.tempName.trim()
  type.editing = false
  type.tempName = undefined
}

function cancelEdit(type: WblType) {
  if (!type.name) {
    // If it's a new item with no name, remove it
    deleteType(type.id)
    return
  }

  type.editing = false
  type.tempName = undefined
}

function deleteType(id: number) {
  types.value = types.value.filter((t) => t.id !== id)
}
</script>

<style scoped>
.settings-container {
  background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
  min-height: 100vh;
}

.settings-card {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.add-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.type-item {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  background: white;
}

.type-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.type-name {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.type-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px dashed #d1d5db;
}

.v-btn.v-btn--icon {
  border-radius: 8px;
}
</style>
