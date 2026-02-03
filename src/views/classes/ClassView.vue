<template>
  <v-container fluid class="pa-4 bg-background">
    <!-- Context Bar -->
    <!-- Header Section -->
    <div class="mb-8 mt-2">
      <div class="d-flex align-center mb-2">
        <v-icon size="small" color="primary" class="mr-2">mdi-domain</v-icon>
        <span
          class="text-subtitle-2 text-medium-emphasis text-uppercase font-weight-bold"
          style="letter-spacing: 1px"
        >
          Rochester CSD • East HS
        </span>
      </div>
      <div class="d-flex align-center justify-space-between">
        <h1 class="text-h3 font-weight-bold text-high-emphasis">
          {{ classProfile.name }}
        </h1>
        <div class="d-flex gap-2">
          <v-chip
            v-if="classProfile.term"
            color="primary"
            variant="flat"
            size="large"
            class="font-weight-medium"
          >
            {{ classProfile.term }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Overview Section -->
    <div class="mb-6">
      <v-row>
        <!-- Card 1: Details -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4 h-100">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Class Details</div>
                <div class="text-caption text-medium-emphasis">{{ classProfile.term }}</div>
              </div>
              <v-icon color="primary" size="24">mdi-information-outline</v-icon>
            </div>
            <div class="d-flex flex-column gap-2">
              <div class="text-body-2">
                <strong class="text-medium-emphasis">Track:</strong> {{ classProfile.track }}
              </div>
              <div class="text-body-2">
                <strong class="text-medium-emphasis">Period:</strong> {{ classProfile.period }}
              </div>
              <div class="text-body-2">
                <strong class="text-medium-emphasis">Location:</strong>
                {{ classProfile.location }} ({{ classProfile.room }})
              </div>
              <div class="d-flex align-center mt-1">
                <v-chip size="x-small" label class="mr-2">CIP {{ classProfile.cipCode }}</v-chip>
                <v-chip size="x-small" label>SCED {{ classProfile.scedCode }}</v-chip>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Card 2: Instructor -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4 h-100">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Instructor</div>
                <div class="text-caption text-medium-emphasis">Staff Info</div>
              </div>
              <v-icon color="success" size="24">mdi-account-tie</v-icon>
            </div>
            <div class="d-flex flex-column gap-2">
              <div class="text-body-1 font-weight-medium">{{ classProfile.teacher.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ classProfile.teacher.email }}</div>
              <div class="text-caption text-medium-emphasis">{{ classProfile.teacher.phone }}</div>
              <v-divider class="my-2"></v-divider>
              <div class="text-caption text-medium-emphasis">
                {{ classProfile.teacher.support }}
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Card 3: Metrics -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="pa-4 h-100">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <div class="text-subtitle-1 font-weight-bold">Performance</div>
                <div class="text-caption text-medium-emphasis">Key Metrics</div>
              </div>
              <v-icon color="error" size="24">mdi-chart-box-outline</v-icon>
            </div>
            <div class="d-flex flex-column gap-2">
              <div
                v-for="metric in classMetrics"
                :key="metric.label"
                class="d-flex justify-space-between align-center"
              >
                <span class="text-caption text-medium-emphasis">{{ metric.label }}</span>
                <div class="text-right d-flex align-center">
                  <span class="text-body-2 font-weight-bold mr-2">{{ metric.value }}</span>
                  <v-icon
                    size="16"
                    :color="
                      metric.trendClass === 'positive'
                        ? 'success'
                        : metric.trendClass === 'negative'
                          ? 'error'
                          : 'grey'
                    "
                  >
                    {{ metric.icon }}
                  </v-icon>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Students Table Section -->
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-4 px-1">
        <div class="text-h6 font-weight-bold">Students ({{ students.length }})</div>
      </div>

      <v-card elevation="2">
        <v-data-table-virtual
          :headers="studentHeaders"
          :items="filteredStudents"
          height="600"
          fixed-header
          class="details-table"
          hover
          @click:row="goToStudentProfile"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="36" color="primary" variant="tonal" class="mr-3 rounded-circle">
                <span class="text-body-2 font-weight-bold">{{ item.initials }}</span>
              </v-avatar>
              <div>
                <div class="text-body-1 font-weight-medium text-high-emphasis">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.wblHours="{ item }">
            <div class="d-flex align-center">
              <v-progress-circular
                :model-value="(item.wblHours / 60) * 100"
                color="primary"
                size="32"
                width="4"
                class="mr-3"
              >
                <span class="text-caption font-weight-bold">{{ item.wblHours }}</span>
              </v-progress-circular>
            </div>
          </template>

          <template #item.wblActions="{ item }">
            <v-btn
              icon
              variant="text"
              color="primary"
              density="compact"
              @click.stop="openWblModal(item)"
            >
              <PhListBullets :size="20" weight="bold" />
            </v-btn>
          </template>
          <template #item.actions>
            <v-btn icon variant="text" density="compact" color="medium-emphasis">
              <v-icon size="20">mdi-chevron-right</v-icon>
            </v-btn>
          </template>
        </v-data-table-virtual>
      </v-card>
    </div>

    <!-- Evaluations Section -->
    <div class="mb-6">
      <div class="d-flex align-center justify-space-between mb-4 px-1">
        <div class="text-h6 font-weight-bold">Evaluations ({{ assignedForms.length }})</div>
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-plus"
          @click="openFormDialog"
        >
          Add Evaluation
        </v-btn>
      </div>
      <v-card elevation="2">
        <v-list lines="two" v-if="assignedForms.length" class="bg-transparent">
          <v-list-item
            v-for="form in assignedForms"
            :key="form.id"
            active-color="primary"
            :to="`/forms/grading/${route.params.id}/${form.id}`"
            class="evaluation-item"
          >
            <template #prepend>
              <v-avatar color="secondary" variant="tonal" class="rounded-lg">
                <v-icon>mdi-clipboard-text-outline</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">{{ form.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-medium-emphasis">
              {{ form.description || 'Student evaluation form' }}
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex align-center gap-2">
                <v-chip size="small" color="success" variant="tonal">Active</v-chip>
                <v-icon size="20" color="medium-emphasis">mdi-chevron-right</v-icon>
              </div>
            </template>
          </v-list-item>
        </v-list>
        <div v-else class="text-center py-8">
          <v-icon size="40" color="grey-lighten-1" class="mb-2">mdi-clipboard-text-outline</v-icon>
          <div class="text-body-2 text-medium-emphasis">No evaluations created yet</div>
        </div>
      </v-card>
    </div>

    <!-- Dialogs -->
    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon left color="primary">mdi-tune</v-icon>
          Set Up Grading Categories & Weights
        </v-card-title>

        <v-card-text class="pt-6">
          <p class="text-body-1 text-medium-emphasis mb-6">
            Most teachers use this setup — just adjust if needed:
          </p>

          <div v-for="(cat, index) in categories" :key="index" class="category-row mb-5">
            <div class="category-name flex-grow-1">
              <div v-if="editingIndex === index">
                <v-text-field
                  v-model="cat.name"
                  label="Category Name"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  autofocus
                  @blur="stopEditingCategory"
                  @keyup.enter.prevent="stopEditingCategory"
                  @keydown.esc.prevent="stopEditingCategory"
                ></v-text-field>
              </div>
              <div
                v-else
                class="category-name-display d-flex align-center justify-space-between"
                role="button"
                tabindex="0"
                @click="startEditingCategory(index)"
                @keyup.enter.prevent="startEditingCategory(index)"
                @keyup.space.prevent="startEditingCategory(index)"
                style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px"
              >
                <span class="category-name-text">{{ cat.name }}</span>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="startEditingCategory(index)"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="category-weight ml-4" style="width: 120px">
              <v-text-field
                v-model.number="cat.weight"
                label="Weight"
                type="number"
                suffix="%"
                min="0"
                max="100"
                step="1"
                variant="outlined"
                density="comfortable"
                hide-details
                class="category-weight-input"
              ></v-text-field>

              <div class="d-flex justify-end mt-1" v-if="categories.length > 1">
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeCategory(index)"
                ></v-btn>
              </div>
            </div>
          </div>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <span class="text-h6">Total Weight</span>
            <span
              class="text-h5 font-weight-bold"
              :class="totalWeight === 100 ? 'text-success' : 'text-error'"
            >
              {{ totalWeight }}%
            </span>
          </div>

          <v-alert
            v-if="totalWeight !== 100"
            type="warning"
            variant="tonal"
            class="mt-4"
            text="Weights must add up to exactly 100% to save."
          ></v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="formDialog" max-width="560" persistent>
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon left color="secondary">mdi-form-select</v-icon>
          Assign Form to Class
        </v-card-title>

        <v-card-text class="pt-6">
          <p class="text-body-1 text-medium-emphasis mb-6">
            Browse shared forms, preview the details, and optionally set a due date before
            assigning.
          </p>

          <div class="form-assignment-grid">
            <section class="form-list-panel">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-subtitle-2 text-medium-emphasis">Available Forms</span>
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="mdi-refresh"
                  :disabled="formsLoading"
                  @click="fetchForms"
                >
                  Refresh
                </v-btn>
              </div>

              <v-text-field
                v-model="formSearch"
                density="comfortable"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                label="Search forms"
                hide-details
                class="mb-3"
              ></v-text-field>

              <div class="form-list-scroll" role="list">
                <v-skeleton-loader
                  v-if="formsLoading"
                  type="list-item-two-line@3"
                  class="pa-2"
                ></v-skeleton-loader>

                <v-alert v-else-if="formsError" type="error" variant="tonal" class="mb-0">
                  <div class="d-flex align-center justify-space-between">
                    <span>{{ formsError }}</span>
                    <v-btn size="small" variant="text" @click="fetchForms">Retry</v-btn>
                  </div>
                </v-alert>

                <template v-else>
                  <v-list v-if="filteredForms.length" class="py-0" lines="two">
                    <v-list-item
                      v-for="form in filteredForms"
                      :key="form.id"
                      :class="['form-list-item', { 'is-selected': form.id === selectedForm }]"
                      @click="selectedForm = form.id"
                    >
                      <template #title>
                        <div class="d-flex align-center justify-space-between w-100">
                          <div>
                            <div class="text-body-1 font-weight-medium">{{ form.name }}</div>
                            <div class="text-caption text-medium-emphasis">
                              {{ form.description || 'No description' }}
                            </div>
                          </div>
                          <v-chip size="x-small" color="primary" variant="tonal">
                            v{{ form.version || 1 }}
                          </v-chip>
                        </div>
                      </template>
                      <template #append>
                        <v-icon :color="selectedForm === form.id ? 'secondary' : 'grey'">
                          {{
                            selectedForm === form.id ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'
                          }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </v-list>
                  <div v-else class="text-medium-emphasis text-center py-6">
                    <v-icon class="mb-2">mdi-file-search</v-icon>
                    <div>No forms match “{{ formSearch }}”.</div>
                  </div>
                </template>
              </div>
            </section>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="secondary"
            size="large"
            :loading="assigningForm"
            :disabled="!selectedForm || assigningForm"
            @click="assignForm"
          >
            Assign Form
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- WBL Modal -->
    <v-dialog v-model="wblDialog" max-width="700">
      <v-card v-if="selectedStudentForWbl" class="pa-0 overflow-hidden">
        <div class="pa-4 bg-primary d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar size="40" color="white" class="mr-3">
              <span class="text-primary font-weight-bold text-h6">{{
                selectedStudentForWbl.initials
              }}</span>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-white">
                {{ selectedStudentForWbl.name }}
              </div>
              <div class="text-caption text-white opacity-80">WBL Overview</div>
            </div>
          </div>
          <v-btn icon variant="text" color="white" @click="wblDialog = false">
            <PhX :size="24" weight="bold" />
          </v-btn>
        </div>

        <v-card-text class="pa-4 bg-background" style="max-height: 60vh; overflow-y: auto">
          <div class="d-grid gap-4">
            <!-- Stats Row -->
            <v-row class="mb-2">
              <v-col cols="12">
                <v-card variant="flat" border class="pa-3 h-100">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-avatar color="primary" variant="tonal" class="mr-3 rounded-lg">
                        <PhClock :size="24" weight="duotone" />
                      </v-avatar>
                      <div>
                        <div class="text-overline text-medium-emphasis">Total Hours</div>
                        <div class="text-h5 font-weight-bold">
                          {{ selectedStudentWblTotal }} / 60
                        </div>
                      </div>
                    </div>
                    <v-btn
                      color="primary"
                      variant="tonal"
                      size="small"
                      @click="showAddHoursForm = !showAddHoursForm"
                    >
                      <PhPlus :size="18" weight="bold" class="mr-1" />
                      {{ showAddHoursForm ? 'Cancel' : 'Add Hours' }}
                    </v-btn>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Add Hours Form -->
            <v-expand-transition>
              <v-card v-if="showAddHoursForm" variant="outlined" class="pa-4 mb-2">
                <div class="text-subtitle-1 font-weight-bold mb-3">Log New Hours</div>
                <v-form @submit.prevent="submitWblHours">
                  <v-select
                    v-model="wblFormData.categoryId"
                    :items="wblCategories"
                    item-title="name"
                    item-value="id"
                    label="Category"
                    variant="outlined"
                    density="comfortable"
                    :rules="[(v) => !!v || 'Category is required']"
                    class="mb-2"
                  ></v-select>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="wblFormData.hours"
                        label="Hours"
                        type="number"
                        min="0.5"
                        step="0.5"
                        variant="outlined"
                        density="comfortable"
                        :rules="[(v) => v > 0 || 'Hours required']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="wblFormData.date"
                        label="Date"
                        type="date"
                        variant="outlined"
                        density="comfortable"
                        :rules="[(v) => !!v || 'Date required']"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-textarea
                    v-model="wblFormData.comments"
                    label="Description"
                    variant="outlined"
                    rows="2"
                    density="comfortable"
                    class="mb-2"
                  ></v-textarea>
                  <div class="d-flex justify-end">
                    <v-btn color="primary" type="submit" :loading="savingWblHours">
                      Save Hours
                    </v-btn>
                  </div>
                </v-form>
              </v-card>
            </v-expand-transition>

            <!-- Log List -->
            <div>
              <div class="text-subtitle-1 font-weight-bold mb-3">Activity Log</div>
              <v-list class="bg-transparent pa-0" lines="two">
                <template v-if="loadingWbl">
                  <v-skeleton-loader type="list-item-three-line" count="3"></v-skeleton-loader>
                </template>
                <template v-else-if="wblLogs.length">
                  <v-card
                    v-for="(log, i) in wblLogs"
                    :key="log.id || i"
                    class="mb-3"
                    elevation="0"
                    border
                  >
                    <!-- Edit Mode -->
                    <template v-if="editingLogId === log.id">
                      <div class="pa-3">
                        <v-select
                          v-model="editFormData.categoryId"
                          :items="wblCategories"
                          item-title="name"
                          item-value="id"
                          label="Category"
                          variant="outlined"
                          density="compact"
                          class="mb-2"
                        ></v-select>
                        <v-row dense>
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="editFormData.hours"
                              label="Hours"
                              type="number"
                              min="0.5"
                              step="0.5"
                              variant="outlined"
                              density="compact"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="editFormData.date"
                              label="Date"
                              type="date"
                              variant="outlined"
                              density="compact"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-textarea
                          v-model="editFormData.comments"
                          label="Description"
                          variant="outlined"
                          rows="2"
                          density="compact"
                          class="mb-2"
                        ></v-textarea>
                        <div class="d-flex justify-end gap-2">
                          <v-btn size="small" variant="text" @click="cancelEdit">Cancel</v-btn>
                          <v-btn
                            size="small"
                            color="primary"
                            :loading="updatingWbl"
                            @click="saveEditedLog"
                          >
                            Save
                          </v-btn>
                        </div>
                      </div>
                    </template>
                    <!-- View Mode -->
                    <template v-else>
                      <div class="pa-3">
                        <div class="d-flex justify-space-between mb-1">
                          <div class="text-subtitle-2 font-weight-bold text-primary">
                            {{ log.category }}
                          </div>
                          <div class="d-flex align-center gap-1">
                            <div class="text-caption text-medium-emphasis mr-2">{{ log.date }}</div>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="primary"
                              @click="startEditLog(log)"
                            >
                              <PhPencilSimple :size="16" weight="bold" />
                            </v-btn>
                            <v-btn
                              icon
                              variant="text"
                              size="x-small"
                              color="error"
                              @click="confirmDeleteLog(log)"
                            >
                              <PhTrash :size="16" weight="bold" />
                            </v-btn>
                          </div>
                        </div>
                        <div class="text-body-2 mb-2">{{ log.description }}</div>
                        <div class="d-flex align-center">
                          <v-chip size="x-small" variant="tonal" color="primary"
                            >{{ log.hours }} Hours</v-chip
                          >
                          <span class="mx-2 text-caption text-disabled">•</span>
                          <span class="text-caption text-medium-emphasis">{{
                            log.supervisor
                          }}</span>
                        </div>
                      </div>
                    </template>
                  </v-card>
                </template>
                <div v-else class="text-center py-6 text-medium-emphasis">
                  No WBL hours logged yet.
                </div>
              </v-list>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this WBL entry? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deletingWbl" @click="deleteLog">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="assignmentSnackbar.open" :color="assignmentSnackbar.color" timeout="3000">
      {{ assignmentSnackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import { useRoute, useRouter } from 'vue-router'
import {
  PhListBullets,
  PhCheckCircle,
  PhClock,
  PhPencilSimple,
  PhTrash,
  PhX,
  PhPlus,
} from '@phosphor-icons/vue'

const route = useRoute()
const router = useRouter()
const dialog = ref(false)
const editingIndex = ref(null)
const needsSetup = ref(false)
const formDialog = ref(false)
const selectedForm = ref(null)
const dueDate = ref('')
const assignmentNotes = ref('')
const assigningForm = ref(false)
const assignmentSnackbar = ref({ open: false, color: 'success', message: '' })
const formSearch = ref('')
const formsLoading = ref(false)
const formsError = ref('')

const isLoading = ref(false)
const categories = ref([])
const availableForms = ref([])
const assignedForms = ref([])
const totalWeight = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.weight || 0), 0)
})

