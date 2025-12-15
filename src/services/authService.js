import { supabase } from '../lib/supabase-client';

export const signIn = async (email, password) => {
  try {
    const { data: authResult, error: authError } = await supabase
      .rpc('authenticate_user', {
        user_email: email,
        user_password: password
      });

    if (authError) {
      throw new Error(authError.message || 'Email ou mot de passe incorrect');
    }

    if (!authResult || authResult.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const authenticatedUser = authResult[0];

    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', authenticatedUser.account_id)
      .maybeSingle();

    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', authenticatedUser.email)
      .maybeSingle();

    const token = btoa(JSON.stringify({
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      timestamp: Date.now()
    }));

    const user = {
      id: authenticatedUser.id,
      created: authenticatedUser.created_at || new Date().toISOString(),
      modified: authenticatedUser.updated_at || new Date().toISOString(),
      deleted: null,
      status: authenticatedUser.is_active ? 1 : 0,
      created_by: 0,
      account_id: authenticatedUser.account_id,
      firstname: authenticatedUser.firstname,
      lastname: authenticatedUser.lastname,
      username: authenticatedUser.email,
      phone: authenticatedUser.phone,
      email: authenticatedUser.email,
      last_activity: new Date().toISOString(),
      otp: null,
      country: account?.country || 'FR',
      city: account?.city || '',
      profile: authenticatedUser.role,
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: [{
        role_name: getRoleName(authenticatedUser.role),
        role_code: authenticatedUser.role,
        main_permissions: getPermissionsForRole(authenticatedUser.role),
        main_users_roles: {
          id: authenticatedUser.id,
          user_id: authenticatedUser.id,
          role_id: authenticatedUser.role,
        },
      }],
      account: account || null,
      main_store: null,
      employee: employee || null,
    };

    return {
      status: 200,
      logged: true,
      token: token,
      user,
      session: { access_token: token, user: authenticatedUser },
      message: 'Utilisateur connecté avec succès',
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

function getRoleName(roleCode) {
  const roleNames = {
    'RH': 'Administrateur RH',
    'MANAGER': 'Manager/Responsable',
    'EMPLOYEE': 'Employé',
    'ADMIN': 'Administrateur',
    'SUPER_ADMIN': 'Super Administrateur',
    'FINANCE': 'Finance/Paie',
    'RECRUITER': 'Recruteur',
    'DG': 'Direction Générale',
  };
  return roleNames[roleCode] || 'Utilisateur';
}

function getPermissionsForRole(roleCode) {
  const basePermissions = [
    { code: 'view_dashboard', name: 'Voir le tableau de bord' },
    { code: 'view_profile', name: 'Voir son profil' },
  ];

  const rolePermissions = {
    'RH': [
      ...basePermissions,
      { code: 'manage_employees', name: 'Gérer les employés' },
      { code: 'manage_leave', name: 'Gérer les congés' },
      { code: 'manage_attendance', name: 'Gérer les présences' },
      { code: 'manage_payroll', name: 'Gérer la paie' },
      { code: 'manage_recruitment', name: 'Gérer le recrutement' },
      { code: 'manage_performance', name: 'Gérer les évaluations' },
      { code: 'view_reports', name: 'Voir les rapports' },
    ],
    'MANAGER': [
      ...basePermissions,
      { code: 'view_team', name: 'Voir son équipe' },
      { code: 'approve_leave', name: 'Approuver les congés' },
      { code: 'view_team_attendance', name: 'Voir les présences de l\'équipe' },
      { code: 'conduct_evaluations', name: 'Conduire les évaluations' },
    ],
    'EMPLOYEE': [
      ...basePermissions,
      { code: 'request_leave', name: 'Demander des congés' },
      { code: 'view_payslips', name: 'Voir ses bulletins de paie' },
      { code: 'view_attendance', name: 'Voir ses présences' },
    ],
    'ADMIN': [
      ...basePermissions,
      { code: 'manage_system', name: 'Gérer le système' },
      { code: 'manage_users', name: 'Gérer les utilisateurs' },
      { code: 'manage_roles', name: 'Gérer les rôles' },
    ],
  };

  return rolePermissions[roleCode] || basePermissions;
}

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      return null;
    }

    let decodedToken;
    try {
      decodedToken = JSON.parse(atob(token));
    } catch (e) {
      console.error('Invalid token format:', e);
      return null;
    }

    const { data: authenticatedUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decodedToken.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !authenticatedUser) {
      return null;
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', authenticatedUser.account_id)
      .maybeSingle();

    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('email', authenticatedUser.email)
      .maybeSingle();

    const user = {
      id: authenticatedUser.id,
      created: authenticatedUser.created_at || new Date().toISOString(),
      modified: authenticatedUser.updated_at || new Date().toISOString(),
      deleted: null,
      status: authenticatedUser.is_active ? 1 : 0,
      created_by: 0,
      account_id: authenticatedUser.account_id,
      firstname: authenticatedUser.firstname,
      lastname: authenticatedUser.lastname,
      username: authenticatedUser.email,
      phone: authenticatedUser.phone,
      email: authenticatedUser.email,
      last_activity: new Date().toISOString(),
      otp: null,
      country: account?.country || 'FR',
      city: account?.city || '',
      profile: authenticatedUser.role,
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: [{
        role_name: getRoleName(authenticatedUser.role),
        role_code: authenticatedUser.role,
        main_permissions: getPermissionsForRole(authenticatedUser.role),
        main_users_roles: {
          id: authenticatedUser.id,
          user_id: authenticatedUser.id,
          role_id: authenticatedUser.role,
        },
      }],
      account: account || null,
      main_store: null,
      employee: employee || null,
    };

    return {
      status: 200,
      logged: true,
      token: token,
      user,
      session: { access_token: token, user: authenticatedUser },
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
