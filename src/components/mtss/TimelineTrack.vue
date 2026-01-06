<script setup lang="ts">
import TimelineItem from './TimelineItem.vue'

interface TrackEvent {
  id: string
  type: 'tier' | 'intervention' | 'screening' | 'meeting'
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
</script>

<template>
  <div class="timeline-track" :style="{ height: `${height}px` }">
    <!-- Track Label -->
    <div class="track-label">
      <div class="track-title">{{ title }}</div>
    </div>

    <!-- Track Content -->
    <div class="track-content">
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
  border-bottom: 1px solid rgb(var(--v-theme-grey-lighten-3));
  position: relative;
}

.track-label {
  width: 180px;
  flex-shrink: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgb(var(--v-theme-grey-lighten-3));
}

.track-title {
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-2));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.track-content {
  flex: 1;
  position: relative;
  background: rgb(var(--v-theme-grey-lighten-5));
}
</style>
