<template>
  <v-container class="py-10">
    <div class="d-flex align-center mb-8">
      <h1 class="text-h4 font-weight-bold mr-4">Homework Assignments</h1>
      <PhExam :size="60" color="#07b624" weight="duotone" />
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">Add</v-btn>
    </div>

    <div>
      <v-expansion-panels class="mb-6" variant="accordion">
        <v-expansion-panel
          v-for="(assignment, i) in assignments"
          :key="assignment.id"
          elevation="1"
          class="assignment-panel mb-2"
          rounded="lg"
        >
          <v-expansion-panel-title expand-icon="mdi-menu-down">
            <div class="d-flex align-center flex-grow-1 pr-4">
              <div class="text-subtitle-1 font-weight-medium mr-3 text-truncate assignment-name">
                {{ assignment.name }}
              </div>
              <v-chip
                :color="statusColor(getStatus(assignment))"
                size="small"
                label
                class="mr-2 text-uppercase font-weight-medium"
              >
                {{ getStatus(assignment) }}
              </v-chip>
              <div class="ml-auto d-none d-sm-flex align-center meta-inline">
                <span
                  class="meta editable"
                  v-if="!isEditing(assignment.id, 'due_date')"
                  @click.stop="startEdit(assignment.id, 'due_date')"
                >
                  <v-icon icon="mdi-calendar" size="16" class="mr-1 opacity-70" />
                  <span v-if="assignment.due_date">{{ formatDate(assignment.due_date) }}</span>
                  <span v-else class="opacity-60">Set Due</span>
                </span>
                <span class="meta" v-else @click.stop>
                  <v-text-field
                    v-model="editBuffer.due_date"
                    type="date"
                    density="compact"
                    hide-details
                    style="max-width: 140px"
                    @keyup.enter="saveEdit(assignment, 'due_date')"
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-check"
                    @click.stop="saveEdit(assignment, 'due_date')"
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-close"
                    @click.stop="cancelEdit()"
                  />
                </span>
                <span class="meta">
                  <v-icon icon="mdi-star-circle" size="16" class="mr-1 opacity-70" />
                  {{ formatScore(assignment.max_score) }} pts
                </span>
                <span
                  class="meta editable"
                  v-if="!isEditing(assignment.id, 'weight')"
                  @click.stop="startEdit(assignment.id, 'weight')"
                >
                  <v-icon icon="mdi-scale-balance" size="16" class="mr-1 opacity-70" />
                  W: {{ formatWeight(assignment.weight) }}
                </span>
                <span class="meta" v-else @click.stop>
                  <v-text-field
                    v-model.number="editBuffer.weight"
                    density="compact"
                    type="number"
                    step="0.01"
                    hide-details
                    style="max-width: 90px"
                    @keyup.enter="saveEdit(assignment, 'weight')"
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-check"
                    @click.stop="saveEdit(assignment, 'weight')"
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-close"
                    @click.stop="cancelEdit()"
                  />
                </span>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="pa-2">
              <v-row class="mb-1" dense>
                <v-col cols="12" sm="3">
                  <div class="field-label">Max Score</div>
                  <div class="field-value">{{ formatScore(assignment.max_score) }}</div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="field-label d-flex align-center">
                    Weight
                    <v-tooltip text="Edit Weight" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="x-small"
                          variant="text"
                          icon="mdi-pencil"
                          @click.stop="startEdit(assignment.id, 'weight')"
                        />
                      </template>
                    </v-tooltip>
                  </div>
                  <div>
                    <template v-if="isEditing(assignment.id, 'weight')">
                      <v-text-field
                        v-model.number="editBuffer.weight"
                        density="compact"
                        type="number"
                        step="0.01"
                        hide-details
                        style="max-width: 120px"
                        @keyup.enter="saveEdit(assignment, 'weight')"
                      />
                      <div class="edit-actions">
                        <v-btn
                          size="x-small"
                          color="primary"
                          variant="tonal"
                          @click="saveEdit(assignment, 'weight')"
                          >Save</v-btn
                        >
                        <v-btn size="x-small" variant="text" @click="cancelEdit()">Cancel</v-btn>
                      </div>
                    </template>
                    <template v-else>
                      <div class="field-value">{{ formatWeight(assignment.weight) }}</div>
                    </template>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="field-label d-flex align-center">
                    Due Date
                    <v-tooltip text="Edit Due Date" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="x-small"
                          variant="text"
                          icon="mdi-pencil"
                          @click.stop="startEdit(assignment.id, 'due_date')"
                        />
                      </template>
                    </v-tooltip>
                  </div>
                  <div>
                    <template v-if="isEditing(assignment.id, 'due_date')">
                      <v-text-field
                        v-model="editBuffer.due_date"
                        type="date"
                        density="compact"
                        hide-details
                        style="max-width: 175px"
                        @keyup.enter="saveEdit(assignment, 'due_date')"
                      />
                      <div class="edit-actions">
                        <v-btn
                          size="x-small"
                          color="primary"
                          variant="tonal"
                          @click="saveEdit(assignment, 'due_date')"
                          >Save</v-btn
                        >
                        <v-btn size="x-small" variant="text" @click="cancelEdit()">Cancel</v-btn>
                      </div>
                    </template>
                    <template v-else>
                      <div class="field-value">
                        {{ assignment.due_date ? formatDate(assignment.due_date) : '—' }}
                      </div>
                    </template>
                  </div>
                </v-col>
                <v-col cols="12" sm="3">
                  <div class="field-label">Actions</div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      size="x-small"
                      variant="text"
                      icon="mdi-content-save"
                      :disabled="savingId === assignment.id"
                      @click="persistAssignment(assignment)"
                    >
                    </v-btn>
                    <v-progress-circular
                      indeterminate
                      size="16"
                      v-if="savingId === assignment.id"
                      color="primary"
                    />
                  </div>
                </v-col>
              </v-row>
              <div class="placeholder-text">Description or additional details can go here.</div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Add Assignment Dialog -->
    <v-dialog v-model="showAddDialog" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6">New Assignment</v-card-title>
        <v-card-text>
          <v-form ref="addFormRef" @submit.prevent="createAssignment">
            <v-row dense>
              <v-col cols="12">
                <v-text-field v-model="newAssignment.name" label="Name" required />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newAssignment.max_score"
                  label="Max Score"
                  type="number"
                  min="0"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newAssignment.weight"
                  label="Weight (0-1 or % )"
                  type="number"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newAssignment.due_date" label="Due Date" type="date" />
              </v-col>
            </v-row>
          </v-form>
          <v-alert v-if="addError" type="error" density="comfortable" variant="tonal" class="mt-2">
            {{ addError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="adding" @click="createAssignment">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { PhExam } from '@phosphor-icons/vue'

interface assignmentItems {
  id: number
  name: string
  max_score: number
  weight: number
  due_date: string | null
}

const assignments = ref<assignmentItems[]>([])
const savingId = ref<number | null>(null)
const editing = ref<{ id: number | null; field: 'weight' | 'due_date' | null }>({
  id: null,
  field: null,
})
const editBuffer = ref<{ weight: number | null; due_date: string | null }>({
  weight: null,
  due_date: null,
})

const showAddDialog = ref(false)
const adding = ref(false)
const addError = ref<string | null>(null)
const addFormRef = ref()
const newAssignment = ref<{
  name: string
  max_score: number | null
  weight: number | null
  due_date: string | null
}>({
  name: '',
  max_score: null,
  weight: null,
  due_date: null,
})

onMounted(async () => {
  const results = await axios.get('http://localhost:3000/api/assignments/course/1')

  assignments.value = results.data.data
  console.log(assignments.value)
})

function startEdit(id: number, field: 'weight' | 'due_date') {
  const a = assignments.value.find((x) => x.id === id)
  if (!a) return
  editing.value = { id, field }
  editBuffer.value.weight = a.weight
  // Convert due_date to YYYY-MM-DD for date input
  editBuffer.value.due_date = a.due_date ? a.due_date.substring(0, 10) : null
}

function isEditing(id: number, field: 'weight' | 'due_date') {
  return editing.value.id === id && editing.value.field === field
}

function cancelEdit() {
  editing.value = { id: null, field: null }
}

async function saveEdit(assignment: assignmentItems, field: 'weight' | 'due_date') {
  if (!isEditing(assignment.id, field)) return
  if (field === 'weight' && editBuffer.value.weight != null) {
    assignment.weight = editBuffer.value.weight
  }
  if (field === 'due_date') {
    assignment.due_date = editBuffer.value.due_date || null
  }
  await persistAssignment(assignment)
  cancelEdit()
}

// Persist whole assignment (assumes backend endpoint exists)
async function persistAssignment(assignment: assignmentItems) {
  try {
    savingId.value = assignment.id
    // Assumed endpoint & payload shape; adjust to your API
    await axios.put(`http://localhost:3000/api/assignments/${assignment.id}`, {
      name: assignment.name,
      max_score: assignment.max_score,
      weight: assignment.weight,
      due_date: assignment.due_date,
    })
  } catch (e: any) {
    console.error(e)
  } finally {
    savingId.value = null
  }
}

async function createAssignment() {
  addError.value = null
  if (!newAssignment.value.name) {
    addError.value = 'Name required'
    return
  }
  try {
    adding.value = true
    // Normalize weight if entered > 1 & <= 100 treat as percentage
    let weight = newAssignment.value.weight
    if (weight != null && weight > 1 && weight <= 100) weight = weight / 100
    const payload = {
      name: newAssignment.value.name,
      max_score: newAssignment.value.max_score ?? 0,
      weight: weight ?? 0,
      due_date: newAssignment.value.due_date || null,
      course_id: 1, // assumed; adjust as needed
    }
    const res = await axios.post('http://localhost:3000/api/assignments', payload)
    const created = res.data.data || res.data
    assignments.value.unshift(created)
    showAddDialog.value = false
    newAssignment.value = { name: '', max_score: null, weight: null, due_date: null }
  } catch (e: any) {
    console.error(e)
    addError.value = e?.response?.data?.message || 'Failed to create assignment'
  } finally {
    adding.value = false
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatScore(v: number) {
  return Number.isFinite(v) ? v : '-'
}

function formatWeight(w: number) {
  if (!Number.isFinite(w)) return '-'
  // If weight looks like 0-1 treat as percentage
  if (w <= 1) return (w * 100).toFixed(0) + '%'
  return w + ''
}

function getStatus(a: assignmentItems): string {
  if (!a.due_date) return 'No Due Date'
  const now = new Date()
  const due = new Date(a.due_date)
  if (isNaN(due.getTime())) return 'Unknown'
  const diffMs = due.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < -0.5) return 'Overdue'
  if (diffDays <= 2) return 'Due Soon'
  return 'Upcoming'
}

function statusColor(status: string): string {
  switch (status) {
    case 'Overdue':
      return 'error'
    case 'Due Soon':
      return 'warning'
    case 'Upcoming':
      return 'primary'
    case 'No Due Date':
      return 'grey'
    default:
      return 'secondary'
  }
}
</script>

<style scoped>
.assignment-panel :deep(.v-expansion-panel-title) {
  min-height: 56px;
}
.assignment-name {
  max-width: 220px;
}
.meta-inline .meta {
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  margin-left: 12px;
  opacity: 0.85;
  white-space: nowrap;
}
.field-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  margin-bottom: 2px;
}
.field-value {
  font-weight: 600;
}
.placeholder-text {
  font-size: 0.85rem;
  opacity: 0.65;
}
@media (max-width: 600px) {
  .meta-inline {
    display: none !important;
  }
  .assignment-name {
    max-width: 140px;
  }
}
</style>
