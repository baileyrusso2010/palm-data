<template>
  <v-navigation-drawer
    v-model="internalOpen"
    :rail="rail"
    app
    color="surface"
    elevation="2"
    expand-on-hover
    class="sidebar-nav"
  >
    <v-sheet class="px-3 pt-4 pb-2 d-flex align-center" color="transparent">
      <div v-if="!rail" class="sidebar-title-area">
        <h1 class="sidebar-title">Prathix</h1>
      </div>
      <v-spacer />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-chevron-double-left"
        class="ml-1 d-none d-lg-flex"
        @click.stop="toggleRail"
      />
    </v-sheet>

    <v-divider class="mb-1" />

    <v-list density="comfortable" nav>
      <v-list-subheader v-if="!rail">Explore</v-list-subheader>
      <v-list-item
        v-for="item in mainItems"
        :key="item.to"
        :to="item.to"
        :title="item.title"
        :active="isActive(item.to)"
        rounded="lg"
      >
        <template #prepend>
          <v-icon size="22" v-if="item.icon">{{ item.icon }}</v-icon>
          <span v-else-if="item.iconComp" class="ph-icon-wrapper">
            <component :is="item.iconComp" v-bind="item.iconCompProps" />
          </span>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2" />

    <v-list density="comfortable" nav>
      <v-list-subheader v-if="!rail">Forms</v-list-subheader>
      <v-list-item
        v-for="item in formItems"
        :key="item.to"
        :to="item.to"
        :title="item.title"
        :active="isActive(item.to)"
        rounded="lg"
      >
        <template #prepend>
          <v-icon size="22" v-if="item.icon">{{ item.icon }}</v-icon>
          <span v-else-if="item.iconComp" class="ph-icon-wrapper">
            <component :is="item.iconComp" v-bind="item.iconCompProps" />
          </span>
        </template>
      </v-list-item>
    </v-list>

    <v-spacer />

    <v-divider class="my-2" />
    <v-list density="compact" nav>
      <v-list-item
        rounded="lg"
        prepend-icon="mdi-theme-light-dark"
        :title="rail ? 'Theme' : 'Toggle Theme'"
        @click="emit('toggle-theme')"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhHouseLine,
  PhChalkboardSimple,
  PhExam,
  PhGear,
  PhStudent,
  PhTable,
  PhUserList,
  PhChartBar,
} from '@phosphor-icons/vue'

interface NavItem {
  to: string
  title: string
  icon?: string
  iconComp?: Component
  iconCompProps?: Record<string, any>
}

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'toggle-theme'): void
}>()

const internalOpen = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    if (v !== internalOpen.value) internalOpen.value = v
  },
)
watch(internalOpen, (v) => emit('update:modelValue', v))

// Mini (rail) state for large screens
const rail = ref(false)
function toggleRail() {
  rail.value = !rail.value
}

const route = useRoute()

const mainItems = computed<NavItem[]>(() => [
  {
    to: '/home',
    title: 'Home',
    iconComp: PhHouseLine,
    iconCompProps: { size: 22, color: '', weight: 'duotone' },
  },
  // {
  //   to: '/grading',
  //   title: 'Grading',
  //   iconComp: PhHouseLine,
  //   iconCompProps: { size: 22, color: '', weight: 'duotone' },
  // },
  {
    to: '/students',
    title: 'Search Students',
    iconComp: PhStudent,
    iconCompProps: { size: 22, color: '', weight: 'duotone' },
  },
  {
    to: '/breakdown',
    title: 'Analyze Data',
    iconComp: PhChartBar,
    iconCompProps: { size: 22, color: '', weight: 'duotone' },
  },
])

const formItems = computed<NavItem[]>(() => [
  // {
  //   to: '/student-form',
  //   title: 'Assign Forms',
  //   iconComp: PhUserList,
  //   iconCompProps: { size: 22, color: '', weight: 'duotone' },
  // },
  {
    to: '/skills',
    title: 'Create Form Skills',
    iconComp: PhTable,
    iconCompProps: { size: 22, color: '', weight: 'duotone' },
  },
])

function isActive(to: string) {
  return route.path === to
}
</script>

<style scoped>
.sidebar-nav :deep(.v-list-item--active) {
  background: linear-gradient(
    90deg,
    var(--v-theme-primary) 0%,
    var(--v-theme-primary-darken-1) 100%
  );
}
.sidebar-nav :deep(.v-list-item--active .v-icon) {
  color: white !important;
}
.sidebar-title-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}
.sidebar-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -1px;
  color: var(--v-theme-primary-darken-2, #1a237e);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-eyebrow {
  font-size: 0.85rem;
  color: var(--v-theme-primary-lighten-2, #90caf9);
  font-weight: 500;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}
.sidebar-subtitle {
  font-size: 0.95rem;
  color: var(--v-theme-on-surface, #666);
  margin-top: 2px;
  font-weight: 400;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-title-avatar {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--v-theme-primary-lighten-4, #e3f2fd);
  color: var(--v-theme-primary-darken-2, #1a237e);
  border-radius: 12px;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-title-initials {
  font-size: 1.3rem;
  font-weight: 700;
  color: inherit;
}
</style>