const filteredForms = computed(() => {
  const query = formSearch.value.trim().toLowerCase()
  if (!query) return availableForms.value
  return availableForms.value.filter((form) => {
    return (
      form.name?.toLowerCase().includes(query) ||
      form.description?.toLowerCase().includes(query) ||
      String(form.id).includes(query)
    )
  })
})

const startEditingCategory = (index) => {
  if (editingIndex.value !== null && editingIndex.value !== index) {
    stopEditingCategory()
  }

  editingIndex.value = index
}

const stopEditingCategory = () => {
  if (editingIndex.value === null) return

  const activeCategory = categories.value[editingIndex.value]
  if (activeCategory && typeof activeCategory.name === 'string' && !activeCategory.name.trim()) {
    activeCategory.name = 'New Category'
  }

  editingIndex.value = null
}

const addCategory = () => {
  categories.value.push({ name: 'New Category', weight: 0 })
  editingIndex.value = categories.value.length - 1
}

const removeCategory = (index) => {
  categories.value.splice(index, 1)
  if (editingIndex.value === index) {
    editingIndex.value = null
  } else if (editingIndex.value !== null && editingIndex.value > index) {
    editingIndex.value -= 1
  }
}

const openFormDialog = () => {
  //route to

  router.push(`/forms/select?classId=${route.params.id}`) //add id later
}

