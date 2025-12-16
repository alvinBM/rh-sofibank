import { supabase } from "../../lib/supabase-client";

export const fetchRoles = async ({ offset = 0, limit = 100, query = "" }) => {
  try {
    let queryBuilder = supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,code.ilike.%${query}%`);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      roles: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch roles error:', error);
    throw error;
  }
};

export const fetchPermissions = async ({ offset = 0, limit = 100, module = "" }) => {
  try {
    let queryBuilder = supabase
      .from('permissions')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('module', { ascending: true });

    if (module) {
      queryBuilder = queryBuilder.eq('module', module);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      permissions: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch permissions error:', error);
    throw error;
  }
};

export const fetchRolePermissions = async (roleId) => {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id, permissions(id, code, name, module, description)')
      .eq('role_id', roleId);

    if (error) throw error;
    return data?.map(rp => rp.permissions) || [];
  } catch (error) {
    console.error('Fetch role permissions error:', error);
    throw error;
  }
};

export const fetchUserRoles = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, role_id, roles(id, code, name, description)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch user roles error:', error);
    throw error;
  }
};

export const assignRoleToUser = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Assign role to user error:', error);
    throw error;
  }
};

export const removeRoleFromUser = async (userRoleId) => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', userRoleId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Remove role from user error:', error);
    throw error;
  }
};

export const createRole = async (payload) => {
  try {
    const hasAdmin = await checkUserRole('SUPER_ADMIN') || await checkUserRole('ADMIN');
    if (!hasAdmin) {
      throw new Error('Action non autorisée: rôle requis ADMIN/SUPER_ADMIN');
    }
    const { data, error } = await supabase
      .from('roles')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error;
  }
};

export const updateRole = async (roleId, payload) => {
  try {
    const hasAdmin = await checkUserRole('SUPER_ADMIN') || await checkUserRole('ADMIN');
    if (!hasAdmin) {
      throw new Error('Action non autorisée: rôle requis ADMIN/SUPER_ADMIN');
    }
    const { data, error } = await supabase
      .from('roles')
      .update(payload)
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (permissionIds && permissionIds.length > 0) {
      const inserts = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId,
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(inserts);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Update role permissions error:', error);
    throw error;
  }
};

export const checkUserPermission = async (permissionCode) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          role_permissions (
            permissions (code)
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    const userPermissions = data?.flatMap(ur =>
      ur.roles?.role_permissions?.map(rp => rp.permissions?.code)
    ).filter(Boolean) || [];

    return userPermissions.includes(permissionCode);
  } catch (error) {
    console.error('Check user permission error:', error);
    return false;
  }
};

export const checkUserRole = async (roleCode) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(code)')
      .eq('user_id', user.id);

    if (error) throw error;

    const userRoles = data?.map(ur => ur.roles?.code).filter(Boolean) || [];

    return userRoles.includes(roleCode);
  } catch (error) {
    console.error('Check user role error:', error);
    return false;
  }
};
