import apiClient from '../api-client';

/**
 * Get dashboard statistics
 */
export const fetchDashboardStats = async () => {
    try {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

/**
 * Get employee statistics
 */
export const fetchEmployeeStatistics = async () => {
    try {
        const response = await apiClient.get('/dashboard/employee-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching employee statistics:', error);
        throw error;
    }
};

/**
 * Get leave statistics
 */
export const fetchLeaveStatistics = async () => {
    try {
        const response = await apiClient.get('/dashboard/leave-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        throw error;
    }
};

/**
 * Get attendance statistics
 */
export const fetchAttendanceStatistics = async () => {
    try {
        const response = await apiClient.get('/dashboard/attendance-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        throw error;
    }
};
