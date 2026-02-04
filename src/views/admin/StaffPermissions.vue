<template>
  <div class="pa-4">
    <h1 class="text-h4 mb-4">Staff Permissions Management</h1>

    <v-card class="mb-4">
      <v-card-text>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search Staff"
          single-line
          hide-details
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="staffList"
      :search="search"
      class="elevation-1"
      :loading="loading"
    >
      <!-- Roles Column -->
      <template v-slot:item.roles="{ item }">
        <v-chip-group>
          <v-chip
            v-for="role in item.roles"
            :key="role.id"
            color="primary"
            variant="flat"
            size="small"
            closable
            @click:close="removeRole(item, role)"
          >
            {{ role.name }}
          </v-chip>
          <v-chip
            variant="outlined"
            size="small"
            color="grey"
            prepend-icon="mdi-plus"
            @click="openAddRoleDialog(item)"
          >
            Add Role
          </v-chip>
        </v-chip-group>
      </template>

      <!-- Permissions (Effective) Column - Read Only -->
      <template v-slot:item.effective_permissions="{ item }">
        <div v-if="getEffectivePermissions(item).length > 0">
          <v-tooltip
            location="top"
            v-for="perm in getEffectivePermissions(item).slice(0, 3)"
            :key="perm"
          >
            <template v-slot:activator="{ props }">
              <v-chip size="x-small" class="mr-1" v-bind="props">{{ perm }}</v-chip>
            </template>
            <span>{{ perm }}</span>
          </v-tooltip>
          <span v-if="getEffectivePermissions(item).length > 3" class="text-caption text-grey">
            +{{ getEffectivePermissions(item).length - 3 }} more
          </span>
        </div>
        <span v-else class="text-caption text-grey">No Permissions</span>
      </template>
    </v-data-table>

    <!-- Add Role Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title
          >Assign Role to {{ selectedStaff?.first_name }}
          {{ selectedStaff?.last_name }}</v-card-title
        >
        <v-card-text>
          <v-select
            v-model="selectedRoleToAdd"
            :items="availableRoles"
            item-title="name"
            item-value="id"
            label="Select Role"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmAddRole"
            :disabled="!selectedRoleToAdd"
            >Assign</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import permissionsService, { type Staff, type Role } from '@/services/permissionsService'

const staffList = ref<Staff[]>([])
const allRoles = ref<Role[]>([])
const loading = ref(false)
const search = ref('')

const dialog = ref(false)
const selectedStaff = ref<Staff | null>(null)
const selectedRoleToAdd = ref<number | null>(null)

const headers = [
  { title: 'Last Name', key: 'last_name', sortable: true },
  { title: 'First Name', key: 'first_name', sortable: true },
  { title: 'Staff ID', key: 'staff_id', sortable: true },
  { title: 'Assigned Roles', key: 'roles', sortable: false },
  { title: 'Effective Permissions', key: 'effective_permissions', sortable: false },
]

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [staffData, rolesData] = await Promise.all([
      permissionsService.getAllStaff(),
      permissionsService.getAllRoles(),
    ])
    staffList.value = staffData
    allRoles.value = rolesData
  } catch (error) {
    console.error('Failed to load data', error)
  } finally {
    loading.value = false
  }
}

const availableRoles = computed(() => {
  if (!selectedStaff.value) return []
  // Filter out roles already assigned
  const assignedRoleIds = new Set(selectedStaff.value.roles.map((r) => r.id))
  return allRoles.value.filter((r) => !assignedRoleIds.has(r.id))
})

const getEffectivePermissions = (staff: Staff) => {
  const perms = new Set<string>()
  staff.roles.forEach((role) => {
    role.permissions.forEach((p) => perms.add(p.key))
  })
  return Array.from(perms).sort()
}

const openAddRoleDialog = (staff: Staff) => {
  selectedStaff.value = staff
  selectedRoleToAdd.value = null
  dialog.value = true
}

const confirmAddRole = async () => {
  if (!selectedStaff.value || !selectedRoleToAdd.value) return

  try {
    await permissionsService.assignRoleToStaff(selectedStaff.value.id, selectedRoleToAdd.value)
    // Refresh data to show update
    await loadData()
    dialog.value = false
  } catch (error) {
    console.error('Failed to assign role', error)
    alert('Failed to assign role')
  }
}

const removeRole = async (staff: Staff, role: Role) => {
  if (!confirm(`Are you sure you want to remove role "${role.name}" from ${staff.first_name}?`))
    return

  try {
    await permissionsService.removeRoleFromStaff(staff.id, role.id)
    await loadData()
  } catch (error) {
    console.error('Failed to remove role', error)
    alert('Failed to remove role')
  }
}
</script>
