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
      <v-avatar
        :size="rail ? 48 : 72"
        color="transparent"
        class="mr-3 d-flex align-center justify-center"
        rounded="0"
      >
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium app-title text-truncate" v-if="!rail">
        Palm Data
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
  /* color: white !important; */
}
.sidebar-nav :deep(.v-list-item--active .v-icon) {
  color: white !important;
}
.app-title {
  max-width: 140px;
}
</style>
