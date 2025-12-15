import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as recruitmentService from '@/src/services/apis/recruitmentService';

// ==================== WORKFORCE PLANNING ====================

export const useGetWorkforcePlannings = (filters = {}) => {
  return useQuery({
    queryKey: ['workforce-plannings', filters],
    queryFn: () => recruitmentService.getWorkforcePlannings(filters),
  });
};

export const useGetWorkforcePlanningById = (id) => {
  return useQuery({
    queryKey: ['workforce-planning', id],
    queryFn: () => recruitmentService.getWorkforcePlanningById(id),
    enabled: !!id,
  });
};

export const useCreateWorkforcePlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createWorkforcePlanning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-plannings'] });
    },
  });
};

export const useUpdateWorkforcePlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateWorkforcePlanning(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workforce-plannings'] });
      queryClient.invalidateQueries({ queryKey: ['workforce-planning', variables.id] });
    },
  });
};

export const useDeleteWorkforcePlanning = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.deleteWorkforcePlanning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-plannings'] });
    },
  });
};

// ==================== WORKFORCE PLANNING ITEMS ====================

export const useCreatePlanningItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createPlanningItem,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workforce-planning', variables.planning_id] });
    },
  });
};

export const useUpdatePlanningItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updatePlanningItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-planning'] });
    },
  });
};

export const useDeletePlanningItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.deletePlanningItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-planning'] });
    },
  });
};

// ==================== JOB OPENINGS ====================

export const useGetJobOpenings = (filters = {}) => {
  return useQuery({
    queryKey: ['job-openings', filters],
    queryFn: () => recruitmentService.getJobOpenings(filters),
  });
};

export const useGetJobOpeningById = (id) => {
  return useQuery({
    queryKey: ['job-opening', id],
    queryFn: () => recruitmentService.getJobOpeningById(id),
    enabled: !!id,
  });
};

export const useCreateJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createJobOpening,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
    },
  });
};

export const useUpdateJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateJobOpening(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
      queryClient.invalidateQueries({ queryKey: ['job-opening', variables.id] });
    },
  });
};

export const usePublishJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.publishJobOpening,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
      queryClient.invalidateQueries({ queryKey: ['job-opening', id] });
    },
  });
};

export const useDeleteJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.deleteJobOpening,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-openings'] });
    },
  });
};

// ==================== CANDIDATES ====================

export const useGetCandidates = (filters = {}) => {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => recruitmentService.getCandidates(filters),
  });
};

export const useGetCandidateById = (id) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => recruitmentService.getCandidateById(id),
    enabled: !!id,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateCandidate(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

// ==================== CANDIDATE INTERVIEWS ====================

export const useGetAllInterviews = (filters = {}) => {
  return useQuery({
    queryKey: ['all-interviews', filters],
    queryFn: () => recruitmentService.getAllInterviews(filters),
  });
};

export const useGetInterviews = (candidateId) => {
  return useQuery({
    queryKey: ['interviews', candidateId],
    queryFn: () => recruitmentService.getInterviews(candidateId),
    enabled: !!candidateId,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createInterview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.candidate_id] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidate_id] });
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateInterview(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
    },
  });
};

// ==================== CANDIDATE EVALUATIONS ====================

export const useGetEvaluations = (candidateId) => {
  return useQuery({
    queryKey: ['evaluations', candidateId],
    queryFn: () => recruitmentService.getEvaluations(candidateId),
    enabled: !!candidateId,
  });
};

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createEvaluation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', variables.candidate_id] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidate_id] });
    },
  });
};

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateEvaluation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['candidate'] });
    },
  });
};

// ==================== JOB OFFERS ====================

export const useGetJobOffers = (filters = {}) => {
  return useQuery({
    queryKey: ['job-offers', filters],
    queryFn: () => recruitmentService.getJobOffers(filters),
  });
};

export const useCreateJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createJobOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
    },
  });
};

export const useUpdateJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateJobOffer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
    },
  });
};

// ==================== SOCIAL MEDIA POSTS ====================

export const useGetSocialMediaPosts = (jobOpeningId) => {
  return useQuery({
    queryKey: ['social-media-posts', jobOpeningId],
    queryFn: () => recruitmentService.getSocialMediaPosts(jobOpeningId),
    enabled: !!jobOpeningId,
  });
};

export const useCreateSocialMediaPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createSocialMediaPost,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts', variables.job_opening_id] });
    },
  });
};

export const useUpdateSocialMediaPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateSocialMediaPost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-posts'] });
    },
  });
};
