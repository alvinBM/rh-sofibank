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
  calculateWorkingDays,
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
    mutationFn: ({ startDate, endDate }) => calculateWorkingDays(startDate, endDate),
  });
};
