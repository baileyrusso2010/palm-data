<template>
  <v-container class="py-8 settings-view" fluid>
    <v-row>
      <v-col cols="12" md="3" class="pr-md-0 mb-6 mb-md-0">
        <v-card elevation="2" class="h-100 d-flex flex-column">
          <v-card-title class="py-3 text-subtitle-2">Settings</v-card-title>
          <v-divider />
          <v-list nav density="comfortable" class="settings-nav" lines="one">
            <v-list-item
              v-for="s in sections"
              :key="s.value"
              :title="s.label"
              :active="tab === s.value"
              rounded="lg"
              @click="tab = s.value"
            >
              <template #prepend>
                <v-icon size="18" v-if="s.icon">{{ s.icon }}</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-card elevation="2">
          <v-card-title class="py-3 d-flex align-center">
            <v-icon size="20" class="mr-2" v-if="currentSection?.icon">{{
              currentSection.icon
            }}</v-icon>
            <span class="text-subtitle-1">{{ currentSection?.label }}</span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-5">
            <component :is="currentSection?.component" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import FlagsManager from '@/components/FlagsManager.vue'
import WBLTypesManager from '@/components/WBLTypesManager.vue'
import ClassManager from '@/components/ClassManager.vue'
import ProgramManager from '@/components/ProgramsManager.vue'

// Placeholder section components (replace with real components later)
const GeneralSection = {
  template: `<div class='d-flex flex-column gap-4'>
		<div>
			<div class='text-caption text-medium-emphasis mb-1'>Organization Name</div>
			<v-text-field variant='outlined' density='comfortable' hide-details placeholder='Enter name' />
		</div>
		<div>
			<div class='text-caption text-medium-emphasis mb-1'>Default Theme</div>
			<v-select :items="['Light','Dark','System']" variant='outlined' density='comfortable' hide-details />
		</div>
	</div>`,
}
const UsersSection = {
  template: `<div>
		<div class='text-body-2 mb-3'>Manage user related preferences and access controls here.</div>
		<v-alert type='info' variant='tonal' class='mb-4'>User management module coming soon.</v-alert>
	</div>`,
}
const NotificationsSection = {
  template: `<div>
		<v-switch label='Email Alerts' color='primary' hide-details class='mb-2' />
		<v-switch label='Daily Summary' color='primary' hide-details class='mb-2' />
		<v-switch label='Critical Flags Push' color='primary' hide-details />
	</div>`,
}
// Flags section now uses dedicated component
const FlagsSection = FlagsManager
const WBLTypesSection = WBLTypesManager
const SecuritySection = {
  template: `<div>
		<div class='text-body-2 mb-3'>Password & session policies.</div>
		<v-text-field label='Minimum Password Length' type='number' variant='outlined' density='comfortable' hide-details class='mb-4' />
		<v-switch label='Require 2FA' color='primary' hide-details />
	</div>`,
}

interface SectionDef {
  value: string
  label: string
  icon?: string
  component: any
}

const sections: SectionDef[] = [
  { value: 'general', label: 'General', icon: 'mdi-tune', component: GeneralSection },
  { value: 'users', label: 'Users', icon: 'mdi-account-multiple', component: UsersSection },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: 'mdi-bell-ring',
    component: NotificationsSection,
  },
  { value: 'flags', label: 'Flags', icon: 'mdi-flag', component: FlagsSection },
  {
    value: 'wbltypes',
    label: 'WBL Types',
    icon: 'mdi-format-list-bulleted',
    component: WBLTypesSection,
  },
  {
    value: 'courses',
    label: 'Courses',
    icon: 'mdi-format-list-bulleted',
    component: ClassManager,
  },
  {
    value: 'programs',
    label: 'Programs',
    icon: 'mdi-format-list-bulleted',
    component: ProgramManager,
  },
  { value: 'security', label: 'Security', icon: 'mdi-shield-lock', component: SecuritySection },
]

const tab = ref('general')
const currentSection = computed(() => sections.find((s) => s.value === tab.value) || sections[0])
</script>

<style scoped>
.settings-nav :deep(.v-list-item) {
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}
.settings-nav :deep(.v-list-item--active) {
  background: linear-gradient(
    90deg,
    var(--v-theme-primary) 0%,
    var(--v-theme-primary-darken-1) 100%
  );
  color: #fff !important;
}
.settings-nav :deep(.v-list-item--active .v-icon) {
  color: #fff !important;
}
</style>