const assignForm = async () => {
  if (!selectedForm.value || assigningForm.value) return

  assigningForm.value = true
  const formName = selectedFormDetails.value?.name || 'Form'

  try {
    await api.post('/forms/assign/course', {
      courseId: route.params.id,
      formId: selectedForm.value,
      dueDate: dueDate.value || null,
      notes: assignmentNotes.value?.trim() || undefined,
    })

    assignmentSnackbar.value = {
      open: true,
      color: 'success',
      message: `${formName} assigned to this class.`,
    }
    await fetchAssignedForms()
    closeFormDialog()
  } catch (err) {
    console.error(err)
    assignmentSnackbar.value = {
      open: true,
      color: 'error',
      message: err?.response?.data?.error || 'Failed to assign the form. Please try again.',
    }
  } finally {
    assigningForm.value = false
  }
}

const fetchForms = async () => {
  formsLoading.value = true
  formsError.value = ''

  try {
    const classId = route.params.id
    const response = await api.get(`/evaluations/class/${classId}`)
    console.log('Evaluations response:', response)
    const payload = Array.isArray(response.data)
      ? response.data
      : Object.values(response.data || {})

    const formsList = payload.map((form) => ({
      id: form.id,
      name: form.name || form.title || 'Untitled Form',
      description: form.description || '',
      version: form.version || form.latest_version || null,
      updatedAt: form.updated_at || form.updatedAt || null,
    }))

    availableForms.value = formsList
    assignedForms.value = formsList
  } catch (err) {
    console.error(err)
    formsError.value = 'Failed to load evaluations'
  } finally {
    formsLoading.value = false
  }
}

