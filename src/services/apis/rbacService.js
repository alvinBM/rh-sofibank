import api from "../axios";

export const fetchRoles = async ({ offset = 0, limit = 100, query = "" }) => {
  const { data } = await api.get(`/rbac/roles?offset=${offset}&limit=${limit}&query=${query}`);
  if (data.status === 200) {
    return { roles: data.roles || [], total: data.total || 0 };
  }
  throw new Error(data.message || "Erreur lors de la récupération des rôles");
};

export const fetchPermissions = async ({ offset = 0, limit = 100, module = "" }) => {
  const { data } = await api.get(`/rbac/permissions?offset=${offset}&limit=${limit}&module=${module}`);
  if (data.status === 200) {
    return { permissions: data.permissions || [], total: data.total || 0 };
  }
  throw new Error(data.message || "Erreur lors de la récupération des permissions");
};

export const fetchRolePermissions = async (roleId) => {
  const { data } = await api.get(`/rbac/roles/${roleId}/permissions`);
  return data;
};

export const fetchUserRoles = async (userId) => {
  const { data } = await api.get(`/rbac/users/${userId}/roles`);
  return data;
};

export const assignRoleToUser = async (payload) => {
  const { data } = await api.post("/rbac/user-roles", payload);
  return data;
};

export const removeRoleFromUser = async (userRoleId) => {
  const { data } = await api.delete(`/rbac/user-roles/${userRoleId}`);
  return data;
};

export const createRole = async (payload) => {
  const { data } = await api.post("/rbac/roles", payload);
  return data;
};

export const updateRole = async (roleId, payload) => {
  const { data } = await api.put(`/rbac/roles/${roleId}`, payload);
  return data;
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  const { data } = await api.put(`/rbac/roles/${roleId}/permissions`, { permissionIds });
  return data;
};

export const checkUserPermission = async (permissionCode) => {
  try {
    const { data } = await api.get(`/rbac/check-permission?code=${permissionCode}`);
    return data.hasPermission || false;
  } catch (error) {
    return false;
  }
};

export const checkUserRole = async (roleCode) => {
  try {
    const { data } = await api.get(`/rbac/check-role?code=${roleCode}`);
    return data.hasRole || false;
  } catch (error) {
    return false;
  }
};
