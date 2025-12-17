import apiClient from '../api-client';

/**
 * Service pour les paramètres et configurations
 */

// ==================== DIRECTIONS ====================

export const fetchDirections = async () => {
  try {
    const response = await apiClient.get('/settings/directions');
    return response.data || [];
  } catch (error) {
    console.error('Fetch directions error:', error);
    throw error;
  }
};

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

// ==================== POSTES ====================

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

export default {
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
};
