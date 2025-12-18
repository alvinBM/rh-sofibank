import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchPayrollRuns,
  fetchPayrollRunById,
  createPayrollRun,
  processPayrollRun,
  approvePayrollRun,
  distributePayslips,
  fetchPayrollDetails,
  updatePayrollDetail,
  fetchPayrollVariables,
  createPayrollVariable,
  updatePayrollVariable,
  deletePayrollVariable,
  fetchPayrollSettings,
  updatePayrollSettings,
  fetchTaxRates,
  updateTaxRate,
  generatePayslipPDF,
  fetchDistributionHistory,
  fetchPayrollStats,
  fetchPaymentHistory,
} from "../services/apis/payrollService";
import queryClient from "../lib/react-query-client";

// ==================== EXÉCUTIONS DE PAIE ====================

export const useGetPayrollRuns = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["payroll-runs", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchPayrollRuns({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetPayrollRunById = (id) => {
  return useQuery({
    queryKey: ["payroll-run", id],
    queryFn: () => fetchPayrollRunById(id),
    enabled: !!id,
  });
};

export const useCreatePayrollRun = () => {
  return useMutation({
    mutationFn: createPayrollRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
};

export const useProcessPayrollRun = () => {
  return useMutation({
    mutationFn: processPayrollRun,
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run", runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
    },
  });
};

export const useApprovePayrollRun = () => {
  return useMutation({
    mutationFn: ({ runId, approvedBy }) => approvePayrollRun(runId, approvedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run", variables.runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
};

export const useDistributePayslips = () => {
  return useMutation({
    mutationFn: ({ runId, distributionMethod }) => distributePayslips(runId, distributionMethod),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run", variables.runId] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      queryClient.invalidateQueries({ queryKey: ["distribution-history"] });
    },
  });
};

// ==================== DÉTAILS DE PAIE ====================

export const useGetPayrollDetails = (runId) => {
  return useQuery({
    queryKey: ["payroll-details", runId],
    queryFn: () => fetchPayrollDetails(runId),
    enabled: !!runId,
  });
};

export const useUpdatePayrollDetail = () => {
  return useMutation({
    mutationFn: ({ detailId, payload }) => updatePayrollDetail(detailId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-run"] });
    },
  });
};

// ==================== ÉLÉMENTS VARIABLES ====================

export const useGetPayrollVariables = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["payroll-variables", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchPayrollVariables({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useCreatePayrollVariable = () => {
  return useMutation({
    mutationFn: createPayrollVariable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-variables"] });
    },
  });
};

export const useUpdatePayrollVariable = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updatePayrollVariable(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-variables"] });
    },
  });
};

export const useDeletePayrollVariable = () => {
  return useMutation({
    mutationFn: deletePayrollVariable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-variables"] });
    },
  });
};

// ==================== PARAMÈTRES DE PAIE ====================

export const useGetPayrollSettings = () => {
  return useQuery({
    queryKey: ["payroll-settings"],
    queryFn: fetchPayrollSettings,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUpdatePayrollSettings = () => {
  return useMutation({
    mutationFn: updatePayrollSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-settings"] });
    },
  });
};

export const useGetTaxRates = () => {
  return useQuery({
    queryKey: ["tax-rates"],
    queryFn: fetchTaxRates,
    staleTime: 30 * 60 * 1000,
  });
};

export const useUpdateTaxRate = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateTaxRate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rates"] });
    },
  });
};

// ==================== BULLETINS DE PAIE ====================

export const useGeneratePayslipPDF = () => {
  return useMutation({
    mutationFn: generatePayslipPDF,
  });
};

export const useGetDistributionHistory = (runId) => {
  return useQuery({
    queryKey: ["distribution-history", runId],
    queryFn: () => fetchDistributionHistory(runId),
    enabled: !!runId,
  });
};

export const useGetPayrollStats = (year) => {
  return useQuery({
    queryKey: ["payroll-stats", year],
    queryFn: () => fetchPayrollStats(year),
    enabled: !!year,
  });
};

export const useGetPaymentHistory = (employeeId, filters = {}) => {
  return useQuery({
    queryKey: ["payment-history", employeeId, filters],
    queryFn: () => fetchPaymentHistory(employeeId, filters),
    enabled: !!employeeId,
  });
};
