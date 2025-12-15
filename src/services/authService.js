import { supabase } from '../lib/supabase-client';

export const signIn = async (email, password) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    const session = authData.session;
    const authUser = authData.user;

    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        account:accounts(*),
        main_store:stores(*)
      `)
      .eq('user_id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile error:', profileError);
    }

    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(
          id,
          name,
          code,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .eq('user_id', authUser.id);

    if (rolesError) {
      console.error('Roles error:', rolesError);
    }

    const mainRoles = (userRoles || []).map(ur => ({
      role_name: ur.role?.name || 'Unknown',
      role_code: ur.role?.code || '',
      main_permissions: ur.role?.permissions?.map(rp => rp.permission) || [],
      main_users_roles: {
        id: ur.id,
        user_id: authUser.id,
        role_id: ur.role_id,
      },
    }));

    const user = {
      id: userProfile?.id || authUser.id,
      created: authUser.created_at,
      modified: authUser.updated_at || authUser.created_at,
      deleted: null,
      status: userProfile?.status || 1,
      created_by: 0,
      account_id: userProfile?.account_id,
      firstname: userProfile?.firstname || authUser.user_metadata?.firstname || '',
      lastname: userProfile?.lastname || authUser.user_metadata?.lastname || '',
      username: userProfile?.username,
      phone: userProfile?.phone || authUser.phone || '',
      email: authUser.email,
      last_activity: userProfile?.last_activity || new Date().toISOString(),
      otp: userProfile?.otp,
      country: userProfile?.country || 'CD',
      city: userProfile?.city || '',
      profile: userProfile?.profile,
      root_store: userProfile?.root_store,
      public_token: userProfile?.public_token,
      ip_address: userProfile?.ip_address,
      main_roles: mainRoles,
      account: userProfile?.account || null,
      main_store: userProfile?.main_store || null,
    };

    return {
      status: 200,
      logged: true,
      token: session.access_token,
      user,
      session,
      message: 'Utilisateur connecté avec succès',
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          phone: userData.phone || '',
        },
      },
    });

    if (error) throw error;

    return {
      status: 200,
      message: 'Compte créé avec succès',
      user: data.user,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return {
      status: 200,
      message: 'Déconnexion réussie',
    };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const authUser = session.user;

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        account:accounts(*),
        main_store:stores(*)
      `)
      .eq('user_id', authUser.id)
      .single();

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles(
          id,
          name,
          code,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .eq('user_id', authUser.id);

    const mainRoles = (userRoles || []).map(ur => ({
      role_name: ur.role?.name || 'Unknown',
      role_code: ur.role?.code || '',
      main_permissions: ur.role?.permissions?.map(rp => rp.permission) || [],
      main_users_roles: {
        id: ur.id,
        user_id: authUser.id,
        role_id: ur.role_id,
      },
    }));

    const user = {
      id: userProfile?.id || authUser.id,
      created: authUser.created_at,
      modified: authUser.updated_at || authUser.created_at,
      deleted: null,
      status: userProfile?.status || 1,
      created_by: 0,
      account_id: userProfile?.account_id,
      firstname: userProfile?.firstname || authUser.user_metadata?.firstname || '',
      lastname: userProfile?.lastname || authUser.user_metadata?.lastname || '',
      username: userProfile?.username,
      phone: userProfile?.phone || authUser.phone || '',
      email: authUser.email,
      last_activity: userProfile?.last_activity || new Date().toISOString(),
      otp: userProfile?.otp,
      country: userProfile?.country || 'CD',
      city: userProfile?.city || '',
      profile: userProfile?.profile,
      root_store: userProfile?.root_store,
      public_token: userProfile?.public_token,
      ip_address: userProfile?.ip_address,
      main_roles: mainRoles,
      account: userProfile?.account || null,
      main_store: userProfile?.main_store || null,
    };

    return {
      status: 200,
      logged: true,
      token: session.access_token,
      user,
      session,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      status: 200,
      message: 'Profil mis à jour avec succès',
      data,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return {
      status: 200,
      message: 'Email de réinitialisation envoyé',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};
