<template>
  <div v-if="!failed">
    <v-container fluid class="d-flex align-center justify-center fill-height">
      <v-row class="justify-center align-center" style="width: 100%">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="8" class="pa-6">
            <v-card-title class="text-h5 text-center mb-2">Welcome</v-card-title>
            <v-card-subtitle class="text-center mb-6">Enter your hours below</v-card-subtitle>
            <v-form>
              <v-textarea
                v-model="description"
                :rules="descriptionRules"
                label="Description"
                counter
                auto-grow
                class="mb-4"
                rows="2"
                :maxlength="75"
              ></v-textarea>
              <v-select
                v-model="workType"
                label="Work"
                :items="['Internship', 'Co-Op']"
                :rules="workRules"
                variant="solo-filled"
                class="mb-4"
              ></v-select>
              <v-number-input
                v-model="hours"
                :rules="hoursRules"
                :reverse="false"
                controlVariant="default"
                label="Hours"
                :hideInput="false"
                :inset="false"
                variant="solo-filled"
                class="mb-6"
              ></v-number-input>
              <v-btn @click="submit" color="primary" block size="large" :disabled="!formValid"
                >Submit</v-btn
              >
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
  <div v-else>
    <v-container fluid class="d-flex align-center justify-center fill-height">
      <v-row class="justify-center align-center" style="width: 100%">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="8" class="pa-6 text-center">
            <v-card-title class="text-h5 mb-2">Please Contact Teacher</v-card-title>
            <v-card-subtitle class="mb-4">Error: Not Valid Code</v-card-subtitle>
            <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<!-- no need to get hours from api unless multiple schools and different -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const router = useRoute()
const token = ref('')
const student_id = ref('')
const failed = ref(false)

onMounted(async () => {
  token.value = router.params.token

  try {
    const results = await api.get(`/wbl-students/deployment/${token.value}`)
    student_id.value = results.data.student_id
  } catch (err) {
    failed.value = true
    console.log('Error: ', err)
  }
})

function submit() {
  console.log('working')
}

const description = ref('')
const workType = ref('')
const hours = ref(null)

const descriptionRules = [
  (v) => !!v || 'Description is required',
  (v) => v.length <= 75 || 'Max 75 characters',
]
const workRules = [(v) => !!v || 'Work type is required']
const hoursRules = [
  (v) => (v !== null && v !== '') || 'Hours are required',
  (v) => (v > 0 && v <= 24) || 'Enter valid hours (1-24)',
]

const formValid = computed(() => {
  return (
    description.value &&
    description.value.length <= 75 &&
    workType.value &&
    hours.value !== null &&
    hours.value !== '' &&
    hours.value > 0 &&
    hours.value <= 24
  )
})
</script>
<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