const wblDialog = ref(false)
const selectedStudentForWbl = ref(null)
const wblLogs = ref([])
const loadingWbl = ref(false)
const selectedStudentWblTotal = computed(() => {
  return wblLogs.value.reduce((acc, curr) => acc + curr.hours, 0)
})

const showAddHoursForm = ref(false)
const savingWblHours = ref(false)
const wblCategories = ref([])
const wblFormData = ref({
  categoryId: null,
  hours: 0,
  date: new Date().toISOString().split('T')[0],
  comments: '',
})

// Edit/Delete state
const editingLogId = ref(null)
const editFormData = ref({
  categoryId: null,
  hours: 0,
  date: '',
  comments: '',
})
const updatingWbl = ref(false)
const deleteDialog = ref(false)
const deletingWbl = ref(false)
const logToDelete = ref(null)

const fetchWblCategories = async () => {
  try {
    const { data } = await api.get('/wbl-categories')
    wblCategories.value = data
  } catch (e) {
    console.error('Failed to fetch WBL categories', e)
  }
}

const submitWblHours = async () => {
  if (!wblFormData.value.categoryId || !wblFormData.value.hours || !wblFormData.value.date) return

  savingWblHours.value = true
  try {
    await api.post('/wbl-students', {
      student_id: selectedStudentForWbl.value.id,
      catagory_id: wblFormData.value.categoryId,
      hours: wblFormData.value.hours,
      date: wblFormData.value.date,
      comments: wblFormData.value.comments,
    })

    // Reset form and hide it
    showAddHoursForm.value = false
    wblFormData.value = {
      categoryId: null,
      hours: 0,
      date: new Date().toISOString().split('T')[0],
      comments: '',
    }

    // Refresh the logs
    await refreshWblLogs()
  } catch (e) {
    console.error('Error adding WBL hours', e)
  } finally {
    savingWblHours.value = false
  }
}

