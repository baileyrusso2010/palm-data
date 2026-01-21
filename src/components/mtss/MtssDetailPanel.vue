<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'

interface Props {
  modelValue: boolean
  item: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: [item: any]
  end: [item: any]
  delete: [item: any]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const close = () => {
  isOpen.value = false
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    tier: 'Tier Placement',
    intervention: 'Intervention',
    screening: 'Screening',
    meeting: 'Meeting',
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    tier: 'success',
    intervention: 'primary',
    screening: 'info',
    meeting: 'purple',
  }
  return colors[type] || 'grey'
}
</script>

<template>
  <!-- Backdrop -->

  <!-- Detail Panel -->
  <v-navigation-drawer v-model="isOpen" location="right" temporary width="420" class="detail-panel">
    <template v-if="item">
      <!-- Header -->
      <div class="panel-header">
        <div class="d-flex align-center justify-space-between mb-3">
          <v-chip
            :color="getTypeColor(item.type)"
            size="small"
            variant="flat"
            class="text-uppercase"
            style="letter-spacing: 0.5px; font-size: 10px"
          >
            {{ getTypeLabel(item.type) }}
          </v-chip>
          <v-btn icon="ph:x" variant="text" density="compact" @click="close" />
        </div>
        <h2 class="text-h6 font-weight-semibold text-grey-darken-4">
          {{ item.title }}
        </h2>
        <div v-if="item.subtitle" class="text-body-2 text-grey-darken-1 mt-1">
          {{ item.subtitle }}
        </div>
      </div>

      <v-divider />

      <!-- Metadata -->
      <div class="panel-section">
        <div class="section-title">Timeline</div>

        <div class="metadata-grid">
          <div class="metadata-item">
            <div class="metadata-label">Start Date</div>
            <div class="metadata-value">{{ formatDate(item.startDate) }}</div>
          </div>

          <div v-if="item.endDate" class="metadata-item">
            <div class="metadata-label">End Date</div>
            <div class="metadata-value">{{ formatDate(item.endDate) }}</div>
          </div>

          <div v-else class="metadata-item">
            <div class="metadata-label">Status</div>
            <div class="metadata-value">
              <v-chip size="x-small" color="success" variant="outlined"> Ongoing </v-chip>
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Details -->
      <div v-if="item.data" class="panel-section">
        <div class="section-title">Details</div>
        <div v-if="item.data.reason || item.data.outcome" class="mb-3">
          <div class="metadata-value">{{ item.data.reason || item.data.outcome }}</div>
        </div>

        <div v-if="item.data.owner" class="mb-3">
          <div class="metadata-label">Owner</div>
          <div class="metadata-value">{{ item.data.owner }}</div>
        </div>

        <div v-if="item.data.details">
          <div class="metadata-label">Description</div>
          <div class="metadata-value">{{ item.data.details }}</div>
        </div>
      </div>

      <v-divider />

      <!-- Actions -->
      <div class="panel-section">
        <div class="d-flex flex-column" style="gap: 8px">
          <v-btn
            prepend-icon="ph:pencil-simple"
            variant="outlined"
            color="primary"
            block
            @click="$emit('edit', item)"
          >
            Edit
          </v-btn>

          <v-btn
            v-if="item.type === 'intervention' && !item.endDate"
            prepend-icon="ph:check-circle"
            variant="outlined"
            color="success"
            block
            @click="$emit('end', item)"
          >
            End Intervention
          </v-btn>

          <v-btn
            prepend-icon="ph:trash"
            variant="outlined"
            color="error"
            block
            @click="$emit('delete', item)"
          >
            Delete
          </v-btn>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="pa-6 text-center text-grey">
        <v-icon size="48" class="mb-4">ph:selection-slash</v-icon>
        <div class="text-body-2">No item selected</div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.detail-panel {
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 24px;
}

.panel-section {
  padding: 24px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-grey-darken-1));
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.metadata-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-label {
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-1));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metadata-value {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-4));
}
</style>
