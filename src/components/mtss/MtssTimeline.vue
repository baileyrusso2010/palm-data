<script setup lang="ts">
import { computed } from 'vue'
import { format, eachMonthOfInterval, startOfMonth } from 'date-fns'
import TimelineTrack from './TimelineTrack.vue'

interface TrackData {
  id: string
  title: string
  height: number
  events: any[]
}

interface Props {
  tracks: TrackData[]
  startDate?: Date
  endDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  startDate: () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6)
    return date
  },
  endDate: () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date
  },
})

const emit = defineEmits<{
  selectItem: [item: any]
}>()

// Generate month markers for time scale
const monthMarkers = computed(() => {
  return eachMonthOfInterval({
    start: startOfMonth(props.startDate),
    end: startOfMonth(props.endDate),
  })
})

// Calculate position for each month
const getMonthPosition = (date: Date) => {
  const totalDuration = props.endDate.getTime() - props.startDate.getTime()
  const offset = date.getTime() - props.startDate.getTime()
  return (offset / totalDuration) * 100
}

const handleSelectItem = (item: any) => {
  emit('selectItem', item)
}
</script>

<template>
  <div class="mtss-timeline">
    <!-- Time Scale Header -->
    <div class="timeline-header">
      <div class="timeline-header-label">
        <!-- Empty space for track labels -->
      </div>
      <div class="timeline-header-scale">
        <div
          v-for="month in monthMarkers"
          :key="month.toISOString()"
          class="month-marker"
          :style="{ left: `${getMonthPosition(month)}%` }"
        >
          <div class="month-label">
            {{ format(month, 'MMM yyyy') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Tracks -->
    <div class="timeline-body">
      <TimelineTrack
        v-for="track in tracks"
        :key="track.id"
        :title="track.title"
        :events="track.events"
        :height="track.height"
        :start-date="startDate"
        :end-date="endDate"
        @select-item="handleSelectItem"
      />
    </div>
  </div>
</template>

<style scoped>
.mtss-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
}

/* Time Scale Header */
.timeline-header {
  display: flex;
  border-bottom: 2px solid rgb(var(--v-theme-grey-lighten-2));
  background: rgb(var(--v-theme-surface));
  position: sticky;
  top: 0;
  z-index: 10;
}

.timeline-header-label {
  width: 180px;
  flex-shrink: 0;
  border-right: 1px solid rgb(var(--v-theme-grey-lighten-3));
}

.timeline-header-scale {
  flex: 1;
  position: relative;
  height: 48px;
  background: rgb(var(--v-theme-grey-lighten-5));
}

.month-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px solid rgb(var(--v-theme-grey-lighten-3));
}

.month-label {
  padding: 12px 8px;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-1));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Timeline Body */
.timeline-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
