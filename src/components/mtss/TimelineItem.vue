<script setup lang="ts">
import { computed } from 'vue'

interface TimelineItemProps {
  item: {
    id: string
    type: 'tier' | 'intervention' | 'screening' | 'meeting' | 'referral'
    title: string
    subtitle?: string
    startDate: string
    endDate?: string
    color?: string
    data?: any
  }
  startDate: Date
  endDate: Date
  trackHeight: number
}

const props = defineProps<TimelineItemProps>()
const emit = defineEmits<{
  select: [item: any]
}>()

// Calculate position and width based on dates
const itemStyle = computed(() => {
  const timelineStart = props.startDate.getTime()
  const timelineEnd = props.endDate.getTime()
  const totalDuration = timelineEnd - timelineStart

  const itemStart = new Date(props.item.startDate).getTime()
  const left = ((itemStart - timelineStart) / totalDuration) * 100

  let width = 0
  if (props.item.endDate) {
    const itemEnd = new Date(props.item.endDate).getTime()
    width = ((itemEnd - itemStart) / totalDuration) * 100
  }

  return {
    left: `${Math.max(0, left)}%`,
    width: width > 0 ? `${width}%` : 'auto',
  }
})

const itemHeight = computed(() => {
  switch (props.item.type) {
    case 'tier':
      return '100%'
    case 'intervention':
      return '80%'
    case 'screening':
    case 'meeting':
    case 'referral':
      return 'auto'
    default:
      return 'auto'
  }
})

const handleClick = () => {
  emit('select', props.item)
}
</script>

<template>
  <!-- Tier Block -->
  <div
    v-if="item.type === 'tier'"
    class="timeline-item timeline-tier"
    :style="{
      left: itemStyle.left,
      width: itemStyle.width,
      height: itemHeight,
      backgroundColor: item.color,
    }"
    @click="handleClick"
  >
    <div class="tier-label">
      {{ item.title }}
    </div>
  </div>

  <!-- Intervention Bar -->
  <div
    v-else-if="item.type === 'intervention'"
    class="timeline-item timeline-intervention"
    :style="{
      left: itemStyle.left,
      width: itemStyle.width,
      height: itemHeight,
      backgroundColor: item.color,
    }"
    @click="handleClick"
  >
    <div class="intervention-content">
      <div class="intervention-title">{{ item.title }}</div>
      <div v-if="item.subtitle" class="intervention-subtitle">{{ item.subtitle }}</div>
    </div>
  </div>

  <!-- Screening Marker -->
  <div
    v-else-if="item.type === 'screening'"
    class="timeline-item timeline-screening"
    :style="{ left: itemStyle.left }"
    @click="handleClick"
  >
    <div class="screening-marker" :class="`screening-${item.color || 'primary'}`">
      <div class="screening-line" />
      <div class="screening-dot" />
    </div>
    <div class="screening-label">
      {{ item.title }}
    </div>
  </div>

  <!-- Meeting Marker -->
  <div
    v-else-if="item.type === 'meeting'"
    class="timeline-item timeline-meeting"
    :style="{ left: itemStyle.left }"
    @click="handleClick"
  >
    <div class="meeting-marker">
      <v-icon size="20" :color="item.color || 'purple'">ph:users-three</v-icon>
    </div>
    <div class="meeting-label">
      {{ item.title }}
    </div>
  </div>
</template>

<style scoped>
.timeline-item {
  position: absolute;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

/* Tier Blocks */
.timeline-tier {
  top: 4px;
  bottom: 4px;
  height: auto !important; /* Override inline height to respect padding */
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
}

.timeline-tier:hover {
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 20;
}

.tier-label {
  padding: 8px 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Intervention Bars */
.timeline-intervention {
  top: 15%;
  height: 70% !important;
  border-radius: 6px;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(33, 150, 243, 0.2);
}

.timeline-intervention:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
  z-index: 20;
}

.intervention-content {
  padding: 0 12px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intervention-title {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.intervention-subtitle {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Screening Markers */
.timeline-screening {
  top: 0;
  bottom: 0;
  width: 24px !important; /* Override width to be a touch target */
  transform: translateX(-12px); /* Center on date */
  display: flex;
  justify-content: center;
}

.screening-marker {
  position: relative;
  height: 100%;
  width: 2px;
}

.screening-line {
  position: absolute;
  top: 24px; /* Start below header/pin */
  bottom: 0;
  left: 50%;
  width: 2px;
  background-color: currentColor;
  opacity: 0.3;
}

.screening-dot {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: currentColor;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.timeline-screening:hover .screening-dot {
  transform: translateX(-50%) scale(1.3);
}

.screening-primary {
  color: #3b82f6;
} /* Blue 500 */
.screening-error {
  color: #ef4444;
} /* Red 500 */
.screening-success {
  color: #22c55e;
} /* Green 500 */
.screening-warning {
  color: #f59e0b;
} /* Amber 500 */

.screening-label {
  position: absolute;
  top: 28px;
  left: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 30;
  pointer-events: none; /* Let clicks pass to marker */
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-screening:hover .screening-label {
  opacity: 1;
}

/* Meeting Markers */
.timeline-meeting {
  top: 50%;
  margin-top: -16px;
  height: 32px;
  width: 32px !important;
  transform: translateX(-50%);
}

.meeting-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #a855f7; /* Purple 500 */
  transition: transform 0.2s;
}

.timeline-meeting:hover .meeting-marker {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: scale(1.15);
}

.meeting-label {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 30;
  opacity: 0;
  transition: opacity 0.2s;
}

.timeline-meeting:hover .meeting-label {
  opacity: 1;
}
</style>
