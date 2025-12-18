import apiClient from '../api-client';

/**
 * Fetch attendance records for an employee
 */
export const fetchEmployeeAttendance = async (employeeId, filters = {}) => {
  try {
    let url = `/employees/${employeeId}/attendance?`;
    
    if (filters.startDate) url += `startDate=${filters.startDate}&`;
    if (filters.endDate) url += `endDate=${filters.endDate}&`;
    if (filters.status) url += `status=${filters.status}&`;
    if (filters.month) url += `month=${filters.month}&`;
    if (filters.year) url += `year=${filters.year}&`;
    
    const response = await apiClient.get(url);
    return response.data || { records: [], statistics: {} };
  } catch (error) {
    console.error('Fetch employee attendance error:', error);
    return { records: [], statistics: {} };
  }
};

/**
 * Fetch attendance calendar data for an employee
 */
export const fetchAttendanceCalendar = async (employeeId, month, year) => {
  try {
    const response = await apiClient.get(
      `/employees/${employeeId}/attendance/calendar?month=${month}&year=${year}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Fetch attendance calendar error:', error);
    return [];
  }
};

/**
 * Fetch attendance movements (entries/exits)
 */
export const fetchAttendanceMovements = async (employeeId, filters = {}) => {
  try {
    let url = `/employees/${employeeId}/attendance/movements?`;
    
    if (filters.startDate) url += `startDate=${filters.startDate}&`;
    if (filters.endDate) url += `endDate=${filters.endDate}&`;
    if (filters.limit) url += `limit=${filters.limit}&`;
    
    const response = await apiClient.get(url);
    return response.data || [];
  } catch (error) {
    console.error('Fetch attendance movements error:', error);
    return [];
  }
};

/**
 * Fetch monthly attendance summary
 */
export const fetchMonthlySummary = async (employeeId, month, year) => {
  try {
    const response = await apiClient.get(
      `/employees/${employeeId}/attendance/summary?month=${month}&year=${year}`
    );
    return response.data || {};
  } catch (error) {
    console.error('Fetch monthly summary error:', error);
    return {};
  }
};

export default {
  fetchEmployeeAttendance,
  fetchAttendanceCalendar,
  fetchAttendanceMovements,
  fetchMonthlySummary,
};
