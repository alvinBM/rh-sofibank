import { useQuery } from "@tanstack/react-query";
import {
  fetchEmployeeAttendance,
  fetchAttendanceCalendar,
  fetchAttendanceMovements,
  fetchMonthlySummary,
} from "../services/apis/attendanceService";

/**
 * Hook to fetch attendance records for an employee
 */
export const useGetEmployeeAttendance = (employeeId, filters = {}) => {
  return useQuery({
    queryKey: ["employee-attendance", employeeId, filters],
    queryFn: () => fetchEmployeeAttendance(employeeId, filters),
    enabled: !!employeeId,
  });
};

/**
 * Hook to fetch attendance calendar data
 */
export const useGetAttendanceCalendar = (employeeId, month, year) => {
  return useQuery({
    queryKey: ["attendance-calendar", employeeId, month, year],
    queryFn: () => fetchAttendanceCalendar(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
  });
};

/**
 * Hook to fetch attendance movements (entries/exits)
 */
export const useGetAttendanceMovements = (employeeId, filters = {}) => {
  return useQuery({
    queryKey: ["attendance-movements", employeeId, filters],
    queryFn: () => fetchAttendanceMovements(employeeId, filters),
    enabled: !!employeeId,
  });
};

/**
 * Hook to fetch monthly attendance summary
 */
export const useGetMonthlySummary = (employeeId, month, year) => {
  return useQuery({
    queryKey: ["attendance-summary", employeeId, month, year],
    queryFn: () => fetchMonthlySummary(employeeId, month, year),
    enabled: !!employeeId,
  });
};
