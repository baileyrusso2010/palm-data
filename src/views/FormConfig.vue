<template>
  <v-container class="pa-4" max-width="500px">
    <v-card>
      <v-card-title>Create Employability Form</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Form Name -->
          <v-text-field
            v-model="formName"
            label="Form Name"
            :rules="[rules.required]"
            required
          ></v-text-field>

          <!-- Grade Level -->
          <v-select
            v-model="gradeLevel"
            :items="gradeLevels"
            label="Grade Level"
            :rules="[rules.required]"
            required
          ></v-select>

          <!-- Grading Period -->
          <v-select
            v-model="gradingPeriod"
            :items="gradingPeriods"
            label="Grading Period"
            :rules="[rules.required]"
            required
          ></v-select>

          <!-- Submit Button -->
          <v-btn class="mt-4" color="primary" :disabled="!valid" @click="submitForm">
            Create Form
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api'

const formName = ref('')
const gradeLevel = ref(null)
const gradingPeriod = ref(null)
const valid = ref(false)

const gradeLevels = ['Junior', 'Senior', 'Both']
const gradingPeriods = ['Quarterly', 'Semester', 'Yearly']

const rules = {
  required: (v) => !!v || 'This field is required',
}

const submitForm = async () => {
  if (!valid.value) return

  // Here you would send data to backend
  console.log({
    formName: formName.value,
    gradeLevel: gradeLevel.value,
    gradingPeriod: gradingPeriod.value,
  })

  let response = await api.post('/forms', {
    name: 'something',
    course_id: 101,
    grading_period: 'semester',
  })
  console.log(response)

  alert('Form Created! Check console for data.')
}
</script>

<style scoped>
.v-card {
  width: 100%;
}
</style>