const refreshWblLogs = async () => {
  if (!selectedStudentForWbl.value) return

  loadingWbl.value = true
  try {
    const { data } = await api
      .get(`/wbl-students/${selectedStudentForWbl.value.id}`)
      .catch(() => ({ data: [] }))

    if (data && data.length > 0) {
      const allLogs = []
      data.forEach((cat) => {
        if (cat.wbl_hours && Array.isArray(cat.wbl_hours)) {
          cat.wbl_hours.forEach((log) => {
            allLogs.push({
              id: log.id,
              categoryId: cat.id,
              category: cat.name,
              hours: log.hours,
              rawDate: log.date,
              date: new Date(log.date).toLocaleDateString(),
              description: log.comments || 'No description provided',
              supervisor: log.supervisor || 'N/A',
            })
          })
        }
      })
      wblLogs.value = allLogs
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingWbl.value = false
  }
}

// Edit functions
const startEditLog = (log) => {
  editingLogId.value = log.id
  editFormData.value = {
    categoryId: log.categoryId,
    hours: log.hours,
    date: log.rawDate ? log.rawDate.split('T')[0] : '',
    comments: log.description === 'No description provided' ? '' : log.description,
  }
}

const cancelEdit = () => {
  editingLogId.value = null
  editFormData.value = { categoryId: null, hours: 0, date: '', comments: '' }
}

const saveEditedLog = async () => {
  if (!editingLogId.value) return

  updatingWbl.value = true
  try {
    await api.put(`/wbl-students/${editingLogId.value}`, {
      catagory_id: editFormData.value.categoryId,
      hours: editFormData.value.hours,
      date: editFormData.value.date,
      comments: editFormData.value.comments,
    })
    cancelEdit()
    await refreshWblLogs()
  } catch (e) {
    console.error('Error updating WBL entry', e)
  } finally {
    updatingWbl.value = false
  }
}

// Delete functions
const confirmDeleteLog = (log) => {
  logToDelete.value = log
  deleteDialog.value = true
}

const deleteLog = async () => {
  if (!logToDelete.value) return

  deletingWbl.value = true
  try {
    await api.delete(`/wbl-students/${logToDelete.value.id}`)
    deleteDialog.value = false
    logToDelete.value = null
    await refreshWblLogs()
  } catch (e) {
    console.error('Error deleting WBL entry', e)
  } finally {
    deletingWbl.value = false
  }
}

const openWblModal = async (student) => {
  selectedStudentForWbl.value = student
  wblDialog.value = true
  loadingWbl.value = true
  wblLogs.value = []
  showAddHoursForm.value = false
  editingLogId.value = null

  // Fetch categories for the dropdown
  if (!wblCategories.value.length) {
    fetchWblCategories()
  }

  try {
    // Attempt to fetch real data
    const { data } = await api.get(`/wbl-students/${student.id}`).catch(() => ({ data: [] }))

    if (data && data.length > 0) {
      const allLogs = []
      data.forEach((cat) => {
        if (cat.wbl_hours && Array.isArray(cat.wbl_hours)) {
          cat.wbl_hours.forEach((log) => {
            allLogs.push({
              id: log.id,
              categoryId: cat.id,
              category: cat.name,
              hours: log.hours,
              rawDate: log.date,
              date: new Date(log.date).toLocaleDateString(),
              description: log.comments || 'No description provided',
              supervisor: log.supervisor || 'N/A',
            })
          })
        }
      })
      wblLogs.value = allLogs
    } else {
      // Fallback mock data if API is empty/fails
      await new Promise((r) => setTimeout(r, 800))
      wblLogs.value = [
        {
          id: 'mock-1',
          categoryId: 1,
          category: 'Internship',
          hours: 4,
          rawDate: '2025-10-12',
          date: 'Oct 12, 2025',
          description: 'Assisted with database migration planning.',
          supervisor: 'Mr. Johnson',
        },
        {
          id: 'mock-2',
          categoryId: 2,
          category: 'Job Shadowing',
          hours: 2,
          rawDate: '2025-10-10',
          date: 'Oct 10, 2025',
          description: 'Shadowed senior developer during code review session.',
          supervisor: 'Sarah Lee',
        },
        {
          id: 'mock-3',
          categoryId: 3,
          category: 'Community Service',
          hours: 3,
          rawDate: '2025-10-05',
          date: 'Oct 05, 2025',
          description: 'Helped set up local tech meet-up event.',
          supervisor: 'Community Org',
        },
      ]
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingWbl.value = false
  }
}

const goToStudentProfile = (event, { item }) => {
  router.push(`/student/${item.id}`)
}

const classProfile = ref({
  name: '',
  track: 'STEM Academy Core',
  term: 'Fall 2025',
  period: 'Block 2',
  location: 'Phillips Campus — North Tower',
  room: '204A',
  cipCode: '27.0101',
  scedCode: '02052',
  schedule: { day: 'Mon / Wed / Fri', time: '09:05 – 10:20' },
  description:
    'Advanced algebra curriculum with emphasis on modeling, data interpretation, and collaborative problem solving. Designed for accelerated students preparing for Regents and collegiate coursework.',
  teacher: {
    name: 'Samantha Smith',
    email: 'samantha.smith@palm.edu',
    phone: '(585) 555-1034',
    support: 'Academic Director: Jordan Patel',
  },
})

const students = ref([])
onMounted(async () => {
  isLoading.value = true

  try {
    await fetchForms()
    const course_id = route.params.id
    const response = await api.get(`/course-instances/${course_id}?includeEnrollments=true`)
    console.log(response)

    const data = response.data

    classProfile.value = {
      ...classProfile.value,
      name: data?.alias ?? classProfile.value.name,
      cipCode: data?.course_catalog?.course_code ?? classProfile.value.cipCode,
      scedCode: data?.program_catalog?.state_program_code ?? classProfile.value.scedCode,
      location: data?.cte_school?.name ?? classProfile.value.location,
    }

    const enrollments = response.data.enrollments

    enrollments.forEach((element) => {
      // Calculate total WBL hours from real data
      const wblHoursArray = element.student.wbl_hours || []
      const totalWblHours = wblHoursArray.reduce((sum, log) => sum + (log.hours || 0), 0)

      students.value.push({
        id: element.student.id,
        name: `${element.student.first_name} ${element.student.last_name}`,
        email: `${element.student.first_name[0]}${element.student.last_name}@school.com`,
        grade: element.student.grade,
        status: 'active',
        gradePulse: { score: 94 },
        wblHours: totalWblHours,
      })
    })

    if (Array.isArray(data?.students) && data.students.length) {
      students.value = data.students
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }

  if (!availableForms.value.length) {
    await fetchForms()
  }
})

const classMetrics = ref([
  {
    label: 'Enrollment',
    value: '28 / 30',
    trend: '+2 since last term',
    icon: 'mdi-arrow-up',
    trendClass: 'positive',
  },
  {
    label: 'Median Grade',
    value: '91%',
    trend: '+3 pts week-over-week',
    icon: 'mdi-chart-line',
    trendClass: 'positive',
  },
  {
    label: 'Attendance',
    value: '96.4%',
    trend: 'stable',
    icon: 'mdi-progress-check',
    trendClass: 'neutral',
  },
  {
    label: 'Interventions',
    value: '3 open',
    trend: '1 resolved today',
    icon: 'mdi-alert-circle',
    trendClass: 'warning',
  },
])

const searchTerm = ref('')

const defaultGradePulse = {
  score: null,
  deltaPoints: 0,
  percentile: null,
  trend: 'holding steady',
  trendDirection: 'flat',
  signal: 'stable',
}

const normalizeGradePulse = (gradePulse) => ({
  score: gradePulse?.score ?? defaultGradePulse.score,
  deltaPoints: gradePulse?.deltaPoints ?? defaultGradePulse.deltaPoints,
  percentile: gradePulse?.percentile ?? defaultGradePulse.percentile,
  trend: gradePulse?.trend ?? defaultGradePulse.trend,
  trendDirection: gradePulse?.trendDirection ?? defaultGradePulse.trendDirection,
  signal: gradePulse?.signal ?? defaultGradePulse.signal,
})

const studentHeaders = [
  { title: 'Student', value: 'name' },
  { title: 'Grade Level', value: 'grade' },
  { title: 'WBL Hours', value: 'wblHours', align: 'start' },
  { title: '', value: 'wblActions', align: 'end', sortable: false },
  { title: '', value: 'actions', sortable: false },
]

const studentsWithInitials = computed(() =>
  students.value.map((student) => ({
    ...student,
    initials: student.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    gradePulse: normalizeGradePulse(student.gradePulse),
  })),
)

const filteredStudents = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return studentsWithInitials.value
  return studentsWithInitials.value.filter(
    (student) =>
      student.name.toLowerCase().includes(term) || student.id.toLowerCase().includes(term),
  )
})

const statusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Monitored':
      return 'warning'
    default:
      return 'grey'
  }
}

