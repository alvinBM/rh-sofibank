import apiClient from '../api-client';

/**
 * Service pour les paramètres et configurations
 */

// ==================== USERS ====================

export const fetchUsers = async ({ offset = 0, limit = 10, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/users', { offset, limit, query });
    return response;
  } catch (error) {
    console.error('Fetch users error:', error);
    throw error;
  }
};

export const createUser = async (payload) => {
  try {
    const response = await apiClient.post('/settings/users', payload);
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const updateUser = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/users/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

export const toggleUserStatus = async (id, isActive) => {
  try {
    const response = await apiClient.patch(`/settings/users/${id}/toggle-status`, { is_active: isActive });
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    throw error;
  }
};

// ==================== ROLES & PERMISSIONS ====================

export const fetchDirections = async ({ offset = 0, limit = 100, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/directions', { offset, limit, query });
    return response.data || [];
  } catch (error) {
    console.error('Fetch directions error:', error);
    throw error;
  }
};

// ==================== DEPARTMENTS ====================

export const fetchDepartments = async ({ offset = 0, limit = 100, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/departments', { offset, limit, query });
    return response.data || [];
  } catch (error) {
    console.error('Fetch departments error:', error);
    throw error;
  }
};

export const createDepartment = async (payload) => {
  try {
    const response = await apiClient.post('/settings/departments', payload);
    return response.data;
  } catch (error) {
    console.error('Create department error:', error);
    throw error;
  }
};

export const updateDepartment = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/departments/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update department error:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete department error:', error);
    throw error;
  }
};

export const createRole = async (payload) => {
  try {
    const response = await apiClient.post('/settings/roles', payload);
    return response.data;
  } catch (error) {
    console.error('Create role error:', error);
    throw error;
  }
};

export const updateRole = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/roles/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete role error:', error);
    throw error;
  }
};

export const fetchPermissions = async () => {
  try {
    const response = await apiClient.get('/settings/permissions');
    return response.data || [];
  } catch (error) {
    console.error('Fetch permissions error:', error);
    throw error;
  }
};

// ==================== DIRECTIONS ====================

export const createDirection = async (payload) => {
  try {
    const response = await apiClient.post('/settings/directions', payload);
    return response.data;
  } catch (error) {
    console.error('Create direction error:', error);
    throw error;
  }
};

export const updateDirection = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/directions/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update direction error:', error);
    throw error;
  }
};

export const deleteDirection = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/directions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete direction error:', error);
    throw error;
  }
};

// ==================== SERVICES ====================

export const fetchServices = async (directionId = null) => {
  try {
    const params = directionId ? { direction_id: directionId } : {};
    const response = await apiClient.get('/settings/services', params);
    return response.data || [];
  } catch (error) {
    console.error('Fetch services error:', error);
    throw error;
  }
};

export const createService = async (payload) => {
  try {
    const response = await apiClient.post('/settings/services', payload);
    return response.data;
  } catch (error) {
    console.error('Create service error:', error);
    throw error;
  }
};

export const updateService = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/services/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update service error:', error);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/services/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete service error:', error);
    throw error;
  }
};

// ==================== GRADES ====================

export const fetchGrades = async () => {
  try {
    const response = await apiClient.get('/settings/grades');
    return response.data || [];
  } catch (error) {
    console.error('Fetch grades error:', error);
    throw error;
  }
};

export const createGrade = async (payload) => {
  try {
    const response = await apiClient.post('/settings/grades', payload);
    return response.data;
  } catch (error) {
    console.error('Create grade error:', error);
    throw error;
  }
};

export const updateGrade = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/grades/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update grade error:', error);
    throw error;
  }
};

export const deleteGrade = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/grades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete grade error:', error);
    throw error;
  }
};

// ==================== JOB POSITIONS ====================

export const fetchJobPositions = async () => {
  try {
    const response = await apiClient.get('/settings/job-positions');
    return response.data || [];
  } catch (error) {
    console.error('Fetch job positions error:', error);
    throw error;
  }
};

export const createJobPosition = async (payload) => {
  try {
    const response = await apiClient.post('/settings/job-positions', payload);
    return response.data;
  } catch (error) {
    console.error('Create job position error:', error);
    throw error;
  }
};

export const updateJobPosition = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/job-positions/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update job position error:', error);
    throw error;
  }
};

export const deleteJobPosition = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/job-positions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete job position error:', error);
    throw error;
  }
};

// ==================== HOLIDAYS ====================

export const fetchHolidays = async ({ offset = 0, limit = 100, query = '', year = null } = {}) => {
  try {
    const params = { offset, limit, query };
    if (year) params.year = year;
    const response = await apiClient.get('/settings/holidays', params);
    return response;
  } catch (error) {
    console.error('Fetch holidays error:', error);
    throw error;
  }
};

export const createHoliday = async (payload) => {
  try {
    const response = await apiClient.post('/settings/holidays', payload);
    return response.data;
  } catch (error) {
    console.error('Create holiday error:', error);
    throw error;
  }
};

export const updateHoliday = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/holidays/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update holiday error:', error);
    throw error;
  }
};

export const deleteHoliday = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/holidays/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete holiday error:', error);
    throw error;
  }
};

// ==================== BIOMETRIC DEVICES ====================

export const fetchBiometricTerminals = async ({ offset = 0, limit = 100, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/biometric-devices', { offset, limit, query });
    return response;
  } catch (error) {
    console.error('Fetch biometric terminals error:', error);
    throw error;
  }
};

export const createBiometricTerminal = async (payload) => {
  try {
    const response = await apiClient.post('/settings/biometric-devices', payload);
    return response.data;
  } catch (error) {
    console.error('Create biometric terminal error:', error);
    throw error;
  }
};

export const updateBiometricTerminal = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/biometric-devices/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update biometric terminal error:', error);
    throw error;
  }
};

export const deleteBiometricTerminal = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/biometric-devices/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete biometric terminal error:', error);
    throw error;
  }
};

export const testBiometricConnection = async (id) => {
  try {
    const response = await apiClient.post(`/settings/biometric-devices/${id}/test`);
    return response.data;
  } catch (error) {
    console.error('Test biometric connection error:', error);
    throw error;
  }
};

// ==================== SYSTEM PARAMETERS ====================

export const fetchSystemParameters = async ({ offset = 0, limit = 100, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/system-parameters', { offset, limit, query });
    return response;
  } catch (error) {
    console.error('Fetch system parameters error:', error);
    throw error;
  }
};

export const createSystemParameter = async (payload) => {
  try {
    const response = await apiClient.post('/settings/system-parameters', payload);
    return response.data;
  } catch (error) {
    console.error('Create system parameter error:', error);
    throw error;
  }
};

export const updateSystemParameter = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/system-parameters/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update system parameter error:', error);
    throw error;
  }
};

export const deleteSystemParameter = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/system-parameters/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete system parameter error:', error);
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    const response = await apiClient.get('/settings/roles');
    return response || [];
  } catch (error) {
    console.error('Fetch roles error:', error);
    throw error;
  }
};

export default {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  fetchDirections,
  createDirection,
  updateDirection,
  deleteDirection,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  fetchJobPositions,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  fetchBiometricTerminals,
  createBiometricTerminal,
  updateBiometricTerminal,
  deleteBiometricTerminal,
  testBiometricConnection,
  fetchSystemParameters,
  createSystemParameter,
  updateSystemParameter,
  deleteSystemParameter,
};

