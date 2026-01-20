<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Settings Sidebar -->
      <v-col cols="12" md="3" lg="2" class="settings-sidebar border-e">
        <v-list density="comfortable" nav class="pt-4">
          <v-list-subheader class="text-uppercase font-weight-bold mb-2">Settings</v-list-subheader>

          <v-list-item
            v-for="item in settingsItems"
            :key="item.value"
            :value="item.value"
            :active="activeTab === item.value"
            @click="activeTab = item.value"
            rounded="lg"
            color="primary"
          >
            <template #prepend>
              <component :is="item.iconComp" size="22" weight="duotone" class="mr-2" />
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Main Content Area -->
      <v-col cols="12" md="9" lg="10" class="fill-height bg-grey-lighten-4">
        <v-container class="pa-6" style="max-width: 1200px">
          <div class="mb-6">
            <h1 class="text-h4 font-weight-bold">{{ activeItem?.title }}</h1>
            <p class="text-body-1 text-medium-emphasis">{{ activeItem?.description }}</p>
          </div>

          <v-card flat class="border rounded-lg">
            <!-- Sub-tabs for Permissions/Roles -->
            <v-tabs v-if="activeTab === 'permissions'" v-model="permissionSubTab" color="primary">
              <v-tab value="roles">Roles</v-tab>
              <v-tab value="perms">Permissions</v-tab>
            </v-tabs>

            <v-card-text class="pa-6">
              <!-- PERMISSIONS / ROLES Tab -->
              <div v-if="activeTab === 'permissions'">
                <!-- Roles View -->
                <div v-if="permissionSubTab === 'roles'">
                  <div class="d-flex justify-space-between align-center mb-6">
                    <h2 class="text-h6">User Roles</h2>
                    <v-btn color="primary" @click="openRoleDialog()">
                      <template #prepend><PhPlus size="20" weight="bold" /></template>
                      Add Role
                    </v-btn>
                  </div>

                  <v-list border rounded>
                    <v-list-item
                      v-for="role in roles"
                      :key="role.id"
                      lines="two"
                      link
                      @click="openPermissionsDialog(role)"
                    >
                      <template #prepend>
                        <v-avatar color="primary-lighten-4" class="text-primary font-weight-bold">
                          {{ role.name.charAt(0) }}
                        </v-avatar>
                      </template>

                      <v-list-item-title class="font-weight-bold">{{
                        role.name
                      }}</v-list-item-title>
                      <v-list-item-subtitle
                        >{{ role.permissions?.length || 0 }} permissions</v-list-item-subtitle
                      >

                      <template #append>
                        <v-btn
                          variant="text"
                          size="small"
                          color="grey-darken-1"
                          icon
                          @click.stop="openRoleDialog(role)"
                        >
                          <PhPencil size="20" />
                        </v-btn>
                        <v-btn
                          variant="text"
                          size="small"
                          color="error"
                          icon
                          @click.stop="confirmDeleteRole(role)"
                        >
                          <PhTrash size="20" />
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>

                <!-- Permissions View -->
                <div v-if="permissionSubTab === 'perms'">
                  <div class="d-flex justify-space-between align-center mb-6">
                    <h2 class="text-h6">All Permissions</h2>
                    <v-btn color="primary" @click="openEditPermissionDialog()">
                      <template #prepend><PhPlus size="20" weight="bold" /></template>
                      Add Permission
                    </v-btn>
                  </div>

                  <v-table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Description</th>
                        <th class="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="perm in allPermissions" :key="perm.id">
                        <td>
                          <code>{{ perm.key }}</code>
                        </td>
                        <td>{{ perm.description }}</td>
                        <td class="text-right">
                          <v-btn
                            size="small"
                            variant="text"
                            icon
                            @click="openEditPermissionDialog(perm)"
                          >
                            <PhPencil size="20" />
                          </v-btn>
                          <v-btn
                            size="small"
                            variant="text"
                            color="error"
                            icon
                            @click="confirmDeletePermission(perm)"
                          >
                            <PhTrash size="20" />
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </div>

              <!-- Other sections -->
              <div v-else class="text-center py-12 text-grey">
                <PhWrench size="64" class="mb-4" />
                <div class="text-h6">Settings for {{ activeItem?.title }} coming soon</div>
              </div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-col>
    </v-row>

    <!-- Role Dialog -->
    <v-dialog v-model="roleDialog" max-width="500">
      <v-card>
        <v-card-title>{{ editedRole.id ? 'Edit Role' : 'New Role' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedRole.name"
            label="Role Name"
            variant="outlined"
            autofocus
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeRoleDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveRole">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Permission Edit/Create Dialog (Independent) -->
    <v-dialog v-model="editPermissionDialog" max-width="500">
      <v-card>
        <v-card-title>{{
          editedPermission.id ? 'Edit Permission' : 'New Permission'
        }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedPermission.key"
            label="Key (e.g. USER_READ)"
            variant="outlined"
            class="mb-2"
          ></v-text-field>
          <v-text-field
            v-model="editedPermission.description"
            label="Description"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="editPermissionDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="savePermission">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Permissions Assignment Dialog -->
    <v-dialog v-model="permissionsDialog" max-width="800" scrollable>
      <v-card class="d-flex flex-column" style="max-height: 80vh">
        <v-card-title>Manage Permissions for {{ selectedRole?.name }}</v-card-title>

        <div class="px-4 py-2 bg-grey-lighten-4">
          <div class="d-flex align-center">
            <span class="text-caption mr-2 font-weight-bold">Quick Create & Assign:</span>
            <v-text-field
              v-model="newPermissionKey"
              label="Key"
              density="compact"
              variant="outlined"
              hide-details
              class="mr-2"
              bg-color="white"
            ></v-text-field>
            <v-text-field
              v-model="newPermissionDesc"
              label="Description"
              density="compact"
              variant="outlined"
              hide-details
              class="mr-2"
              bg-color="white"
            ></v-text-field>
            <v-btn
              color="success"
              size="small"
              @click="createNewPermission"
              :disabled="!newPermissionKey"
            >
              <template #prepend><PhPlus size="16" weight="bold" /></template>
              Create
            </v-btn>
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-text class="pa-0" style="overflow-y: auto">
          <v-list>
            <v-list-item
              v-for="perm in allPermissions"
              :key="perm.id"
              :value="perm.id"
              @click="togglePermission(perm.id)"
            >
              <template #prepend>
                <v-icon
                  :icon="hasPermission(perm.id) ? 'mdi-check-circle' : 'mdi-circle-outline'"
                  :color="hasPermission(perm.id) ? 'success' : 'grey-lighten-1'"
                  class="mr-3"
                ></v-icon>
              </template>

              <v-list-item-title
                :class="{ 'font-weight-bold text-primary': hasPermission(perm.id) }"
              >
                {{ perm.key }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ perm.description }}</v-list-item-subtitle>

              <template #append>
                <v-chip
                  v-if="hasPermission(perm.id)"
                  color="success"
                  size="small"
                  class="font-weight-bold"
                  >Assigned</v-chip
                >
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closePermissionsDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore'
import { storeToRefs } from 'pinia'
import {
  PhShieldCheck,
  PhGear,
  PhBell,
  PhPlugs,
  PhPencil,
  PhTrash,
  PhPlus,
  PhWrench,
  PhCheckCircle,
  PhCircle,
} from '@phosphor-icons/vue'

const userStore = useUserStore()
const { roles, permissions: allPermissions } = storeToRefs(userStore)

const activeTab = ref('permissions')
const permissionSubTab = ref('roles')

const settingsItems = [
  {
    title: 'Permissions',
    value: 'permissions',
    iconComp: PhShieldCheck,
    description: 'Manage user roles and access levels across the application.',
  },
]

const activeItem = computed(() => settingsItems.find((item) => item.value === activeTab.value))

// Role Management
const roleDialog = ref(false)
const editedRole = ref({ id: null as number | null, name: '' })

function openRoleDialog(role?: any) {
  if (role) {
    editedRole.value = { ...role }
  } else {
    editedRole.value = { id: null, name: '' }
  }
  roleDialog.value = true
}

function closeRoleDialog() {
  roleDialog.value = false
  editedRole.value = { id: null, name: '' }
}

async function saveRole() {
  if (editedRole.value.id) {
    await userStore.updateRole(editedRole.value.id, editedRole.value.name)
  } else {
    await userStore.createRole(editedRole.value.name)
  }
  closeRoleDialog()
}

async function confirmDeleteRole(role: any) {
  if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
    await userStore.deleteRole(role.id)
  }
}

// Permission Management (Edit/Create/Delete Specific Permissions)
const editPermissionDialog = ref(false)
const editedPermission = ref({ id: null as number | null, key: '', description: '' })

function openEditPermissionDialog(perm?: any) {
  if (perm) {
    editedPermission.value = { ...perm }
  } else {
    editedPermission.value = { id: null, key: '', description: '' }
  }
  editPermissionDialog.value = true
}

async function savePermission() {
  if (editedPermission.value.id) {
    await userStore.updatePermission(
      editedPermission.value.id,
      editedPermission.value.key,
      editedPermission.value.description,
    )
  } else {
    await userStore.createPermission(editedPermission.value.key, editedPermission.value.description)
  }
  editPermissionDialog.value = false
}

async function confirmDeletePermission(perm: any) {
  if (confirm(`Are you sure you want to delete permission "${perm.key}"?`)) {
    await userStore.deletePermission(perm.id)
  }
}

// Permission Assignment (To Roles)
const permissionsDialog = ref(false)
const selectedRole = ref<any>(null)
const newPermissionKey = ref('')
const newPermissionDesc = ref('')

async function openPermissionsDialog(role: any) {
  selectedRole.value = role
  await userStore.fetchPermissions() // Ensure we have all latest permissions
  permissionsDialog.value = true
}

function hasPermission(permId: number) {
  const role = roles.value.find((r) => r.id === selectedRole.value.id)
  if (!role || !role.permissions) return false
  return role.permissions.some((p) => p.id === permId)
}

async function togglePermission(permId: number) {
  const roleId = selectedRole.value.id
  const isAssigned = hasPermission(permId)

  if (isAssigned) {
    await userStore.removePermissionFromRole(roleId, permId)
  } else {
    await userStore.assignPermissionToRole(roleId, permId)
  }
}

function closePermissionsDialog() {
  permissionsDialog.value = false
  userStore.fetchRoles()
}

async function createNewPermission() {
  if (!newPermissionKey.value) return
  const newPerm = await userStore.createPermission(newPermissionKey.value, newPermissionDesc.value)

  // Auto-assign to the currently selected role
  if (newPerm && selectedRole.value) {
    await userStore.assignPermissionToRole(selectedRole.value.id, newPerm.id)
  }

  newPermissionKey.value = ''
  newPermissionDesc.value = ''
}

onMounted(() => {
  userStore.fetchRoles()
  userStore.fetchPermissions()
})
</script>

<style scoped>
.settings-sidebar {
  background-color: white;
  height: 100%;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}
</style>
