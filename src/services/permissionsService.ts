import api from '../api'

export interface Permission {
  id: number
  key: string
  description: string
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface Staff {
  id: number
  staff_id: string
  first_name: string
  last_name: string
  roles: Role[]
}

export default {
  // Get all staff with their roles
  async getAllStaff(): Promise<Staff[]> {
    const response = await api.get('/staff')
    return response.data
  },

  // Get all available roles
  async getAllRoles(): Promise<Role[]> {
    const response = await api.get('/roles')
    return response.data
  },

  // Assign a role to a staff member
  async assignRoleToStaff(staffId: number, roleId: number, scopeType = 'system', scopeId = null) {
    return api.post(`/staff/${staffId}/roles`, {
      roleId,
      scope_type: scopeType,
      scope_id: scopeId,
    })
  },

  // Remove a role from a staff member
  async removeRoleFromStaff(staffId: number, roleId: number) {
    return api.delete(`/staff/${staffId}/roles/${roleId}`)
  },
}
