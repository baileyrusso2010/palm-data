<script setup lang="ts">
import { computed } from 'vue'
import { eachMonthOfInterval, startOfMonth } from 'date-fns'
import TimelineItem from './TimelineItem.vue'

interface TrackEvent {
  id: string
  type: 'tier' | 'intervention' | 'screening' | 'meeting' | 'referral'
  title: string
  subtitle?: string
  startDate: string
  endDate?: string
  color?: string
  data?: any
}

interface Props {
  title: string
  events: TrackEvent[]
  height: number
  startDate: Date
  endDate: Date
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectItem: [item: any]
}>()

const handleSelect = (item: any) => {
  emit('selectItem', item)
}

// Generate month markers for grid lines
const monthMarkers = computed(() => {
  return eachMonthOfInterval({
    start: startOfMonth(props.startDate),
    end: startOfMonth(props.endDate),
  })
})

const getMonthPosition = (date: Date) => {
  const totalDuration = props.endDate.getTime() - props.startDate.getTime()
  const offset = date.getTime() - props.startDate.getTime()
  return (offset / totalDuration) * 100
}
</script>

<template>
  <div class="timeline-track" :style="{ height: `${height}px` }">
    <!-- Track Label (Sticky) -->
    <div class="track-label sticky-col">
      <div class="track-title">{{ title }}</div>
      <div class="track-shadow"></div>
    </div>

    <!-- Track Content -->
    <div class="track-content">
      <!-- Grid Lines -->
      <div class="track-grid">
        <div
          v-for="month in monthMarkers"
          :key="month.toISOString()"
          class="grid-line"
          :style="{ left: `${getMonthPosition(month)}%` }"
        ></div>
      </div>

      <!-- Items -->
      <TimelineItem
        v-for="event in events"
        :key="event.id"
        :item="event"
        :start-date="startDate"
        :end-date="endDate"
        :track-height="height"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.timeline-track {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
  background: white;
}

.track-label {
  width: 200px;
  flex-shrink: 0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  background: white;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  left: 0;
  z-index: 15; /* Above items if they scroll under? No, items are in content. */
}

.track-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.track-shadow {
  position: absolute;
  top: 0;
  right: -4px;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
}

.track-content {
  flex: 1;
  position: relative;
  /* background: #f8fafc; optional stripe? */
}

.track-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dashed #e2e8f0;
}
</style>
