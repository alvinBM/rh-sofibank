import apiClient from '../api-client';

/**
 * Service pour la gestion des congés
 */

// ==================== TYPES DE CONGÉS ====================

export const fetchLeaveTypes = async () => {
  try {
    const response = await apiClient.get('/leave/types');
    return response.data || [];
  } catch (error) {
    console.error('Fetch leave types error:', error);
    throw error;
  }
};

export const createLeaveType = async (payload) => {
  try {
    const response = await apiClient.post('/leave/types', payload);
    return response.data;
  } catch (error) {
    console.error('Create leave type error:', error);
    throw error;
  }
};

// ==================== DEMANDES DE CONGÉS ====================

export const fetchLeaveRequests = async ({ offset = 0, limit = 10, filters = {} }) => {
  try {
    const page = Math.floor(offset / limit) + 1;
    
    const params = {
      page,
      limit,
      ...filters,
    };

    const response = await apiClient.get('/leave/requests', params);
    
    return {
      requests: response.data.requests || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('Fetch leave requests error:', error);
    throw error;
  }
};

export const fetchLeaveRequestById = async (id) => {
  try {
    const response = await apiClient.get(`/leave/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch leave request error:', error);
    throw error;
  }
};

export const createLeaveRequest = async (payload) => {
  try {
    const response = await apiClient.post('/leave/requests', payload);
    return response.data;
  } catch (error) {
    console.error('Create leave request error:', error);
    throw error;
  }
};

export const submitLeaveRequest = async (requestId) => {
  try {
    const response = await apiClient.post(`/leave/requests/${requestId}/submit`);
    return response.data;
  } catch (error) {
    console.error('Submit leave request error:', error);
    throw error;
  }
};

export const approveLeaveRequest = async (requestId, comments = '') => {
  try {
    const response = await apiClient.post(`/leave/requests/${requestId}/process`, {
      action: 'approve',
      comments,
    });
    return response.data;
  } catch (error) {
    console.error('Approve leave request error:', error);
    throw error;
  }
};

export const rejectLeaveRequest = async (requestId, comments = '') => {
  try {
    const response = await apiClient.post(`/leave/requests/${requestId}/process`, {
      action: 'reject',
      comments,
    });
    return response.data;
  } catch (error) {
    console.error('Reject leave request error:', error);
    throw error;
  }
};

export const cancelLeaveRequest = async (requestId) => {
  try {
    const response = await apiClient.post(`/leave/requests/${requestId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Cancel leave request error:', error);
    throw error;
  }
};

// ==================== SOLDE DE CONGÉS ====================

export const fetchEmployeeLeaveBalance = async (employeeId) => {
  try {
    const response = await apiClient.get(`/leave/balance/${employeeId}`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee leave balance error:', error);
    throw error;
  }
};

export const initializeLeaveBalances = async (employeeId, year) => {
  try {
    const response = await apiClient.post('/leave/balance/initialize', {
      employee_id: employeeId,
      year,
    });
    return response.data;
  } catch (error) {
    console.error('Initialize leave balances error:', error);
    throw error;
  }
};

export default {
  fetchLeaveTypes,
  createLeaveType,
  fetchLeaveRequests,
  fetchLeaveRequestById,
  createLeaveRequest,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  fetchEmployeeLeaveBalance,
  initializeLeaveBalances,
};
