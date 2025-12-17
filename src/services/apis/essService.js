import apiClient from '../api-client';

// ==================== EMPLOYEE SELF-SERVICE ====================

export const getMyProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get my profile error:', error);
    throw error;
  }
};

export const updateMyProfile = async (updates) => {
  try {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data;
  } catch (error) {
    console.error('Update my profile error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE DOCUMENTS ====================

export const getMyDocuments = async () => {
  try {
    const response = await apiClient.get('/ess/my-documents');
    return response.data || [];
  } catch (error) {
    console.error('Get my documents error:', error);
    throw error;
  }
};

export const getEmployeeDocuments = async (employeeId) => {
  try {
    const response = await apiClient.get(`/ess/employees/${employeeId}/documents`);
    return response.data || [];
  } catch (error) {
    console.error('Get employee documents error:', error);
    throw error;
  }
};

export const uploadEmployeeDocument = async (documentData) => {
  try {
    const response = await apiClient.post('/ess/documents', documentData);
    return response.data;
  } catch (error) {
    console.error('Upload employee document error:', error);
    throw error;
  }
};

export const deleteEmployeeDocument = async (id) => {
  try {
    const response = await apiClient.delete(`/ess/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete employee document error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE CONTRACTS ====================

export const getMyContracts = async () => {
  try {
    const response = await apiClient.get('/ess/my-contracts');
    return response.data || [];
  } catch (error) {
    console.error('Get my contracts error:', error);
    throw error;
  }
};

export const getEmployeeContracts = async (employeeId) => {
  try {
    const response = await apiClient.get(`/ess/employees/${employeeId}/contracts`);
    return response.data || [];
  } catch (error) {
    console.error('Get employee contracts error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE REQUESTS ====================

export const getMyRequests = async () => {
  try {
    const response = await apiClient.get('/ess/my-requests');
    return response.data || [];
  } catch (error) {
    console.error('Get my requests error:', error);
    throw error;
  }
};

export const getEmployeeRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);

    const response = await apiClient.get(`/ess/requests?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Get employee requests error:', error);
    throw error;
  }
};

export const createEmployeeRequest = async (requestData) => {
  try {
    const response = await apiClient.post('/ess/requests', requestData);
    return response.data;
  } catch (error) {
    console.error('Create employee request error:', error);
    throw error;
  }
};

export const updateEmployeeRequest = async (id, updates) => {
  try {
    const response = await apiClient.put(`/ess/requests/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update employee request error:', error);
    throw error;
  }
};

export const getRequestTypes = async () => {
  try {
    const response = await apiClient.get('/ess/request-types');
    return response.data || [];
  } catch (error) {
    console.error('Get request types error:', error);
    throw error;
  }
};

// ==================== INTERNAL ANNOUNCEMENTS ====================

export const getInternalAnnouncements = async () => {
  try {
    const response = await apiClient.get('/ess/announcements');
    return response.data || [];
  } catch (error) {
    console.error('Get internal announcements error:', error);
    throw error;
  }
};

export const getAllAnnouncements = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.is_published !== undefined) params.append('is_published', filters.is_published);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`/ess/announcements/all?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Get all announcements error:', error);
    throw error;
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const response = await apiClient.post('/ess/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Create announcement error:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id, updates) => {
  try {
    const response = await apiClient.put(`/ess/announcements/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update announcement error:', error);
    throw error;
  }
};

export const markAnnouncementAsRead = async (announcementId) => {
  try {
    const response = await apiClient.post(`/ess/announcements/${announcementId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark announcement as read error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE FEEDBACK ====================

export const getMyFeedback = async () => {
  try {
    const response = await apiClient.get('/ess/my-feedback');
    return response.data || [];
  } catch (error) {
    console.error('Get my feedback error:', error);
    throw error;
  }
};

export const getAllFeedback = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`/ess/feedback?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Get all feedback error:', error);
    throw error;
  }
};

export const createFeedback = async (feedbackData) => {
  try {
    const response = await apiClient.post('/ess/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Create feedback error:', error);
    throw error;
  }
};

export const updateFeedback = async (id, updates) => {
  try {
    const response = await apiClient.put(`/ess/feedback/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update feedback error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE HISTORY ====================

export const getEmployeeHistory = async (employeeId) => {
  try {
    const response = await apiClient.get(`/ess/employees/${employeeId}/history`);
    return response.data || [];
  } catch (error) {
    console.error('Get employee history error:', error);
    throw error;
  }
};

export const createEmployeeHistory = async (historyData) => {
  try {
    const response = await apiClient.post('/ess/history', historyData);
    return response.data;
  } catch (error) {
    console.error('Create employee history error:', error);
    throw error;
  }
};

// ==================== EMPLOYEE DEPENDENTS ====================

export const getEmployeeDependents = async (employeeId) => {
  try {
    const response = await apiClient.get(`/ess/employees/${employeeId}/dependents`);
    return response.data || [];
  } catch (error) {
    console.error('Get employee dependents error:', error);
    throw error;
  }
};

export const createEmployeeDependent = async (dependentData) => {
  try {
    const response = await apiClient.post('/ess/dependents', dependentData);
    return response.data;
  } catch (error) {
    console.error('Create employee dependent error:', error);
    throw error;
  }
};

export const updateEmployeeDependent = async (id, updates) => {
  try {
    const response = await apiClient.put(`/ess/dependents/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update employee dependent error:', error);
    throw error;
  }
};

export const deleteEmployeeDependent = async (id) => {
  try {
    const response = await apiClient.delete(`/ess/dependents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete employee dependent error:', error);
    throw error;
  }
};
