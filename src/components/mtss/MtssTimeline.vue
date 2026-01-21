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
    date.setMonth(date.getMonth() - 9) // 9 months back
    return date
  },
  endDate: () => {
    const date = new Date()
    date.setMonth(date.getMonth() + 3) // 3 months forward
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
  <div class="mtss-timeline-container">
    <div class="timeline-scroll-area">
      <div class="timeline-content" :style="{ minWidth: '1200px' }">
        <!-- Time Scale Header -->
        <div class="timeline-header">
          <div class="timeline-header-label sticky-col">
            <span class="text-caption text-medium-emphasis font-weight-bold">TRACKS</span>
            <div class="header-shadow"></div>
          </div>
          <div class="timeline-header-scale">
            <div
              v-for="month in monthMarkers"
              :key="month.toISOString()"
              class="month-marker"
              :style="{ left: `${getMonthPosition(month)}%` }"
            >
              <div class="month-label">
                {{ format(month, 'MMMM yyyy') }}
              </div>
              <div class="month-grid-line"></div>
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
    </div>
  </div>
</template>

<style scoped>
.mtss-timeline-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden; /* Container clips */
}

.timeline-scroll-area {
  flex: 1;
  overflow: auto; /* Both X and Y scrolling happens here */
  position: relative;
}

.timeline-content {
  position: relative;
  /* min-width set inline */
}

/* Time Scale Header */
.timeline-header {
  display: flex;
  height: 48px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 20; /* Above tracks */
}

.timeline-header-label {
  width: 200px;
  flex-shrink: 0;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  left: 0;
  z-index: 30; /* Above header scale */
}

.header-shadow {
  position: absolute;
  top: 0;
  right: -4px;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
}

.timeline-header-scale {
  flex: 1;
  position: relative;
  height: 100%;
}

.month-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  /* border-left: 1px dashed #e2e8f0; */
}

.month-label {
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.month-grid-line {
  position: absolute;
  left: 0;
  top: 48px; /* Start below header */
  bottom: -10000px; /* Hack to extend down? No, better to handle in track */
  width: 1px;
  background: #f1f5f9;
  display: none; /* Handled in tracks for cleanliness, or global overlay */
}

/* Timeline Body */
.timeline-body {
  position: relative;
  z-index: 10;
}
</style>
