import apiClient from '../api-client';

/**
 * Service pour la gestion RBAC (Roles & Permissions)
 */

// ==================== ROLES ====================

export const fetchRoles = async () => {
  try {
    const response = await apiClient.get('/rbac/roles');
    return response.data || [];
  } catch (error) {
    console.error('Fetch roles error:', error);
    throw error;
  }
};

export const fetchRoleById = async (id) => {
  try {
    const response = await apiClient.get(`/rbac/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch role error:', error);
    throw error;
  }
};

export const createRole = async (payload) => {
  try {
    const response = await apiClient.post('/rbac/roles', payload);
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error;
  }
};

export const updateRole = async (id, payload) => {
  try {
    const response = await apiClient.put(`/rbac/roles/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/rbac/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error;
  }
};

// ==================== PERMISSIONS ====================

export const fetchPermissions = async () => {
  try {
    const response = await apiClient.get('/rbac/permissions');
    return response.data || [];
  } catch (error) {
    console.error('Fetch permissions error:', error);
    throw error;
  }
};

export const assignPermissionsToRole = async (roleId, permissionIds) => {
  try {
    const response = await apiClient.post(`/rbac/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  } catch (error) {
    console.error('Assign permissions to role error:', error);
    throw error;
  }
};

// ==================== USERS & ROLES ====================

export const assignRolesToUser = async (userId, roleIds) => {
  try {
    const response = await apiClient.post(`/rbac/users/${userId}/roles`, {
      role_ids: roleIds,
    });
    return response.data;
  } catch (error) {
    console.error('Assign roles to user error:', error);
    throw error;
  }
};

export const fetchUserRoles = async (userId) => {
  try {
    const response = await apiClient.get(`/rbac/users/${userId}/roles`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch user roles error:', error);
    throw error;
  }
};

export const fetchUserPermissions = async (userId) => {
  try {
    const response = await apiClient.get(`/rbac/users/${userId}/permissions`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch user permissions error:', error);
    throw error;
  }
};

export default {
  fetchRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  assignPermissionsToRole,
  assignRolesToUser,
  fetchUserRoles,
  fetchUserPermissions,
};
