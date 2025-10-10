<template>
  <v-container fluid class="pa-6">
    <v-row>
      <!-- Left: Class info card -->
      <v-col cols="12" md="4" lg="3" class="mb-4 mb-md-0">
        <v-card class="mx-auto pa-4" max-width="340" elevation="4" rounded="lg" color="white">
          <v-card-title class="text-h5 font-weight-bold primary--text"> Welding 101 </v-card-title>
          <v-divider class="my-3"></v-divider>
          <v-card-text class="py-2 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-tie</v-icon>
            <span class="text-subtitle-1">Teacher: <strong>Mrs. Starks</strong></span>
          </v-card-text>
          <v-card-text class="py-2 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-welding</v-icon>
            <span class="text-subtitle-1">Program: <strong>Welding</strong></span>
          </v-card-text>
          <v-card-text class="py-2 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-code-tags</v-icon>
            <span class="text-subtitle-1">CIP: <strong>12.32</strong></span>
          </v-card-text>
          <v-card-text class="py-2 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-chart-line</v-icon>
            <span class="text-subtitle-1">SED: <strong>15.2</strong></span>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: Scrollable student list -->
      <v-col cols="12" md="8" lg="9">
        <v-card rounded="lg" elevation="4" class="pa-6" style="max-height: 80vh; overflow-y: auto">
          <div class="text-h6 font-weight-bold mb-4 primary--text">
            <v-icon left color="primary">mdi-account-group</v-icon>
            Students ({{ students.length }})
          </div>

          <v-row>
            <v-col v-for="student in students" :key="student.id" cols="12" sm="6" md="4">
              <v-card
                class="ma-2"
                elevation="2"
                hover
                rounded="lg"
                :class="{ 'on-hover': hovered === student.id }"
                @mouseover="hovered = student.id"
                @mouseleave="hovered = null"
                @click="router.push({ path: '/profile', query: { student_id: student.id } })"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="primary" size="40" class="mr-3">
                      <span class="white--text text-h6">
                        {{ student.name.charAt(0) }}
                      </span>
                    </v-avatar>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ student.name }}
                    </div>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center mb-2">
                      <v-icon small color="grey-darken-1" class="mr-2">mdi-cake</v-icon>
                      <span
                        >Age: <strong>{{ student.age }}</strong></span
                      >
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon small color="grey-darken-1" class="mr-2"
                        >mdi-gender-male-female</v-icon
                      >
                      <span
                        >Sex: <strong>{{ student.sex }}</strong></span
                      >
                    </div>
                    <div class="d-flex align-center">
                      <v-icon small color="grey-darken-1" class="mr-2">mdi-clock-outline</v-icon>
                      <span
                        >WBL Hours:
                        <v-chip v-if="student.wbl_hours" small color="success" class="ml-2">
                          {{ student.wbl_hours }} hrs
                        </v-chip>
                        <v-chip v-else small color="warning" class="ml-2"> Not Assigned </v-chip>
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type Sex = 'M' | 'F' | 'Other'
interface Student {
  id: number
  name: string
  age: number
  sex: Sex
  wbl_hours?: number
}

const students: Student[] = [
  { id: 1, name: 'John Doe', age: 17, sex: 'M', wbl_hours: 120 },
  { id: 2, name: 'Jane Smith', age: 16, sex: 'F' },
  { id: 3, name: 'Alex Johnson', age: 18, sex: 'Other' },
  { id: 4, name: 'Maria Garcia', age: 17, sex: 'F' },
  { id: 5, name: 'Liam Brown', age: 16, sex: 'M' },
  { id: 6, name: 'Emma Davis', age: 17, sex: 'F' },
  { id: 7, name: 'Noah Wilson', age: 18, sex: 'M' },
  { id: 8, name: 'Olivia Martinez', age: 16, sex: 'F' },
  { id: 9, name: 'William Taylor', age: 17, sex: 'M' },
  { id: 10, name: 'Sophia Anderson', age: 18, sex: 'F' },
  { id: 11, name: 'James Thomas', age: 17, sex: 'M' },
  { id: 12, name: 'Ava Jackson', age: 16, sex: 'F' },
]

const hovered = ref<number | null>(null)
</script>

<style scoped>
.v-card:hover {
  transition: all 0.3s ease;
  transform: translateY(-4px);
}
.v-card {
  transition: all 0.3s ease;
}
</style>
