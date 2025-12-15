import { supabase } from '@/src/lib/supabase-client';

// ==================== WORKFORCE PLANNING ====================

export const getWorkforcePlannings = async (filters = {}) => {
  let query = supabase
    .from('workforce_planning')
    .select(`
      *,
      direction:directions(id, name, code),
      submitted_by_user:submitted_by(id, email, firstname, lastname),
      hr_reviewed_by_user:hr_reviewed_by(id, email, firstname, lastname),
      dg_approved_by_user:dg_approved_by(id, email, firstname, lastname)
    `)
    .order('created_at', { ascending: false });

  if (filters.year) {
    query = query.eq('year', filters.year);
  }
  if (filters.direction_id) {
    query = query.eq('direction_id', filters.direction_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getWorkforcePlanningById = async (id) => {
  const { data, error } = await supabase
    .from('workforce_planning')
    .select(`
      *,
      direction:directions(id, name, code),
      items:workforce_planning_items(
        *,
        job_position:job_positions(id, title, code),
        grade:grades(id, name, code, base_salary),
        service:services(id, name, code),
        replacing_employee:employees(id, employee_number, first_name, last_name)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createWorkforcePlanning = async (planningData) => {
  const { data, error } = await supabase
    .from('workforce_planning')
    .insert([planningData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWorkforcePlanning = async (id, updates) => {
  const { data, error } = await supabase
    .from('workforce_planning')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWorkforcePlanning = async (id) => {
  const { error } = await supabase
    .from('workforce_planning')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== WORKFORCE PLANNING ITEMS ====================

export const createPlanningItem = async (itemData) => {
  const { data, error } = await supabase
    .from('workforce_planning_items')
    .insert([itemData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlanningItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('workforce_planning_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePlanningItem = async (id) => {
  const { error } = await supabase
    .from('workforce_planning_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== JOB OPENINGS ====================

export const getJobOpenings = async (filters = {}) => {
  let query = supabase
    .from('job_openings')
    .select(`
      *,
      job_position:job_positions(id, title, code),
      direction:directions(id, name, code),
      service:services(id, name, code),
      grade:grades(id, name, code, base_salary),
      created_by_user:created_by(id, email, firstname, lastname),
      candidates:candidates(count)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.direction_id) {
    query = query.eq('direction_id', filters.direction_id);
  }
  if (filters.is_published !== undefined) {
    query = query.eq('is_published', filters.is_published);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getJobOpeningById = async (id) => {
  const { data, error } = await supabase
    .from('job_openings')
    .select(`
      *,
      job_position:job_positions(id, title, code, description),
      direction:directions(id, name, code),
      service:services(id, name, code),
      grade:grades(id, name, code, base_salary),
      candidates:candidates(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createJobOpening = async (jobData) => {
  const { data, error } = await supabase
    .from('job_openings')
    .insert([jobData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateJobOpening = async (id, updates) => {
  const { data, error } = await supabase
    .from('job_openings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const publishJobOpening = async (id) => {
  const { data, error } = await supabase
    .from('job_openings')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      status: 'open'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteJobOpening = async (id) => {
  const { error } = await supabase
    .from('job_openings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== CANDIDATES ====================

export const getCandidates = async (filters = {}) => {
  let query = supabase
    .from('candidates')
    .select(`
      *,
      job_opening:job_openings(id, title, job_number),
      interviews:candidate_interviews(count),
      evaluations:candidate_evaluations(count)
    `)
    .order('application_date', { ascending: false });

  if (filters.job_opening_id) {
    query = query.eq('job_opening_id', filters.job_opening_id);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getCandidateById = async (id) => {
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      *,
      job_opening:job_openings(*),
      interviews:candidate_interviews(*),
      evaluations:candidate_evaluations(
        *,
        evaluator:evaluator_id(id, email, firstname, lastname)
      ),
      job_offers:job_offers(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createCandidate = async (candidateData) => {
  const { data, error } = await supabase
    .from('candidates')
    .insert([candidateData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCandidate = async (id, updates) => {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCandidate = async (id) => {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== CANDIDATE INTERVIEWS ====================

export const getInterviews = async (candidateId) => {
  const { data, error } = await supabase
    .from('candidate_interviews')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, candidate_number)
    `)
    .eq('candidate_id', candidateId)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const createInterview = async (interviewData) => {
  const { data, error } = await supabase
    .from('candidate_interviews')
    .insert([interviewData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInterview = async (id, updates) => {
  const { data, error } = await supabase
    .from('candidate_interviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== CANDIDATE EVALUATIONS ====================

export const getEvaluations = async (candidateId) => {
  const { data, error } = await supabase
    .from('candidate_evaluations')
    .select(`
      *,
      evaluator:evaluator_id(id, email, firstname, lastname),
      interview:candidate_interviews(id, interview_type, scheduled_date)
    `)
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createEvaluation = async (evaluationData) => {
  const { data, error } = await supabase
    .from('candidate_evaluations')
    .insert([evaluationData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvaluation = async (id, updates) => {
  const { data, error } = await supabase
    .from('candidate_evaluations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== JOB OFFERS ====================

export const getJobOffers = async (filters = {}) => {
  let query = supabase
    .from('job_offers')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email, phone),
      job_opening:job_openings(id, title, job_number),
      created_by_user:created_by(id, email, firstname, lastname)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.candidate_id) {
    query = query.eq('candidate_id', filters.candidate_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createJobOffer = async (offerData) => {
  const { data, error } = await supabase
    .from('job_offers')
    .insert([offerData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateJobOffer = async (id, updates) => {
  const { data, error } = await supabase
    .from('job_offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== SOCIAL MEDIA POSTS ====================

export const getSocialMediaPosts = async (jobOpeningId) => {
  const { data, error } = await supabase
    .from('social_media_posts')
    .select('*')
    .eq('job_opening_id', jobOpeningId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createSocialMediaPost = async (postData) => {
  const { data, error } = await supabase
    .from('social_media_posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSocialMediaPost = async (id, updates) => {
  const { data, error } = await supabase
    .from('social_media_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