const signalColor = (signal) => {
  switch (signal) {
    case 'stable':
      return 'success'
    case 'watch':
      return 'warning'
    case 'at-risk':
      return 'error'
    default:
      return 'grey'
  }
}

const signalLabel = (signal) => {
  switch (signal) {
    case 'stable':
      return 'On Track'
    case 'watch':
      return 'Monitor'
    case 'at-risk':
      return 'Needs Support'
    default:
      return 'Unknown'
  }
}

const formatScore = (score) => {
  if (score === null || score === undefined || score === '') return '—'
  return `${score}%`
}

const formatDeltaPoints = (points) => {
  if (points === null || points === undefined || points === '') return '—'
  const num = Number(points)
  if (Number.isNaN(num)) return '—'
  const prefix = num > 0 ? '+' : ''
  return `${prefix}${num} pts`
}

const formatPercentile = (pct) => {
  if (pct === null || pct === undefined || pct === '') return '—'
  return `P${pct}`
}

const deltaClass = (points) => {
  const num = Number(points)
  if (Number.isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'positive' : 'negative'
}

const trendIcon = (direction) => {
  switch (direction) {
    case 'up':
      return 'mdi-trending-up'
    case 'down':
      return 'mdi-trending-down'
    default:
      return 'mdi-trending-neutral'
  }
}

const trendClass = (direction) => {
  switch (direction) {
    case 'up':
      return 'positive'
    case 'down':
      return 'negative'
    default:
      return 'neutral'
  }
}
</script>

<style scoped>
.pa-4 {
  background: #f8fafc;
}

.text-subtitle-2 {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-card {
  border: 1px solid #e2e8f0;
  border-radius: 4px; /* Slightly more rounded */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s ease-in-out;
}

.v-card:hover {
  border-color: #cbd5e1;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.text-h6 {
  font-size: 1.1rem !important;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.text-subtitle-1 {
  font-size: 15px;
  line-height: 1.2;
  color: #1e293b;
}

/* Custom Utils */
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}

/* Table Overrides */
:deep(.v-data-table) {
  background: transparent !important;
}
:deep(.v-data-table__tr:hover td) {
  background-color: #f8fafc !important;
}

/* Dialog Styles needed generally to ensure they look okay */
.form-list-scroll {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}
</style>
