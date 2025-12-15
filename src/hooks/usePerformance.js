import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchEvaluations,
  fetchEvaluationById,
  createEvaluation,
  updateEvaluation,
  submitSelfEvaluation,
  submitSupervisorLevel1Evaluation,
  submitPeerEvaluation,
  finalizeEvaluation,
  approveEvaluationByDG,
  fetchKPIs,
  fetchKPIById,
  createKPI,
  updateKPI,
  deleteKPI,
  fetchKPIsByPosition,
  fetchPIPs,
  fetchPIPById,
  createPIP,
  updatePIP,
  addPIPFollowUp,
  closePIP,
  fetchExpiringPIPs,
  fetchEvaluationStats,
  fetchScoreDistribution,
} from "../services/apis/performanceService";
import queryClient from "../lib/react-query-client";

// ==================== ÉVALUATIONS 360° ====================

export const useGetEvaluations = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["evaluations", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchEvaluations({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetEvaluationById = (id) => {
  return useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => fetchEvaluationById(id),
    enabled: !!id,
  });
};

export const useCreateEvaluation = () => {
  return useMutation({
    mutationFn: createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useUpdateEvaluation = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateEvaluation(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useSubmitSelfEvaluation = () => {
  return useMutation({
    mutationFn: ({ evaluationId, payload }) => submitSelfEvaluation(evaluationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.evaluationId] });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useSubmitSupervisorLevel1Evaluation = () => {
  return useMutation({
    mutationFn: ({ evaluationId, payload }) => submitSupervisorLevel1Evaluation(evaluationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.evaluationId] });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useSubmitPeerEvaluation = () => {
  return useMutation({
    mutationFn: ({ evaluationId, peerId, payload }) => submitPeerEvaluation(evaluationId, peerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.evaluationId] });
    },
  });
};

export const useFinalizeEvaluation = () => {
  return useMutation({
    mutationFn: ({ evaluationId, hrUserId, payload }) => finalizeEvaluation(evaluationId, hrUserId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.evaluationId] });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

export const useApproveEvaluationByDG = () => {
  return useMutation({
    mutationFn: ({ evaluationId, dgUserId, comments }) => approveEvaluationByDG(evaluationId, dgUserId, comments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluation", variables.evaluationId] });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
};

// ==================== KPIs ====================

export const useGetKPIs = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["kpis", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchKPIs({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetKPIById = (id) => {
  return useQuery({
    queryKey: ["kpi", id],
    queryFn: () => fetchKPIById(id),
    enabled: !!id,
  });
};

export const useCreateKPI = () => {
  return useMutation({
    mutationFn: createKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
};

export const useUpdateKPI = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updateKPI(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kpi", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
};

export const useDeleteKPI = () => {
  return useMutation({
    mutationFn: deleteKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
};

export const useGetKPIsByPosition = (position) => {
  return useQuery({
    queryKey: ["kpis-by-position", position],
    queryFn: () => fetchKPIsByPosition(position),
    enabled: !!position,
  });
};

// ==================== PLANS D'AMÉLIORATION (PIP) ====================

export const useGetPIPs = ({ page, rowsPerPage, query, filters = {} }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["pips", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchPIPs({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};

export const useGetPIPById = (id) => {
  return useQuery({
    queryKey: ["pip", id],
    queryFn: () => fetchPIPById(id),
    enabled: !!id,
  });
};

export const useCreatePIP = () => {
  return useMutation({
    mutationFn: createPIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pips"] });
    },
  });
};

export const useUpdatePIP = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updatePIP(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pip", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pips"] });
    },
  });
};

export const useAddPIPFollowUp = () => {
  return useMutation({
    mutationFn: ({ pipId, payload }) => addPIPFollowUp(pipId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pip", variables.pipId] });
    },
  });
};

export const useClosePIP = () => {
  return useMutation({
    mutationFn: ({ id, outcome, finalComments }) => closePIP(id, outcome, finalComments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pip", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pips"] });
    },
  });
};

export const useGetExpiringPIPs = (daysThreshold = 30) => {
  return useQuery({
    queryKey: ["expiring-pips", daysThreshold],
    queryFn: () => fetchExpiringPIPs(daysThreshold),
  });
};

// ==================== STATISTIQUES ====================

export const useGetEvaluationStats = (year, quarter = null) => {
  return useQuery({
    queryKey: ["evaluation-stats", year, quarter],
    queryFn: () => fetchEvaluationStats(year, quarter),
    enabled: !!year,
  });
};

export const useGetScoreDistribution = (year) => {
  return useQuery({
    queryKey: ["score-distribution", year],
    queryFn: () => fetchScoreDistribution(year),
    enabled: !!year,
  });
};
