import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as essService from '@/src/services/apis/essService';

// ==================== EMPLOYEE PROFILE ====================

export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ['my-profile'],
    queryFn: essService.getMyProfile,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });
};

// ==================== EMPLOYEE DOCUMENTS ====================

export const useGetMyDocuments = () => {
  return useQuery({
    queryKey: ['my-documents'],
    queryFn: essService.getMyDocuments,
  });
};

export const useGetEmployeeDocuments = (employeeId) => {
  return useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: () => essService.getEmployeeDocuments(employeeId),
    enabled: !!employeeId,
  });
};

export const useUploadEmployeeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.uploadEmployeeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
  });
};

export const useDeleteEmployeeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.deleteEmployeeDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
    },
  });
};

// ==================== EMPLOYEE CONTRACTS ====================

export const useGetMyContracts = () => {
  return useQuery({
    queryKey: ['my-contracts'],
    queryFn: essService.getMyContracts,
  });
};

export const useGetEmployeeContracts = (employeeId) => {
  return useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: () => essService.getEmployeeContracts(employeeId),
    enabled: !!employeeId,
  });
};

// ==================== EMPLOYEE REQUESTS ====================

export const useGetMyRequests = () => {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: essService.getMyRequests,
  });
};

export const useGetEmployeeRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['employee-requests', filters],
    queryFn: () => essService.getEmployeeRequests(filters),
  });
};

export const useCreateEmployeeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.createEmployeeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee-requests'] });
    },
  });
};

export const useUpdateEmployeeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => essService.updateEmployeeRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee-requests'] });
    },
  });
};

export const useGetRequestTypes = () => {
  return useQuery({
    queryKey: ['request-types'],
    queryFn: essService.getRequestTypes,
  });
};

// ==================== INTERNAL ANNOUNCEMENTS ====================

export const useGetInternalAnnouncements = () => {
  return useQuery({
    queryKey: ['internal-announcements'],
    queryFn: essService.getInternalAnnouncements,
  });
};

export const useGetAllAnnouncements = (filters = {}) => {
  return useQuery({
    queryKey: ['all-announcements', filters],
    queryFn: () => essService.getAllAnnouncements(filters),
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['all-announcements'] });
    },
  });
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => essService.updateAnnouncement(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['all-announcements'] });
    },
  });
};

export const useMarkAnnouncementAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.markAnnouncementAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-announcements'] });
    },
  });
};

// ==================== EMPLOYEE FEEDBACK ====================

export const useGetMyFeedback = () => {
  return useQuery({
    queryKey: ['my-feedback'],
    queryFn: essService.getMyFeedback,
  });
};

export const useGetAllFeedback = (filters = {}) => {
  return useQuery({
    queryKey: ['all-feedback', filters],
    queryFn: () => essService.getAllFeedback(filters),
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['all-feedback'] });
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => essService.updateFeedback(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['all-feedback'] });
    },
  });
};

// ==================== EMPLOYEE HISTORY ====================

export const useGetEmployeeHistory = (employeeId) => {
  return useQuery({
    queryKey: ['employee-history', employeeId],
    queryFn: () => essService.getEmployeeHistory(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployeeHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.createEmployeeHistory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-history', variables.employee_id] });
    },
  });
};

// ==================== EMPLOYEE DEPENDENTS ====================

export const useGetEmployeeDependents = (employeeId) => {
  return useQuery({
    queryKey: ['employee-dependents', employeeId],
    queryFn: () => essService.getEmployeeDependents(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateEmployeeDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.createEmployeeDependent,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-dependents', variables.employee_id] });
    },
  });
};

export const useUpdateEmployeeDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => essService.updateEmployeeDependent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-dependents'] });
    },
  });
};

export const useDeleteEmployeeDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: essService.deleteEmployeeDependent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-dependents'] });
    },
  });
};
