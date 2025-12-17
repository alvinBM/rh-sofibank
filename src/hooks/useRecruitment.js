import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as recruitmentService from '../services/apis/recruitmentService';

// ========================================
// RECRUITMENT PLANS HOOKS
// ========================================

export const useGetRecruitmentPlans = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['recruitment-plans', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getRecruitmentPlans({ offset, limit, ...filters }),
  });
};

export const useGetRecruitmentPlanById = (id) => {
  return useQuery({
    queryKey: ['recruitment-plan', id],
    queryFn: () => recruitmentService.getRecruitmentPlanById(id),
    enabled: !!id,
  });
};

export const useCreateRecruitmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createRecruitmentPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
    },
  });
};

export const useUpdateRecruitmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateRecruitmentPlan(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-plan', variables.id] });
    },
  });
};

export const useSubmitRecruitmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.submitRecruitmentPlan,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-plan', id] });
    },
  });
};

export const useApproveRecruitmentPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approvalData }) => recruitmentService.approveRecruitmentPlan(id, approvalData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-plan', variables.id] });
    },
  });
};

export const useAddPositionToPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, positionData }) => recruitmentService.addPositionToPlan(planId, positionData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plan', variables.planId] });
    },
  });
};

export const useUpdatePlanPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ positionId, updates }) => recruitmentService.updatePlanPosition(positionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
    },
  });
};

export const useDeletePlanPosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.deletePlanPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-plans'] });
    },
  });
};

// ========================================
// JOB POSTINGS HOOKS
// ========================================

export const useGetJobPostings = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['job-postings', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getJobPostings({ offset, limit, ...filters }),
  });
};

export const useGetJobPostingById = (id) => {
  return useQuery({
    queryKey: ['job-posting', id],
    queryFn: () => recruitmentService.getJobPostingById(id),
    enabled: !!id,
  });
};

export const useGetPublicJobPostingById = (id) => {
  return useQuery({
    queryKey: ['public-job-posting', id],
    queryFn: () => recruitmentService.getPublicJobPostingById(id),
    enabled: !!id,
  });
};

export const useCreateJobPosting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
};

export const useUpdateJobPosting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateJobPosting(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', variables.id] });
    },
  });
};

export const usePublishJobPosting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.publishJobPosting,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', id] });
    },
  });
};

export const useCloseJobPosting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, closeData }) => recruitmentService.closeJobPosting(id, closeData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', variables.id] });
    },
  });
};

// ========================================
export const useGetJobApplications = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['job-applications', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getJobApplications({ offset, limit, ...filters }),
  });
};

export const useGetJobApplicationById = (id) => {
  return useQuery({
    queryKey: ['job-application', id],
    queryFn: () => recruitmentService.getJobApplicationById(id),
    enabled: !!id,
  });
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createJobApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateJobApplication(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-application', variables.id] });
    },
  });
};

export const useAssignApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignData }) => recruitmentService.assignApplication(id, assignData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-application', variables.id] });
    },
  });
};

export const useRateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ratingData }) => recruitmentService.rateApplication(id, ratingData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-application', variables.id] });
    },
  });
};

// ========================================
// INTERVIEWS HOOKS
// ========================================

export const useGetAllInterviews = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['all-interviews', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getAllInterviews({ offset, limit, ...filters }),
    keepPreviousData: true,
  });
};

export const useGetInterviewsForApplication = (applicationId) => {
  return useQuery({
    queryKey: ['interviews', applicationId],
    queryFn: () => recruitmentService.getInterviewsForApplication(applicationId),
    enabled: !!applicationId,
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.scheduleInterview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', data.application_id] });
      queryClient.invalidateQueries({ queryKey: ['job-application', data.application_id] });
      queryClient.invalidateQueries({ queryKey: ['all-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, interviewData }) => recruitmentService.updateInterview(id, interviewData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-interviews'] });
      if (data.application_id) {
        queryClient.invalidateQueries({ queryKey: ['job-application', data.application_id] });
        queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      }
    },
  });
};

