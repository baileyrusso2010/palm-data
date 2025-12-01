<!-- src/App.vue -->
<script setup>
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

// Fake data
const courseName = 'Biology 101 - Fall 2025'
const totalStudents = 28

const categories = ref([
  { id: 1, name: 'Homework', weight: 25, color: 'blue-lighten-4' },
  { id: 2, name: 'Quizzes', weight: 20, color: 'green-lighten-4' },
  { id: 3, name: 'Tests', weight: 35, color: 'orange-lighten-4' },
  { id: 4, name: 'Final Exam', weight: 20, color: 'purple-lighten-4' },
])

const students = ref([
  { id: 1, name: 'Adams, Sarah', enrollmentId: 101 },
  { id: 2, name: 'Brown, Jamal', enrollmentId: 102 },
  { id: 3, name: 'Chen, Emily', enrollmentId: 103 },
  { id: 4, name: 'Davis, Marcus', enrollmentId: 104 },
  { id: 5, name: 'Fernandez, Sofia', enrollmentId: 105 },
  { id: 6, name: 'Garcia, Luis', enrollmentId: 106 },
  { id: 7, name: 'Lee, Aisha', enrollmentId: 107 },
])

const assignments = ref([
  { id: 1, name: 'HW 1', categoryId: 1, totalPoints: 10 },
  { id: 2, name: 'HW 2', categoryId: 1, totalPoints: 15 },
  { id: 3, name: 'Quiz 1', categoryId: 2, totalPoints: 20 },
  { id: 4, name: 'Unit 1 Test', categoryId: 3, totalPoints: 100 },
  { id: 5, name: 'HW 3', categoryId: 1, totalPoints: 10 },
])

const scores = ref({
  '1-101': 10,
  '1-102': 8,
  '1-103': 10,
  '2-101': 14,
  '3-101': 18,
  '4-101': 92,
})

// Dialog states
const showCategories = ref(false)
const showNewAssignment = ref(false)
const newAssignment = ref({
  name: '',
  categoryId: null,
  totalPoints: 100,
})

// Column definitions with proper category grouping
const columnDefs = ref([
  {
    headerName: 'Student',
    field: 'name',
    pinned: 'left',
    width: 220,
    cellClass: 'font-medium',
    lockPosition: true,
  },
  // Dynamic assignment columns grouped by category
  ...categories.value.map((cat) => ({
    headerName: cat.name,
    headerClass: `bg-${cat.color} text-black`,
    marryChildren: true,
    children: assignments.value
      .filter((a) => a.categoryId === cat.id)
      .map((ass) => ({
        headerName: ass.name,
        headerTooltip: `${ass.totalPoints} points`,
        field: `score_${ass.id}`,
        width: 130,
        editable: true,
        cellClass: 'text-center',
        headerClass: 'text-caption',
        valueGetter: (p) => {
          const key = `${ass.id}-${p.data.enrollmentId}`
          const val = scores.value[key]
          return val === null || val === undefined ? '' : val
        },
        valueSetter: (p) => {
          const key = `${ass.id}-${p.data.enrollmentId}`
          const val = p.newValue === '' ? null : Number(p.newValue)
          if (val === null) delete scores.value[key]
          else scores.value[key] = val
          return true
        },
      })),
  })),
  {
    headerName: 'Overall',
    width: 130,
    pinned: 'right',
    valueGetter: (p) => calculateOverall(p.data.enrollmentId) + '%',
    cellClass: 'font-bold text-success text-h6',
    headerClass: 'bg-grey-lighten-3',
  },
])

const calculateOverall = (enrollmentId) => {
  let total = 0
  categories.value.forEach((cat) => {
    const ass = assignments.value.filter((a) => a.categoryId === cat.id)
    let earned = 0,
      possible = 0
    ass.forEach((a) => {
      const key = `${a.id}-${enrollmentId}`
      if (scores.value[key] != null) {
        earned += scores.value[key]
        possible += a.totalPoints
      }
    })
    if (possible > 0) total += (earned / possible) * cat.weight
  })
  return total.toFixed(1)
}

// Create new assignment
const createAssignment = () => {
  if (!newAssignment.value.name || !newAssignment.value.categoryId) return
  assignments.value.push({
    id: Date.now(),
    name: newAssignment.value.name,
    categoryId: newAssignment.value.categoryId,
    totalPoints: newAssignment.value.totalPoints || 100,
  })
  newAssignment.value = { name: '', categoryId: null, totalPoints: 100 }
  showNewAssignment.value = false
  // Trigger grid refresh
  columnDefs.value = [...columnDefs.value]
}
</script>

<template>
  <v-app>
    <v-app-bar elevation="4" class="bg-white">
      <v-app-bar-title class="text-h6 font-weight-bold">
        {{ courseName }}
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="showCategories = true">
        <v-icon left>mdi-cog</v-icon>
        Categories
      </v-btn>
      <v-btn color="primary" class="ml-3" @click="showNewAssignment = true">
        <v-icon left>mdi-plus</v-icon>
        Assignment
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-0">
        <div class="d-flex align-center pa-4 bg-white">
          <v-chip color="primary" label class="mr-3"> {{ totalStudents }} students </v-chip>
          <v-chip color="success" label> Weighted grading </v-chip>
          <v-spacer></v-spacer>
          <v-btn variant="tonal" size="small"> Export </v-btn>
        </div>

        <!-- Gradebook Grid -->
        <div class="ag-theme-alpine" style="height: calc(100vh - 180px); width: 100%">
          <AgGridVue
            :columnDefs="columnDefs"
            :rowData="students"
            :defaultColDef="{ resizable: true, sortable: false, suppressMovable: true }"
            domLayout="normal"
          />
        </div>

        <!-- Floating Action Button (modern style) -->
        <v-fab
          location="bottom end"
          icon="mdi-plus"
          color="primary"
          size="56"
          class="mb-8 mr-8"
          @click="showNewAssignment = true"
        />
      </v-container>
    </v-main>

    <!-- Categories Dialog -->
    <v-dialog v-model="showCategories" max-width="500">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon left color="white">mdi-tune</v-icon>
          Grading Categories & Weights
        </v-card-title>
        <v-card-text class="pt-6">
          <div v-for="cat in categories" :key="cat.id" class="mb-4">
            <div class="d-flex align-center">
              <div class="flex-grow-1 font-weight-medium">{{ cat.name }}</div>
              <v-text-field
                v-model.number="cat.weight"
                type="number"
                suffix="%"
                class="ml-4"
                style="width: 120px"
                density="compact"
                variant="outlined"
              />
            </div>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="text-h6 text-right">
            Total: <strong>{{ categories.reduce((a, b) => a + b.weight, 0) }}%</strong>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showCategories = false"> Done </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- New Assignment Dialog -->
    <v-dialog v-model="showNewAssignment" max-width="500">
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon left color="white">mdi-playlist-plus</v-icon>
          Create New Assignment
        </v-card-title>
        <v-card-text class="pt-6">
          <v-text-field
            v-model="newAssignment.name"
            label="Assignment Name"
            autofocus
            variant="outlined"
          ></v-text-field>
          <v-select
            v-model="newAssignment.categoryId"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Category"
            variant="outlined"
          ></v-select>
          <v-text-field
            v-model.number="newAssignment.totalPoints"
            label="Total Points"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showNewAssignment = false">Cancel</v-btn>
          <v-btn color="success" @click="createAssignment">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
.ag-theme-alpine {
  --ag-header-background-color: #f8f9fa;
  --ag-header-foreground-color: #333;
}
.ag-header-group-cell-label {
  font-weight: 600 !important;
  font-size: 1rem !important;
}
</style>
