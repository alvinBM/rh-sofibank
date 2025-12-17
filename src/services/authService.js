import apiClient from './api-client';

export const signIn = async (email, password) => {
  try {
    // Appel à l'API Express pour la connexion
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.status !== 200) {
      throw new Error(response.message || 'Email ou mot de passe incorrect');
    }

    const { token, user } = response.data;
    const { roles, permissions, employee } = user;

    // Sauvegarder le token
    apiClient.setToken(token);
    
    // Formater les données utilisateur pour correspondre au format attendu
    const formattedUser = {
      id: user.id,
      created: user.created_at || new Date().toISOString(),
      modified: user.updated_at || new Date().toISOString(),
      deleted: null,
      status: user.is_active ? 1 : 0,
      created_by: 0,
      account_id: user.account_id || null,
      firstname: employee?.first_name || '',
      lastname: employee?.last_name || '',
      username: user.email,
      phone: employee?.phone || '',
      email: user.email,
      last_activity: user.last_login || new Date().toISOString(),
      otp: null,
      country: employee?.country || 'CD',
      city: employee?.city || '',
      profile: roles && roles.length > 0 ? roles[0].code : 'EMPLOYEE',
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: roles ? roles.map(role => ({
        role_id: role.id,
        role_name: role.name,
        role_code: role.code,
        main_permissions: permissions || [],
        main_users_roles: {
          id: user.id,
          user_id: user.id,
          role_id: role.id,
        },
      })) : [],
      account: null,
      main_store: null,
      employee: employee ? {
        id: employee.id,
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name,
        profile_photo_url: employee.profile_photo_url,
      } : null,
    };

    return {
      status: 200,
      logged: true,
      token: token,
      user: formattedUser,
      session: { access_token: token, user: formattedUser },
      message: 'Utilisateur connecté avec succès',
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email, password, userData = {}) => {
  try {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstname: userData.firstname || '',
      lastname: userData.lastname || '',
      phone: userData.phone || '',
    });

    if (response.status !== 201) {
      throw new Error(response.message || 'Erreur lors de la création du compte');
    }

    return {
      status: 200,
      message: 'Compte créé avec succès',
      user: response.data.user,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Supprimer le token localement
    apiClient.removeToken();
    
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
    const token = apiClient.getToken();

    if (!token) {
      return null;
    }

    // Récupérer le profil utilisateur
    const response = await apiClient.get('/auth/profile');
    
    if (response.status !== 200) {
      apiClient.removeToken();
      return null;
    }

    const user = response.data;
    const { roles, permissions, employee } = user;
    
    // Formater les données utilisateur
    const formattedUser = {
      id: user.id,
      created: user.created_at || new Date().toISOString(),
      modified: user.updated_at || new Date().toISOString(),
      deleted: null,
      status: user.is_active ? 1 : 0,
      created_by: 0,
      account_id: user.account_id || null,
      firstname: employee?.first_name || '',
      lastname: employee?.last_name || '',
      username: user.email,
      phone: employee?.phone || '',
      email: user.email,
      last_activity: user.last_login || new Date().toISOString(),
      otp: null,
      country: employee?.country || 'CD',
      city: employee?.city || '',
      profile: roles && roles.length > 0 ? roles[0].code : 'EMPLOYEE',
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: roles ? roles.map(role => ({
        role_id: role.id,
        role_name: role.name,
        role_code: role.code,
        role_description: role.description || '',
        main_permissions: role.permissions ? role.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          code: perm.code,
          module: perm.module,
          description: perm.description || '',
        })) : [],
        main_users_roles: {
          id: user.id,
          user_id: user.id,
          role_id: role.id,
        },
      })) : [],
      account: null,
      main_store: null,
      employee: employee ? {
        id: employee.id,
        user_id: employee.user_id,
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name,
        maiden_name: employee.maiden_name,
        date_of_birth: employee.date_of_birth,
        place_of_birth: employee.place_of_birth,
        gender: employee.gender,
        nationality: employee.nationality,
        national_id: employee.national_id,
        email: employee.email,
        phone: employee.phone,
        personal_email: employee.personal_email,
        emergency_contact_name: employee.emergency_contact_name,
        emergency_contact_phone: employee.emergency_contact_phone,
        emergency_contact_relationship: employee.emergency_contact_relationship,
        address_line1: employee.address_line1,
        address_line2: employee.address_line2,
        city: employee.city,
        province: employee.province,
        postal_code: employee.postal_code,
        country: employee.country,
        marital_status: employee.marital_status,
        spouse_name: employee.spouse_name,
        number_of_children: employee.number_of_children,
        direction_id: employee.direction_id,
        service_id: employee.service_id,
        job_position_id: employee.job_position_id,
        grade_id: employee.grade_id,
        hire_date: employee.hire_date,
        contract_type: employee.contract_type,
        employment_status: employee.employment_status,
        termination_date: employee.termination_date,
        termination_reason: employee.termination_reason,
        direct_supervisor_id: employee.direct_supervisor_id,
        secondary_supervisor_id: employee.secondary_supervisor_id,
        bank_name: employee.bank_name,
        bank_account_number: employee.bank_account_number,
        bank_account_holder: employee.bank_account_holder,
        tax_id: employee.tax_id,
        social_security_number: employee.social_security_number,
        profile_photo_url: employee.profile_photo_url,
        notes: employee.notes,
        is_active: employee.is_active,
        created_at: employee.created_at,
        updated_at: employee.updated_at,
        created_by: employee.created_by,
        updated_by: employee.updated_by,
        direction: employee.direction || null,
        service: employee.service || null,
        job_position: employee.job_position || null,
        grade: employee.grade || null,
      } : null,
      permissions: permissions || [],
    };

    return {
      status: 200,
      logged: true,
      token: token,
      user: formattedUser,
      session: { access_token: token, user: formattedUser },
    };
  } catch (error) {
    console.error('Get current user error:', error);
    apiClient.removeToken();
    return null;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const response = await apiClient.put('/auth/profile', updates);

    if (response.status !== 200) {
      throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
    }

    return {
      status: 200,
      message: 'Profil mis à jour avec succès',
      data: response.data,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });

    if (response.status !== 200) {
      throw new Error(response.message || 'Erreur lors du changement de mot de passe');
    }

    return {
      status: 200,
      message: 'Mot de passe modifié avec succès',
    };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/request-password-reset', { email });

    if (response.status !== 200) {
      throw new Error(response.message || 'Erreur lors de la réinitialisation');
    }

    return {
      status: 200,
      message: 'Email de réinitialisation envoyé',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};
