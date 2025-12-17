import apiClient from '../api-client';

export const fetchEmployees = async ({ offset = 0, limit = 10, query, filters = {} }) => {
  try {
    const page = Math.floor(offset / limit) + 1;
    
    const params = {
      page,
      limit,
      ...filters,
    };

    if (query) {
      params.search = query;
    }

    const response = await apiClient.get('/employees', params);
    
    return {
      employees: response.data.employees || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('Fetch employees error:', error);
    throw error;
  }
};

export const fetchEmployeeById = async (id) => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch employee by id error:', error);
    throw error;
  }
};

export const fetchEmployeeByUserId = async (userId) => {
  try {
    // Utiliser un filtre pour chercher par user_id
    const response = await apiClient.get('/employees', { user_id: userId });
    return response.data.employees && response.data.employees.length > 0 
      ? response.data.employees[0] 
      : null;
  } catch (error) {
    console.error('Fetch employee by user id error:', error);
    throw error;
  }
};

export const createEmployee = async (payload) => {
  try {
    const response = await apiClient.post('/employees', payload);
    return response.data;
  } catch (error) {
    console.error('Create employee error:', error);
    throw error;
  }
};

export const updateEmployee = async (id, payload) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update employee error:', error);
    throw error;
  }
};

export const updateEmployeeStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, { 
      employment_status: status 
    });
    return response.data;
  } catch (error) {
    console.error('Update employee status error:', error);
    throw error;
  }
};

export const terminateEmployee = async (id, terminationData) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, {
      employment_status: 'terminated',
      termination_date: terminationData.termination_date,
      termination_reason: terminationData.termination_reason,
    });
    return response.data;
  } catch (error) {
    console.error('Terminate employee error:', error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete employee error:', error);
    throw error;
  }
};

export const fetchEmployeeStatistics = async () => {
  try {
    const response = await apiClient.get('/employees/statistics');
    return response.data;
  } catch (error) {
    console.error('Fetch employee statistics error:', error);
    throw error;
  }
};

export const fetchSubordinates = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/subordinates`);
    return response.data;
  } catch (error) {
    console.error('Fetch subordinates error:', error);
    throw error;
  }
};

// Fonctions pour les dépendants (à implémenter côté API si nécessaire)
export const fetchEmployeeDependents = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/dependents`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee dependents error:', error);
    return [];
  }
};

export const createEmployeeDependent = async (employeeId, payload) => {
  try {
    const response = await apiClient.post(`/employees/${employeeId}/dependents`, payload);
    return response.data;
  } catch (error) {
    console.error('Create employee dependent error:', error);
    throw error;
  }
};

// Fonctions pour les documents
export const fetchEmployeeDocuments = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee documents error:', error);
    return [];
  }
};

export const uploadEmployeeDocument = async (employeeId, file, documentData) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });

    const response = await apiClient.upload(`/employees/${employeeId}/documents`, formData);
    return response.data;
  } catch (error) {
    console.error('Upload employee document error:', error);
    throw error;
  }
};

export const deleteEmployeeDocument = async (documentId) => {
  try {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Delete employee document error:', error);
    throw error;
  }
};

// Fonctions pour les demandes
export const fetchEmployeeRequests = async (employeeId, status = "") => {
  try {
    const params = { employee_id: employeeId };
    if (status) params.status = status;
    
    const response = await apiClient.get('/requests', params);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee requests error:', error);
    return [];
  }
};

export const createEmployeeRequest = async (payload) => {
  try {
    const response = await apiClient.post('/requests', payload);
    return response.data;
  } catch (error) {
    console.error('Create employee request error:', error);
    throw error;
  }
};

export const updateEmployeeRequest = async (requestId, payload) => {
  try {
    const response = await apiClient.put(`/requests/${requestId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update employee request error:', error);
    throw error;
  }
};

export const approveEmployeeRequest = async (requestId, approvalData) => {
  try {
    const response = await apiClient.post(`/requests/${requestId}/approve`, approvalData);
    return response.data;
  } catch (error) {
    console.error('Approve employee request error:', error);
    throw error;
  }
};

export const rejectEmployeeRequest = async (requestId, rejectionData) => {
  try {
    const response = await apiClient.post(`/requests/${requestId}/reject`, rejectionData);
    return response.data;
  } catch (error) {
    console.error('Reject employee request error:', error);
    throw error;
  }
};

// Historique
export const fetchEmployeeHistory = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/history`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee history error:', error);
    return [];
  }
};

// Contrats
export const fetchEmployeeContracts = async (employeeId) => {
  try {
    const response = await apiClient.get(`/employees/${employeeId}/contracts`);
    return response.data || [];
  } catch (error) {
    console.error('Fetch employee contracts error:', error);
    return [];
  }
};

export default {
  fetchEmployees,
  fetchEmployeeById,
  fetchEmployeeByUserId,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  terminateEmployee,
  deleteEmployee,
  fetchEmployeeStatistics,
  fetchSubordinates,
  fetchEmployeeDependents,
  createEmployeeDependent,
  fetchEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  fetchEmployeeRequests,
  createEmployeeRequest,
  updateEmployeeRequest,
  approveEmployeeRequest,
  rejectEmployeeRequest,
  fetchEmployeeHistory,
  fetchEmployeeContracts,
};