export const useGetEvaluationsForInterview = (interviewId) => {
  return useQuery({
    queryKey: ['interview-evaluations', interviewId],
    queryFn: () => recruitmentService.getEvaluationsForInterview(interviewId),
    enabled: !!interviewId,
  });
};

export const useSubmitInterviewEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.submitInterviewEvaluation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interview-evaluations', data.interview_id] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
};

// ========================================
// EMPLOYMENT OFFERS HOOKS
// ========================================

export const useGetEmploymentOffers = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['employment-offers', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getEmploymentOffers({ offset, limit, ...filters }),
  });
};

export const useGetEmploymentOfferById = (id) => {
  return useQuery({
    queryKey: ['employment-offer', id],
    queryFn: () => recruitmentService.getEmploymentOfferById(id),
    enabled: !!id,
  });
};

export const useCreateEmploymentOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createEmploymentOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-offers'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    },
  });
};

export const useUpdateEmploymentOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateEmploymentOffer(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employment-offers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-offer', variables.id] });
    },
  });
};

export const useApproveEmploymentOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.approveEmploymentOffer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['employment-offers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-offer', id] });
    },
  });
};

export const useSendEmploymentOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.sendEmploymentOffer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['employment-offers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-offer', id] });
    },
  });
};

export const useRespondToOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, responseData }) => recruitmentService.respondToOffer(id, responseData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employment-offers'] });
      queryClient.invalidateQueries({ queryKey: ['employment-offer', variables.id] });
    },
  });
};

// ========================================
// ONBOARDING HOOKS
// ========================================

export const useGetOnboardingChecklists = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['onboarding-checklists', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getOnboardingChecklists({ offset, limit, ...filters }),
  });
};

export const useGetOnboardingChecklistById = (id) => {
  return useQuery({
    queryKey: ['onboarding-checklist', id],
    queryFn: () => recruitmentService.getOnboardingChecklistById(id),
    enabled: !!id,
  });
};

export const useCreateOnboardingChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createOnboardingChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklists'] });
    },
  });
};

export const useUpdateOnboardingChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => recruitmentService.updateOnboardingChecklist(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklists'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist', variables.id] });
    },
  });
};

export const useAddOnboardingTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checklistId, taskData }) => recruitmentService.addOnboardingTask(checklistId, taskData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist', variables.checklistId] });
    },
  });
};

export const useUpdateOnboardingTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, updates }) => recruitmentService.updateOnboardingTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklists'] });
    },
  });
};

export const useGetTaskTemplates = () => {
  return useQuery({
    queryKey: ['task-templates'],
    queryFn: recruitmentService.getTaskTemplates,
  });
};

export const useCreateTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recruitmentService.createTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
    },
  });
};

// ========================================
// EMAIL HOOKS
// ========================================

export const useGetEmailTemplates = (params = {}) => {
  return useQuery({
    queryKey: ['email-templates', params],
    queryFn: () => recruitmentService.getEmailTemplates(params),
  });
};

export const useGetSentEmails = (params = {}) => {
  return useQuery({
    queryKey: ['sent-emails', params],
    queryFn: () => recruitmentService.getSentEmails(params),
  });
};

export const useGetRecruitmentEmails = (params = {}) => {
  return useQuery({
    queryKey: ['recruitment-emails', params],
    queryFn: () => recruitmentService.getRecruitmentEmails(params),
  });
};

export const useUpdateRecruitmentEmailStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusData }) => recruitmentService.updateRecruitmentEmailStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-emails'] });
    },
  });
};

// ========================================
// STATISTICS HOOKS
// ========================================

export const useGetRecruitmentStatistics = (params = {}) => {
  return useQuery({
    queryKey: ['recruitment-statistics', params],
    queryFn: () => recruitmentService.getRecruitmentStatistics(params),
  });
};
