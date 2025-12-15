import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchLeaveTypes,
  fetchLeaveBalances,
  fetchLeaveRequests,
  fetchLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  fetchHandoverSheet,
  createHandoverSheet,
  updateHandoverSheet,
  signHandoverSheet,
  fetchLeavePlanning,
  createLeavePlanning,
  updateLeavePlanning,
  calculateWorkingDaysFromDB,
  approveByBackup,
  approveBySupervisor,
  approveByHR,
  approveByDG,
  uploadHandoverDocument,
  fetchAllApprovedLeaveRequests,
  detectLeaveConflicts,
  fetchLeaveStatsByDepartment,
  adjustLeaveBalance,
  fetchBalanceAdjustmentHistory,
  fetchAllLeaveBalances,
} from "../services/apis/leaveService";
import queryClient from "../lib/react-query-client";

export const useGetLeaveTypes = () => {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    staleTime: 30 * 60 * 1000,
  });
};

export const useGetLeaveBalances = (employeeId, year) => {
  return useQuery({
    queryKey: ["leave-balances", employeeId, year],
    queryFn: () => fetchLeaveBalances(employeeId, year),
    enabled: !!employeeId && !!year,
  });
};

export const useGetLeaveRequests = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["leave-requests", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchLeaveRequests({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetLeaveRequestById = (id) => {
  return useQuery({
    queryKey: ["leave-request", id],
    queryFn: () => fetchLeaveRequestById(id),
    enabled: !!id,
  });
};

export const useCreateLeaveRequest = () => {
  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateLeaveRequest(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-request", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
};

export const useSubmitLeaveRequest = () => {
  return useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
};

export const useApproveLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, approvalData }) => approveLeaveRequest(id, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, rejectionData }) => rejectLeaveRequest(id, rejectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  return useMutation({
    mutationFn: ({ id, reason }) => cancelLeaveRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useGetHandoverSheet = (leaveRequestId) => {
  return useQuery({
    queryKey: ["handover-sheet", leaveRequestId],
    queryFn: () => fetchHandoverSheet(leaveRequestId),
    enabled: !!leaveRequestId,
  });
};

export const useCreateHandoverSheet = () => {
  return useMutation({
    mutationFn: ({ leaveRequestId, payload }) => createHandoverSheet(leaveRequestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["handover-sheet", variables.leaveRequestId] });
    },
  });
};

export const useUpdateHandoverSheet = () => {
  return useMutation({
    mutationFn: ({ leaveRequestId, payload }) => updateHandoverSheet(leaveRequestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["handover-sheet", variables.leaveRequestId] });
    },
  });
};

export const useSignHandoverSheet = () => {
  return useMutation({
    mutationFn: ({ leaveRequestId, signatureType }) => signHandoverSheet(leaveRequestId, signatureType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["handover-sheet", variables.leaveRequestId] });
    },
  });
};

export const useGetLeavePlanning = (year, employeeId = null) => {
  return useQuery({
    queryKey: ["leave-planning", year, employeeId],
    queryFn: () => fetchLeavePlanning(year, employeeId),
    enabled: !!year,
  });
};

export const useCreateLeavePlanning = () => {
  return useMutation({
    mutationFn: createLeavePlanning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-planning"] });
    },
  });
};

export const useUpdateLeavePlanning = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateLeavePlanning(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-planning"] });
    },
  });
};

export const useCalculateWorkingDays = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate }) => calculateWorkingDaysFromDB(startDate, endDate),
  });
};

// Nouveaux hooks pour le workflow d'approbation

export const useApproveByBackup = () => {
  return useMutation({
    mutationFn: ({ id, backupId, comments }) => approveByBackup(id, backupId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
    },
  });
};

export const useApproveBySupervisor = () => {
  return useMutation({
    mutationFn: ({ id, supervisorId, comments }) => approveBySupervisor(id, supervisorId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
    },
  });
};

export const useApproveByHR = () => {
  return useMutation({
    mutationFn: ({ id, hrUserId, comments }) => approveByHR(id, hrUserId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useApproveByDG = () => {
  return useMutation({
    mutationFn: ({ id, dgUserId, comments }) => approveByDG(id, dgUserId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
    },
  });
};

export const useUploadHandoverDocument = () => {
  return useMutation({
    mutationFn: ({ leaveRequestId, file }) => uploadHandoverDocument(leaveRequestId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-request", variables.leaveRequestId] });
    },
  });
};

// Hooks pour la planification et les statistiques

export const useGetAllApprovedLeaveRequests = (year, departmentId = null) => {
  return useQuery({
    queryKey: ["approved-leave-requests", year, departmentId],
    queryFn: () => fetchAllApprovedLeaveRequests(year, departmentId),
    enabled: !!year,
  });
};

export const useDetectLeaveConflicts = () => {
  return useMutation({
    mutationFn: ({ departmentId, startDate, endDate }) =>
      detectLeaveConflicts(departmentId, startDate, endDate),
  });
};

export const useGetLeaveStatsByDepartment = (year) => {
  return useQuery({
    queryKey: ["leave-stats-by-department", year],
    queryFn: () => fetchLeaveStatsByDepartment(year),
    enabled: !!year,
  });
};

// Hooks pour la gestion des soldes

export const useGetAllLeaveBalances = (year, departmentId = null, employeeId = null) => {
  return useQuery({
    queryKey: ["all-leave-balances", year, departmentId, employeeId],
    queryFn: () => fetchAllLeaveBalances(year, departmentId, employeeId),
    enabled: !!year,
  });
};

export const useAdjustLeaveBalance = () => {
  return useMutation({
    mutationFn: ({ balanceId, adjustment, reason, adjustedBy }) =>
      adjustLeaveBalance(balanceId, adjustment, reason, adjustedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["all-leave-balances"] });
    },
  });
};

export const useGetBalanceAdjustmentHistory = (balanceId) => {
  return useQuery({
    queryKey: ["balance-adjustment-history", balanceId],
    queryFn: () => fetchBalanceAdjustmentHistory(balanceId),
    enabled: !!balanceId,
  });
};
