<script setup lang="ts">
import { computed } from 'vue'

interface TimelineItemProps {
  item: {
    id: string
    type: 'tier' | 'intervention' | 'screening' | 'meeting'
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
  transition: all 0.2s ease;
}

/* Tier Blocks */
.timeline-tier {
  top: 0;
  opacity: 0.85;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.timeline-tier:hover {
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tier-label {
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Intervention Bars */
.timeline-intervention {
  top: 10%;
  border-radius: 6px;
  opacity: 0.9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-intervention:hover {
  opacity: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.intervention-content {
  padding: 8px 12px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intervention-title {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.intervention-subtitle {
  font-size: 11px;
  opacity: 0.9;
  margin-top: 2px;
}

/* Screening Markers */
.timeline-screening {
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-1px);
}

.screening-marker {
  position: relative;
  height: 100%;
}

.screening-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background-color: currentColor;
  opacity: 0.4;
}

.screening-dot {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.screening-primary {
  color: #2196f3;
}
.screening-error {
  color: #f44336;
}
.screening-success {
  color: #4caf50;
}
.screening-warning {
  color: #ff9800;
}

.screening-label {
  position: absolute;
  top: 28px;
  left: 8px;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-2));
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.95);
  padding: 2px 6px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.timeline-screening:hover .screening-label {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Meeting Markers */
.timeline-meeting {
  top: 50%;
  transform: translate(-50%, -50%);
}

.meeting-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  border: 2px solid rgb(var(--v-theme-purple));
}

.timeline-meeting:hover .meeting-marker {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.meeting-label {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-darken-2));
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.95);
  padding: 2px 6px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.timeline-meeting:hover .meeting-label {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
</style>
