import apiClient from './api-client';

export const signIn = async (email, password) => {
  try {
    // Appel à l'API Express pour la connexion
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.status !== 200) {
      throw new Error(response.message || 'Email ou mot de passe incorrect');
    }

    const { token, user, roles, permissions } = response.data;

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
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.email,
      phone: user.phone,
      email: user.email,
      last_activity: new Date().toISOString(),
      otp: null,
      country: user.country || 'CD',
      city: user.city || '',
      profile: roles && roles.length > 0 ? roles[0].code : 'EMPLOYEE',
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: roles ? roles.map(role => ({
        role_name: role.name,
        role_code: role.code,
        main_permissions: role.permissions || [],
        main_users_roles: {
          id: user.id,
          user_id: user.id,
          role_id: role.id,
        },
      })) : [],
      account: null,
      main_store: null,
      employee: user.employee || null,
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

    const { user, roles, permissions } = response.data;
    
    // Formater les données utilisateur
    const formattedUser = {
      id: user.id,
      created: user.created_at || new Date().toISOString(),
      modified: user.updated_at || new Date().toISOString(),
      deleted: null,
      status: user.is_active ? 1 : 0,
      created_by: 0,
      account_id: user.account_id || null,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.email,
      phone: user.phone,
      email: user.email,
      last_activity: new Date().toISOString(),
      otp: null,
      country: user.country || 'CD',
      city: user.city || '',
      profile: roles && roles.length > 0 ? roles[0].code : 'EMPLOYEE',
      root_store: null,
      public_token: token,
      ip_address: null,
      main_roles: roles ? roles.map(role => ({
        role_name: role.name,
        role_code: role.code,
        main_permissions: role.permissions || [],
        main_users_roles: {
          id: user.id,
          user_id: user.id,
          role_id: role.id,
        },
      })) : [],
      account: null,
      main_store: null,
      employee: user.employee || null,
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
