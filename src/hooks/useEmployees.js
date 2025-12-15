import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchEmployees,
  fetchEmployeeById,
  fetchEmployeeByUserId,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  terminateEmployee,
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
} from "../services/apis/employeeService";
import queryClient from "../lib/react-query-client";

export const useGetEmployees = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["employees", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchEmployees({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetEmployeeById = (id) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  });
};

export const useGetEmployeeByUserId = (userId) => {
  return useQuery({
    queryKey: ["employee-by-user", userId],
    queryFn: () => fetchEmployeeByUserId(userId),
    enabled: !!userId,
  });
};

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateEmployeeStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }) => updateEmployeeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useTerminateEmployee = () => {
  return useMutation({
    mutationFn: ({ id, terminationData }) => terminateEmployee(id, terminationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useGetEmployeeDependents = (employeeId) => {
  return useQuery({
    queryKey: ["employee-dependents", employeeId],
    queryFn: () => fetchEmployeeDependents(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployeeDependent = () => {
  return useMutation({
    mutationFn: ({ employeeId, payload }) => createEmployeeDependent(employeeId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee-dependents", variables.employeeId] });
    },
  });
};

export const useGetEmployeeDocuments = (employeeId) => {
  return useQuery({
    queryKey: ["employee-documents", employeeId],
    queryFn: () => fetchEmployeeDocuments(employeeId),
    enabled: !!employeeId,
  });
};

export const useUploadEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, formData }) => uploadEmployeeDocument(employeeId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents", variables.employeeId] });
    },
  });
};

export const useDeleteEmployeeDocument = () => {
  return useMutation({
    mutationFn: deleteEmployeeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-documents"] });
    },
  });
};

export const useGetEmployeeRequests = (employeeId, status = "") => {
  return useQuery({
    queryKey: ["employee-requests", employeeId, status],
    queryFn: () => fetchEmployeeRequests(employeeId, status),
    enabled: !!employeeId,
  });
};

export const useCreateEmployeeRequest = () => {
  return useMutation({
    mutationFn: createEmployeeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
    },
  });
};

export const useUpdateEmployeeRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, payload }) => updateEmployeeRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
    },
  });
};

export const useApproveEmployeeRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, approvalData }) => approveEmployeeRequest(requestId, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
    },
  });
};

export const useRejectEmployeeRequest = () => {
  return useMutation({
    mutationFn: ({ requestId, rejectionData }) => rejectEmployeeRequest(requestId, rejectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-requests"] });
    },
  });
};

export const useGetEmployeeHistory = (employeeId) => {
  return useQuery({
    queryKey: ["employee-history", employeeId],
    queryFn: () => fetchEmployeeHistory(employeeId),
    enabled: !!employeeId,
  });
};

export const useGetEmployeeContracts = (employeeId) => {
  return useQuery({
    queryKey: ["employee-contracts", employeeId],
    queryFn: () => fetchEmployeeContracts(employeeId),
    enabled: !!employeeId,
  });
};
