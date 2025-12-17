import apiClient from "../api-client";

// ========================================
// STAGE 1: RECRUITMENT PLANS
// ========================================

/**
 * Get all recruitment plans with filters
 */
export const getRecruitmentPlans = async ({ offset = 0, limit = 10, year, direction_id, status, query } = {}) => {
    let requestUrl = `/recruitment/plans?offset=${offset}&limit=${limit}`;
    
    if (year) requestUrl += `&year=${year}`;
    if (direction_id) requestUrl += `&direction_id=${direction_id}`;
    if (status) requestUrl += `&status=${status}`;
    if (query) requestUrl += `&query=${query}`;

    const data = await apiClient.get(requestUrl);

    console.log("RECRUITMENT PLANS DATA ", data);

    if (data.status === 200) {
        return {
            plans: data.plans,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch recruitment plans');
    }
};

/**
 * Get a single recruitment plan by ID
 */
export const getRecruitmentPlanById = async (id) => {
    const { data } = await apiClient.get(`/recruitment/plans/${id}`);
    return data;
};

/**
 * Create a new recruitment plan
 */
export const createRecruitmentPlan = async (planData) => {
    const { data } = await apiClient.post("/recruitment/plans", planData);
    return data;
};

/**
 * Update a recruitment plan
 */
export const updateRecruitmentPlan = async (id, updates) => {
    const { data } = await apiClient.put(`/recruitment/plans/${id}`, updates);
    return data;
};

/**
 * Submit recruitment plan for approval
 */
export const submitRecruitmentPlan = async (id) => {
    const { data } = await apiClient.post(`/recruitment/plans/${id}/submit`);
    return data;
};

/**
 * Approve or reject recruitment plan
 */
export const approveRecruitmentPlan = async (id, approvalData) => {
    const { data } = await apiClient.post(`/recruitment/plans/${id}/approve`, approvalData);
    return data;
};

/**
 * Add position to recruitment plan
 */
export const addPositionToPlan = async (planId, positionData) => {
    const { data } = await apiClient.post(`/recruitment/plans/${planId}/positions`, positionData);
    return data;
};

/**
 * Update plan position
 */
export const updatePlanPosition = async (positionId, updates) => {
    const { data } = await apiClient.put(`/recruitment/plan-positions/${positionId}`, updates);
    return data;
};

/**
 * Delete plan position
 */
export const deletePlanPosition = async (positionId) => {
    const { data } = await apiClient.delete(`/recruitment/plan-positions/${positionId}`);
    return data;
};

// ========================================
// STAGE 2: JOB POSTINGS
// ========================================

/**
 * Get all job postings with filters
 */
export const getJobPostings = async ({ offset = 0, limit = 10, status, plan_id, job_position_id, query } = {}) => {
    let requestUrl = `/recruitment/postings?offset=${offset}&limit=${limit}`;
    
    if (status) requestUrl += `&status=${status}`;
    if (plan_id) requestUrl += `&plan_id=${plan_id}`;
    if (job_position_id) requestUrl += `&job_position_id=${job_position_id}`;
    if (query) requestUrl += `&query=${query}`;

    const data = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            postings: data.postings,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch job postings');
    }
};

/**
 * Get a single job posting by ID
 */
export const getJobPostingById = async (id) => {
    const { data } = await apiClient.get(`/recruitment/postings/${id}`);
    return data;
};

/**
 * Get a single job posting by ID (Public - no auth)
 */
export const getPublicJobPostingById = async (id) => {
    const data = await apiClient.get(`/recruitment/postings/${id}/public`);
    return data;
};

/**
 * Create a new job posting
 */
export const createJobPosting = async (postingData) => {
    const { data } = await apiClient.post("/recruitment/postings", postingData);
    return data;
};

/**
 * Update a job posting
 */
export const updateJobPosting = async (id, updates) => {
    const { data } = await apiClient.put(`/recruitment/postings/${id}`, updates);
    return data;
};

/**
 * Publish a job posting
 */
export const publishJobPosting = async (id) => {
    const { data } = await apiClient.post(`/recruitment/postings/${id}/publish`);
    return data;
};

