<script setup lang="ts">
interface Student {
  name: string
  grade: string
  school: string
  currentTier: number
  daysInTier: number
  riskLevel: 'Low' | 'Medium' | 'High'
}

defineProps<{
  student: Student
}>()

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'error'
    default:
      return 'grey'
  }
}
</script>

<template>
  <div class="student-header bg-surface border-b px-6 d-flex align-center" style="height: 72px">
    <div class="d-flex align-center w-100" style="gap: 32px">
      <!-- Student Identity -->
      <div class="flex-grow-0">
        <h1 class="text-h5 font-weight-semibold text-grey-darken-4 mb-1">
          {{ student.name }}
        </h1>
        <div class="text-caption text-grey-darken-1">
          {{ student.grade }} • {{ student.school }}
        </div>
      </div>

      <!-- Divider -->
      <v-divider vertical class="my-3" />

      <!-- MTSS Status -->
      <div class="d-flex align-center" style="gap: 24px">
        <!-- Current Tier -->
        <div>
          <div
            class="text-caption text-grey-darken-1 mb-1 text-uppercase"
            style="letter-spacing: 0.5px; font-size: 10px"
          >
            Current Tier
          </div>
          <v-chip
            :color="getTierColor(student.currentTier)"
            variant="flat"
            size="small"
            class="font-weight-medium"
          >
            Tier {{ student.currentTier }}
          </v-chip>
        </div>

        <!-- Days in Tier -->
        <div>
          <div
            class="text-caption text-grey-darken-1 mb-1 text-uppercase"
            style="letter-spacing: 0.5px; font-size: 10px"
          >
            Days in Tier
          </div>
          <div class="text-subtitle-2 font-weight-medium text-grey-darken-3">
            {{ student.daysInTier }}
          </div>
        </div>

        <!-- Risk Level -->
      </div>

      <v-spacer />

      <!-- Actions (optional) -->
      <div class="flex-grow-0">
        <v-btn
          icon="ph:dots-three-outline-vertical"
          variant="text"
          density="comfortable"
          color="grey-darken-2"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-3));
}
</style>
