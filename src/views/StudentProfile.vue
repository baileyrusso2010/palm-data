<template>
  <v-container fluid class="pa-6 bg-gradient">
    <v-row>
      <!-- Left Side: Student Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-6 card-shadow" elevation="4" color="white">
          <v-card-title class="text-h5 primary-text">
            <v-icon left color="primary">mdi-account-circle</v-icon>
            Student Profile
          </v-card-title>
          <v-divider class="my-3"></v-divider>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="accent">mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Name:</v-list-item-title>
                <v-list-item-subtitle>{{ student.name }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="accent">mdi-card-account-details</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Student ID:</v-list-item-title>
                <v-list-item-subtitle>{{ student.id }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="accent">mdi-email</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Email:</v-list-item-title>
                <v-list-item-subtitle>{{ student.email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="accent">mdi-school</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Grade:</v-list-item-title>
                <v-list-item-subtitle>{{ student.grade }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="accent">mdi-book-open-page-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">Major:</v-list-item-title>
                <v-list-item-subtitle>{{ student.major }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Middle-Right: WBL Section -->
      <v-col cols="12" md="8">
        <v-card class="pa-6 card-shadow" elevation="4" color="white">
          <v-card-title class="text-h5 primary-text d-flex justify-space-between align-center">
            <div>
              <v-icon left color="primary">mdi-briefcase</v-icon>
              Work-Based Learning (WBL)
            </div>
            <div class="text-h6 accent-text">Total Hours: {{ totalWBLHours }}</div>
          </v-card-title>
          <v-card-actions class="pa-0 mb-3">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="openAddModal">
              <v-icon left>mdi-plus</v-icon>
              Add Hours
            </v-btn>
          </v-card-actions>
          <v-divider class="my-3"></v-divider>
          <v-data-table
            :headers="wblHeaders"
            :items="student.wblRecords"
            class="elevation-0 transparent-bg"
            hide-default-footer
            disable-pagination
            item-key="index"
            density="comfortable"
          >
            <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="(item, index) in items" :key="index" class="table-row">
                  <td class="pa-3">{{ item.type }}</td>
                  <td class="pa-3">{{ item.hours }}</td>
                  <td class="pa-3">{{ item.comments }}</td>
                </tr>
              </tbody>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add WBL Hours Modal -->
    <v-dialog v-model="addModal" max-width="500px">
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon left color="white">mdi-plus</v-icon>
          Add WBL Hours
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-select
              v-model="newRecord.type"
              :items="wblTypes"
              label="Type"
              :rules="[(v) => !!v || 'Type is required']"
              required
            ></v-select>
            <v-text-field
              v-model.number="newRecord.hours"
              label="Hours"
              type="number"
              :rules="[(v) => v > 0 || 'Hours must be greater than 0']"
              required
            ></v-text-field>
            <v-textarea
              v-model="newRecord.comments"
              label="Comments"
              :rules="[(v) => !!v || 'Comments are required']"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeAddModal">Cancel</v-btn>
          <v-btn color="primary" text @click="addWBLRecord" :disabled="!valid">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VDataTable } from 'vuetify/components'

interface WBLRecord {
  type: string
  hours: number
  comments: string
}

interface Student {
  name: string
  id: string
  email: string
  grade: string
  major: string
  wblRecords: WBLRecord[]
}

export default defineComponent({
  name: 'StudentProfile',
  components: {
    VDataTable,
  },
  data(): {
    student: Student
    wblHeaders: any[]
    addModal: boolean
    valid: boolean
    newRecord: WBLRecord
    wblTypes: string[]
  } {
    return {
      student: {
        name: 'John Doe',
        id: 'STU12345',
        email: 'john.doe@university.edu',
        grade: 'Senior',
        major: 'Computer Science',
        wblRecords: [
          { type: 'Internship', hours: 120, comments: 'Developed web applications' },
          { type: 'Apprenticeship', hours: 80, comments: 'Assisted in project management' },
          { type: 'Job Shadowing', hours: 20, comments: 'Observed software development processes' },
          { type: 'Co-op', hours: 150, comments: 'Contributed to backend development' },
        ],
      },
      wblHeaders: [
        { title: 'Type', key: 'type' },
        { title: 'Hours', key: 'hours' },
        { title: 'Comments', key: 'comments' },
      ],
      addModal: false,
      valid: false,
      newRecord: {
        type: '',
        hours: 0,
        comments: '',
      },
      wblTypes: [
        'Internship',
        'Apprenticeship',
        'Job Shadowing',
        'Co-op',
        'Volunteer Work',
        'Other',
      ],
    }
  },
  computed: {
    totalWBLHours(): number {
      return this.student.wblRecords.reduce((sum, record) => sum + record.hours, 0)
    },
  },
  methods: {
    openAddModal() {
      this.addModal = true
      this.newRecord = { type: '', hours: 0, comments: '' }
      this.valid = false
    },
    closeAddModal() {
      this.addModal = false
      this.newRecord = { type: '', hours: 0, comments: '' }
      this.valid = false
    },
    addWBLRecord() {
      if (this.valid) {
        this.student.wblRecords.push({ ...this.newRecord })
        this.closeAddModal()
      }
    },
  },
})
</script>

<style scoped>
/* .bg-gradient {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
} */
.card-shadow {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.primary-text {
  color: #1976d2 !important;
  font-weight: 600;
}
.accent-text {
  color: #d81b60 !important;
  font-weight: 500;
}
.transparent-bg {
  background: transparent !important;
}
.table-row:hover {
  background-color: #e3f2fd !important;
}
.table-row td {
  padding: 12px !important;
}
.v-card-actions {
  padding: 16px 24px 0 24px !important;
}
.pa-6 {
  padding: 24px !important;
}
.text-h5 {
  font-size: 1.5rem !important;
}
.text-h6 {
  font-size: 1.25rem !important;
}
.v-divider {
  border-color: #90caf9 !important;
}
</style>