/**
 * Close a job posting
 */
export const closeJobPosting = async (id, closeData) => {
    const { data } = await apiClient.post(`/recruitment/postings/${id}/close`, closeData);
    return data;
};

// ========================================
// STAGE 3: JOB APPLICATIONS
// ========================================

/**
 * Get all job applications with filters
 */
export const getJobApplications = async ({ offset = 0, limit = 10, status, posting_id, assigned_to, query, sort, order } = {}) => {
    let requestUrl = `/recruitment/applications?offset=${offset}&limit=${limit}`;
    
    if (status) requestUrl += `&status=${status}`;
    if (posting_id) requestUrl += `&posting_id=${posting_id}`;
    if (assigned_to) requestUrl += `&assigned_to=${assigned_to}`;
    if (query) requestUrl += `&query=${query}`;
    if (sort) requestUrl += `&sort=${sort}`;
    if (order) requestUrl += `&order=${order}`;

    const data = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            applications: data.applications,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch job applications');
    }
};

/**
 * Get a single job application by ID
 */
export const getJobApplicationById = async (id) => {
    const { data } = await apiClient.get(`/recruitment/applications/${id}`);
    return data;
};

/**
 * Create a new job application
 */
export const createJobApplication = async (applicationData) => {
    const { data } = await apiClient.post("/recruitment/applications", applicationData);
    return data;
};

/**
 * Update a job application
 */
export const updateJobApplication = async (id, updates) => {
    const { data } = await apiClient.put(`/recruitment/applications/${id}`, updates);
    return data;
};

/**
 * Assign application to user
 */
export const assignApplication = async (id, assignData) => {
    const { data } = await apiClient.post(`/recruitment/applications/${id}/assign`, assignData);
    return data;
};

/**
 * Rate an application
 */
export const rateApplication = async (id, ratingData) => {
    const { data } = await apiClient.post(`/recruitment/applications/${id}/rate`, ratingData);
    return data;
};

// ========================================
// STAGE 3B: INTERVIEWS & EVALUATIONS
// ========================================

/**
 * Get all interviews with filters and pagination
 */
export const getAllInterviews = async ({ offset = 0, limit = 10, status, type, date, query } = {}) => {
    let requestUrl = `/recruitment/interviews?offset=${offset}&limit=${limit}`;
    
    if (status) requestUrl += `&status=${status}`;
    if (type) requestUrl += `&type=${type}`;
    if (date) requestUrl += `&date=${date}`;
    if (query) requestUrl += `&query=${query}`;

    const data = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            interviews: data.interviews,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch interviews');
    }
};

/**
 * Get interviews for an application
 */
export const getInterviewsForApplication = async (applicationId) => {
    const { data } = await apiClient.get(`/recruitment/applications/${applicationId}/interviews`);
    return data;
};

/**
 * Schedule an interview
 */
export const scheduleInterview = async (interviewData) => {
    const { data } = await apiClient.post("/recruitment/interviews", interviewData);
    return data;
};

/**
 * Update an interview
 */
export const updateInterview = async (id, interviewData) => {
    const { data } = await apiClient.put(`/recruitment/interviews/${id}`, interviewData);
    return data;
};

/**
 * Get evaluations for an interview
 */
export const getEvaluationsForInterview = async (interviewId) => {
    const { data } = await apiClient.get(`/recruitment/interviews/${interviewId}/evaluations`);
    return data;
};

/**
 * Submit interview evaluation
 */
export const submitInterviewEvaluation = async ({ interviewId, evaluationData }) => {
    const { data } = await apiClient.post("/recruitment/evaluations", {
        interview_id: interviewId,
        ...evaluationData
    });
    return data;
};

// ========================================
// STAGE 4: EMPLOYMENT OFFERS
// ========================================

/**
 * Get all employment offers with filters
 */
