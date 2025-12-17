import apiClient from '../api-client';

/**
 * Service pour la gestion de la présence (Time & Attendance)
 */

// ==================== REGISTRE DE PRÉSENCE ====================

export const fetchAttendanceRecords = async ({ offset = 0, limit = 10, query, filters = {} }) => {
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

    const response = await apiClient.get('/attendance', params);
    
    return {
      records: response.data.records || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('Fetch attendance records error:', error);
    throw error;
  }
};

export const fetchAttendanceRecordById = async (id) => {
  try {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch attendance record error:', error);
    throw error;
  }
};

export const checkIn = async (employeeId) => {
  try {
    const response = await apiClient.post('/attendance/check-in', { employee_id: employeeId });
    return response.data;
  } catch (error) {
    console.error('Check in error:', error);
    throw error;
  }
};

export const checkOut = async (employeeId) => {
  try {
    const response = await apiClient.post('/attendance/check-out', { employee_id: employeeId });
    return response.data;
  } catch (error) {
    console.error('Check out error:', error);
    throw error;
  }
};

export const createOrUpdateAttendanceRecord = async (payload) => {
  try {
    const response = await apiClient.post('/attendance', payload);
    return response.data;
  } catch (error) {
    console.error('Create/Update attendance record error:', error);
    throw error;
  }
};

export const deleteAttendanceRecord = async (id) => {
  try {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete attendance record error:', error);
    throw error;
  }
};

export const fetchAttendanceStatistics = async (startDate, endDate) => {
  try {
    const response = await apiClient.get('/attendance/statistics', {
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Fetch attendance statistics error:', error);
    throw error;
  }
};

export const fetchEmployeeAttendanceSummary = async (employeeId, startDate, endDate) => {
  try {
    const response = await apiClient.get(`/attendance/employee/${employeeId}/summary`, {
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Fetch employee attendance summary error:', error);
    throw error;
  }
};

export default {
  fetchAttendanceRecords,
  fetchAttendanceRecordById,
  checkIn,
  checkOut,
  createOrUpdateAttendanceRecord,
  deleteAttendanceRecord,
  fetchAttendanceStatistics,
  fetchEmployeeAttendanceSummary,
};
