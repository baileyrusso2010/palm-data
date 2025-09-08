<template>
  <v-stepper v-model="step" alt-labels>
    <v-stepper-header>
      <v-stepper-item title="Add Programs" :value="1" />

      <v-divider />

      <v-stepper-item title="Create Sub-Courses" :value="2" />

      <v-divider />

      <v-stepper-item title="Create Courses" :value="3" />
    </v-stepper-header>

    <v-stepper-window>
      <v-stepper-window-item :value="1">
        <ProgramsManager />
      </v-stepper-window-item>

      <v-stepper-window-item :value="2">
        <SubCourseManager />
      </v-stepper-window-item>

      <v-stepper-window-item :value="3">
        <ClassManager />
      </v-stepper-window-item>
    </v-stepper-window>

    <v-stepper-actions
      :next-text="step === 3 ? 'Finish' : 'Next'"
      @click:prev="onPrev"
      @click:next="onNext"
    />
  </v-stepper>
  <!-- Optional: quick nav for debugging
  <div class="d-flex justify-center mt-4">
    <v-btn size="small" class="mr-2" @click="step = 1">Programs</v-btn>
    <v-btn size="small" class="mr-2" @click="step = 2">Classes</v-btn>
    <v-btn size="small" @click="step = 3">Templates</v-btn>
  </div>
  -->
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ProgramsManager from '@/components/ProgramsManager.vue'
import ClassManager from '@/components/ClassManager.vue'
import SubCourseManager from '@/components/SubCourseManager.vue'

const step = ref(1)

function onPrev() {
  if (step.value > 1) step.value -= 1
}

function onNext() {
  if (step.value < 3) step.value += 1
}
</script>
