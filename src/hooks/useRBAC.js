import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchRoles,
  fetchPermissions,
  fetchRolePermissions,
  fetchUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  createRole,
  updateRole,
  updateRolePermissions,
  checkUserPermission,
  checkUserRole,
} from "../services/apis/rbacService";
import queryClient from "../lib/react-query-client";

export const useGetRoles = ({ page = 1, rowsPerPage = 10, query = "" }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["roles", { page, rowsPerPage, query }],
    queryFn: () => fetchRoles({ offset, limit: rowsPerPage, query }),
    keepPreviousData: true,
  });
};

export const useGetPermissions = ({ page = 1, rowsPerPage = 100, module = "" }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["permissions", { page, rowsPerPage, module }],
    queryFn: () => fetchPermissions({ offset, limit: rowsPerPage, module }),
    keepPreviousData: true,
  });
};

export const useGetRolePermissions = (roleId) => {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => fetchRolePermissions(roleId),
    enabled: !!roleId,
  });
};

export const useGetUserRoles = (userId) => {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: () => fetchUserRoles(userId),
    enabled: !!userId,
  });
};

export const useCreateRole = () => {
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: ({ roleId, payload }) => updateRole(roleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRolePermissions = () => {
  return useMutation({
    mutationFn: ({ roleId, permissionIds }) => updateRolePermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions", variables.roleId] });
    },
  });
};

export const useAssignRoleToUser = () => {
  return useMutation({
    mutationFn: assignRoleToUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", variables.userId] });
    },
  });
};

export const useRemoveRoleFromUser = () => {
  return useMutation({
    mutationFn: removeRoleFromUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
    },
  });
};

export const useCheckPermission = (permissionCode) => {
  return useQuery({
    queryKey: ["check-permission", permissionCode],
    queryFn: () => checkUserPermission(permissionCode),
    enabled: !!permissionCode,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCheckRole = (roleCode) => {
  return useQuery({
    queryKey: ["check-role", roleCode],
    queryFn: () => checkUserRole(roleCode),
    enabled: !!roleCode,
    staleTime: 5 * 60 * 1000,
  });
};

export const hasPermission = (permissions, requiredPermissions) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  return requiredPermissions.some((permission) =>
    permissions.some((p) => p.code === permission)
  );
};

export const hasRole = (roles, requiredRoles) => {
  if (!roles || !Array.isArray(roles)) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;

  return requiredRoles.some((role) =>
    roles.some((r) => r.code === role)
  );
};
