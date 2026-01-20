import { defineStore } from 'pinia'
import api from '../api'

interface Permission {
  id: number
  key: string
  description: string
}

interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export const useUserStore = defineStore('user', {
  state: () => ({
    roles: [] as Role[],
    permissions: [] as Permission[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchRoles() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/roles')
        this.roles = response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch roles'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createRole(name: string) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/roles', { name })
        this.roles.push(response.data)
      } catch (err: any) {
        this.error = err.message || 'Failed to create role'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateRole(id: number, name: string) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/roles/${id}`, { name })
        const index = this.roles.findIndex((role) => role.id === id)
        if (index !== -1) {
          this.roles[index] = { ...this.roles[index], ...response.data }
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to update role'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteRole(id: number) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/roles/${id}`)
        this.roles = this.roles.filter((role) => role.id !== id)
      } catch (err: any) {
        this.error = err.message || 'Failed to delete role'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchPermissions() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/permissions')
        this.permissions = response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch permissions'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async createPermission(key: string, description: string) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/permissions', { key, description })
        this.permissions.push(response.data)
        return response.data
      } catch (err: any) {
        this.error = err.message || 'Failed to create permission'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePermission(id: number, key: string, description: string) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/permissions/${id}`, { key, description })
        const index = this.permissions.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.permissions[index] = response.data
        }
      } catch (err: any) {
        this.error = err.message || 'Failed to update permission'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deletePermission(id: number) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/permissions/${id}`)
        this.permissions = this.permissions.filter((p) => p.id !== id)
      } catch (err: any) {
        this.error = err.message || 'Failed to delete permission'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async assignPermissionToRole(roleId: number, permissionId: number) {
      try {
        await api.post('/roles/permissions', { roleId, permissionId })
        // Optimistically update or re-fetch
        await this.fetchRoles()
      } catch (err: any) {
        this.error = err.message || 'Failed to assign permission'
        console.error(err)
        throw err
      }
    },

    async removePermissionFromRole(roleId: number, permissionId: number) {
      try {
        await api.delete(`/roles/${roleId}/permissions/${permissionId}`)
        // Optimistically update or re-fetch
        await this.fetchRoles()
      } catch (err: any) {
        this.error = err.message || 'Failed to remove permission'
        console.error(err)
        throw err
      }
    },
  },
})