export const getEmploymentOffers = async ({ offset = 0, limit = 10, status, direction_id, application_id, query } = {}) => {
    let requestUrl = `/recruitment/offers?offset=${offset}&limit=${limit}`;
    if (status) requestUrl += `&status=${status}`;
    if (direction_id) requestUrl += `&direction_id=${direction_id}`;
    if (application_id) requestUrl += `&application_id=${application_id}`;
    if (query) requestUrl += `&query=${query}`;

    const { data } = await apiClient.get(requestUrl);
    
    if (data.status === 200) {
        return { offers: data.offers, total: data.total };
    }
    
    throw new Error(data.message || "Failed to fetch employment offers");
};

/**
 * Get a single employment offer by ID
 */
export const getEmploymentOfferById = async (id) => {
    const { data } = await apiClient.get(`/recruitment/offers/${id}`);
    return data;
};

/**
 * Create a new employment offer
 */
export const createEmploymentOffer = async (offerData) => {
    const { data } = await apiClient.post("/recruitment/offers", offerData);
    return data;
};

/**
 * Update an employment offer
 */
export const updateEmploymentOffer = async (id, updates) => {
    const { data } = await apiClient.put(`/recruitment/offers/${id}`, updates);
    return data;
};

/**
 * Approve an employment offer
 */
export const approveEmploymentOffer = async (id) => {
    const { data } = await apiClient.post(`/recruitment/offers/${id}/approve`);
    return data;
};

/**
 * Send employment offer to candidate
 */
export const sendEmploymentOffer = async (id) => {
    const { data } = await apiClient.post(`/recruitment/offers/${id}/send`);
    return data;
};

/**
 * Candidate response to offer
 */
export const respondToOffer = async (id, responseData) => {
    const { data } = await apiClient.post(`/recruitment/offers/${id}/respond`, responseData);
    return data;
};

// ========================================
// STAGE 5: ONBOARDING
// ========================================

/**
 * Get all onboarding checklists with filters
 */
export const getOnboardingChecklists = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/onboarding", { params });
    return data;
};

/**
 * Get a single onboarding checklist by ID
 */
export const getOnboardingChecklistById = async (id) => {
    const { data } = await apiClient.get(`/recruitment/onboarding/${id}`);
    return data;
};

/**
 * Create a new onboarding checklist
 */
export const createOnboardingChecklist = async (checklistData) => {
    const { data } = await apiClient.post("/recruitment/onboarding", checklistData);
    return data;
};

/**
 * Update an onboarding checklist
 */
export const updateOnboardingChecklist = async (id, updates) => {
    const { data } = await apiClient.put(`/recruitment/onboarding/${id}`, updates);
    return data;
};

/**
 * Add task to checklist
 */
export const addOnboardingTask = async (checklistId, taskData) => {
    const { data } = await apiClient.post(`/recruitment/onboarding/${checklistId}/tasks`, taskData);
    return data;
};

/**
 * Update onboarding task
 */
export const updateOnboardingTask = async (taskId, updates) => {
    const { data } = await apiClient.put(`/recruitment/tasks/${taskId}`, updates);
    return data;
};

/**
 * Get task templates
 */
export const getTaskTemplates = async () => {
    const { data } = await apiClient.get("/recruitment/task-templates");
    return data;
};

/**
 * Create task template
 */
export const createTaskTemplate = async (templateData) => {
    const { data } = await apiClient.post("/recruitment/task-templates", templateData);
    return data;
};

// ========================================
// EMAIL MANAGEMENT
// ========================================

/**
 * Get email templates
 */
export const getEmailTemplates = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/email-templates", { params });
    return data;
};

/**
 * Get sent emails
 */
export const getSentEmails = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/sent-emails", { params });
    return data;
};

/**
 * Get recruitment emails (incoming)
 */
export const getRecruitmentEmails = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/recruitment-emails", { params });
    return data;
};

/**
 * Update recruitment email status
 */
export const updateRecruitmentEmailStatus = async (id, statusData) => {
    const { data } = await apiClient.put(`/recruitment/recruitment-emails/${id}`, statusData);
    return data;
};

// ========================================
// STATISTICS & REPORTS
// ========================================

/**
 * Get recruitment statistics
 */
export const getRecruitmentStatistics = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/statistics", { params });
    return data;
};
