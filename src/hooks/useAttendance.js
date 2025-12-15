import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchAttendanceRecords,
  fetchAttendanceRecordById,
  createAttendanceRecord,
  updateAttendanceRecord,
  synchronizeAttendanceFromTerminals,
  fetchDailySummary,
  fetchEmployeeDailyAttendance,
  fetchExitAuthorizations,
  createExitAuthorization,
  updateExitAuthorization,
  approveExitAuthorization,
  rejectExitAuthorization,
  markAuthorizationAsUsed,
  generateLatenessReport,
  generateMissingPunchReport,
  generateDepartmentSummary,
  fetchAttendanceStats,
  fetchMonthlyAttendanceTrend,
  fetchDepartmentComparison,
  exportAttendanceData,
} from "../services/apis/attendanceService";
import queryClient from "../lib/react-query-client";

// ==================== REGISTRE DE PRÉSENCE ====================

export const useGetAttendanceRecords = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["attendance-records", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchAttendanceRecords({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetAttendanceRecordById = (id) => {
  return useQuery({
    queryKey: ["attendance-record", id],
    queryFn: () => fetchAttendanceRecordById(id),
    enabled: !!id,
  });
};

export const useCreateAttendanceRecord = () => {
  return useMutation({
    mutationFn: createAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
    },
  });
};

export const useUpdateAttendanceRecord = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateAttendanceRecord(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-record", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
    },
  });
};

export const useSynchronizeAttendance = () => {
  return useMutation({
    mutationFn: synchronizeAttendanceFromTerminals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
    },
  });
};

export const useGetDailySummary = (date, departmentId = null) => {
  return useQuery({
    queryKey: ["daily-summary", date, departmentId],
    queryFn: () => fetchDailySummary(date, departmentId),
    enabled: !!date,
  });
};

export const useGetEmployeeDailyAttendance = (employeeId, date) => {
  return useQuery({
    queryKey: ["employee-daily-attendance", employeeId, date],
    queryFn: () => fetchEmployeeDailyAttendance(employeeId, date),
    enabled: !!employeeId && !!date,
  });
};

// ==================== AUTORISATIONS DE SORTIE ====================

export const useGetExitAuthorizations = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["exit-authorizations", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchExitAuthorizations({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useCreateExitAuthorization = () => {
  return useMutation({
    mutationFn: createExitAuthorization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-authorizations"] });
    },
  });
};

export const useUpdateExitAuthorization = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateExitAuthorization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-authorizations"] });
    },
  });
};

export const useApproveExitAuthorization = () => {
  return useMutation({
    mutationFn: ({ id, approverId, comments }) => approveExitAuthorization(id, approverId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-authorizations"] });
    },
  });
};

export const useRejectExitAuthorization = () => {
  return useMutation({
    mutationFn: ({ id, approverId, reason }) => rejectExitAuthorization(id, approverId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-authorizations"] });
    },
  });
};

export const useMarkAuthorizationAsUsed = () => {
  return useMutation({
    mutationFn: markAuthorizationAsUsed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exit-authorizations"] });
    },
  });
};

// ==================== RAPPORTS DE PRÉSENCE ====================

export const useGenerateLatenessReport = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate, departmentId }) =>
      generateLatenessReport(startDate, endDate, departmentId),
  });
};

export const useGenerateMissingPunchReport = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate, departmentId }) =>
      generateMissingPunchReport(startDate, endDate, departmentId),
  });
};

export const useGenerateDepartmentSummary = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate }) => generateDepartmentSummary(startDate, endDate),
  });
};

export const useGetAttendanceStats = (startDate, endDate, departmentId = null) => {
  return useQuery({
    queryKey: ["attendance-stats", startDate, endDate, departmentId],
    queryFn: () => fetchAttendanceStats(startDate, endDate, departmentId),
    enabled: !!startDate && !!endDate,
  });
};

export const useGetMonthlyAttendanceTrend = (year, departmentId = null) => {
  return useQuery({
    queryKey: ["monthly-attendance-trend", year, departmentId],
    queryFn: () => fetchMonthlyAttendanceTrend(year, departmentId),
    enabled: !!year,
  });
};

export const useGetDepartmentComparison = (startDate, endDate) => {
  return useQuery({
    queryKey: ["department-comparison", startDate, endDate],
    queryFn: () => fetchDepartmentComparison(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useExportAttendanceData = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate, format }) => exportAttendanceData(startDate, endDate, format),
  });
};
