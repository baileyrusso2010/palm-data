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
      <v-avatar size="36" color="primary" class="mr-3">
        <v-icon size="22">mdi-school</v-icon>
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
      <v-list-subheader v-if="!rail">Main</v-list-subheader>
      <v-list-item
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="isActive(item.to)"
        rounded="lg"
      />
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
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  to: string
  title: string
  icon: string
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
const items = computed<NavItem[]>(() => [
  { to: '/', title: 'Home', icon: 'mdi-home-outline' },
  { to: '/classes', title: 'Classes', icon: 'mdi-book-open-variant' },
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
