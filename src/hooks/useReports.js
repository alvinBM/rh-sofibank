import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchHRDashboardMetrics,
  fetchHeadcountTrend,
  fetchGenderDistribution,
  fetchDepartmentDistribution,
  fetchMonthlySalaryCosts,
  fetchMonthlyAbsenteeism,
  fetchRecruitmentPipeline,
  fetchTurnoverStats,
  fetchReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  generateCustomReport,
  fetchScheduledReports,
  createScheduledReport,
  exportReport,
  fetchAlerts,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  fetchAlertThresholds,
  updateAlertThreshold,
  checkAndGenerateAlerts,
  fetchAlertCounts,
} from "../services/apis/reportsService";
import queryClient from "../lib/react-query-client";

// ==================== DASHBOARD RH PRINCIPAL ====================

export const useGetHRDashboardMetrics = (filters = {}) => {
  return useQuery({
    queryKey: ["hr-dashboard-metrics", filters],
    queryFn: () => fetchHRDashboardMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetHeadcountTrend = (startDate, endDate) => {
  return useQuery({
    queryKey: ["headcount-trend", startDate, endDate],
    queryFn: () => fetchHeadcountTrend(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useGetGenderDistribution = () => {
  return useQuery({
    queryKey: ["gender-distribution"],
    queryFn: fetchGenderDistribution,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGetDepartmentDistribution = () => {
  return useQuery({
    queryKey: ["department-distribution"],
    queryFn: fetchDepartmentDistribution,
    staleTime: 30 * 60 * 1000,
  });
};

export const useGetMonthlySalaryCosts = (year) => {
  return useQuery({
    queryKey: ["monthly-salary-costs", year],
    queryFn: () => fetchMonthlySalaryCosts(year),
    enabled: !!year,
  });
};

export const useGetMonthlyAbsenteeism = (year) => {
  return useQuery({
    queryKey: ["monthly-absenteeism", year],
    queryFn: () => fetchMonthlyAbsenteeism(year),
    enabled: !!year,
  });
};

export const useGetRecruitmentPipeline = () => {
  return useQuery({
    queryKey: ["recruitment-pipeline"],
    queryFn: fetchRecruitmentPipeline,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetTurnoverStats = (year) => {
  return useQuery({
    queryKey: ["turnover-stats", year],
    queryFn: () => fetchTurnoverStats(year),
    enabled: !!year,
  });
};

// ==================== RAPPORTS PERSONNALISÉS ====================

export const useGetReportTemplates = (userId) => {
  return useQuery({
    queryKey: ["report-templates", userId],
    queryFn: () => fetchReportTemplates(userId),
    enabled: !!userId,
  });
};

export const useCreateReportTemplate = () => {
  return useMutation({
    mutationFn: createReportTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
    },
  });
};

export const useUpdateReportTemplate = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateReportTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
    },
  });
};

export const useDeleteReportTemplate = () => {
  return useMutation({
    mutationFn: deleteReportTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
    },
  });
};

export const useGenerateCustomReport = () => {
  return useMutation({
    mutationFn: generateCustomReport,
  });
};

export const useGetScheduledReports = () => {
  return useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: fetchScheduledReports,
  });
};

export const useCreateScheduledReport = () => {
  return useMutation({
    mutationFn: createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
    },
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportId, format }) => exportReport(reportId, format),
  });
};

// ==================== ALERTES ====================

export const useGetAlerts = ({ page, rowsPerPage, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["alerts", { page, rowsPerPage, filters }],
    queryFn: () => fetchAlerts({ offset, limit: rowsPerPage, filters }),
    keepPreviousData: true,
  });
};

export const useCreateAlert = () => {
  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-counts"] });
    },
  });
};

export const useAcknowledgeAlert = () => {
  return useMutation({
    mutationFn: ({ id, userId }) => acknowledgeAlert(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-counts"] });
    },
  });
};

export const useResolveAlert = () => {
  return useMutation({
    mutationFn: ({ id, userId, resolution }) => resolveAlert(id, userId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-counts"] });
    },
  });
};

export const useGetAlertThresholds = () => {
  return useQuery({
    queryKey: ["alert-thresholds"],
    queryFn: fetchAlertThresholds,
    staleTime: 30 * 60 * 1000,
  });
};

export const useUpdateAlertThreshold = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateAlertThreshold(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-thresholds"] });
    },
  });
};

export const useCheckAndGenerateAlerts = () => {
  return useMutation({
    mutationFn: checkAndGenerateAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-counts"] });
    },
  });
};

export const useGetAlertCounts = () => {
  return useQuery({
    queryKey: ["alert-counts"],
    queryFn: fetchAlertCounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
