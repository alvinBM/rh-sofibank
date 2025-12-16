import { supabase } from "../../lib/supabase-client";

/**
 * Service pour la gestion de la performance 360°
 * Gère les évaluations, KPIs et plans d'amélioration (PIP)
 */

// ==================== ÉVALUATIONS 360° ====================

/**
 * Récupère les évaluations avec filtres
 */
export const fetchEvaluations = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('evaluations')
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(id, first_name, last_name, employee_number, service_id, direction_id),
        evaluator:employees!evaluations_evaluator_id_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`employee.first_name.ilike.%${query}%,employee.last_name.ilike.%${query}%`);
    }

    if (filters.year) {
      queryBuilder = queryBuilder.eq('year', filters.year);
    }

    if (filters.quarter) {
      queryBuilder = queryBuilder.eq('quarter', filters.quarter);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.service_id) {
      queryBuilder = queryBuilder.eq('employee.service_id', filters.service_id);
    }

    if (filters.direction_id) {
      queryBuilder = queryBuilder.eq('employee.direction_id', filters.direction_id);
    }

    if (filters.employee_id) {
      queryBuilder = queryBuilder.eq('employee_id', filters.employee_id);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      evaluations: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch evaluations error:', error);
    throw error;
  }
};

/**
 * Récupère une évaluation par ID avec tous les détails
 */
export const fetchEvaluationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(*),
        evaluator:employees!evaluations_evaluator_id_fkey(*),
        self_evaluation:self_evaluations(*),
        supervisor_level1:supervisor_level1_evaluations(*),
        supervisor_level2:supervisor_level2_evaluations(*),
        peer_evaluations:peer_evaluations(*, peer:employees!peer_evaluations_peer_id_fkey(id, first_name, last_name)),
        subordinate_evaluations:subordinate_evaluations(*, subordinate:employees!subordinate_evaluations_subordinate_id_fkey(id, first_name, last_name)),
        hr_review:hr_reviews(*),
        kpi_scores:evaluation_kpi_scores(*, kpi:kpis(*))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch evaluation by id error:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle évaluation
 */
export const createEvaluation = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([{
        ...payload,
        status: 'draft',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create evaluation error:', error);
    throw error;
  }
};

/**
 * Met à jour une évaluation
 */
export const updateEvaluation = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update evaluation error:', error);
    throw error;
  }
};

/**
 * Soumet une auto-évaluation
 */
export const submitSelfEvaluation = async (evaluationId, payload) => {
  try {
    // Créer/Mettre à jour l'auto-évaluation
    const { data: selfEval, error: selfError } = await supabase
      .from('self_evaluations')
      .upsert({
        evaluation_id: evaluationId,
        ...payload,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (selfError) throw selfError;

    // Mettre à jour le statut de l'évaluation
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        status: 'self_evaluation',
        workflow_status: 'supervisor_review'
      })
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) throw error;
    return { evaluation: data, selfEvaluation: selfEval };
  } catch (error) {
    console.error('Submit self evaluation error:', error);
    throw error;
  }
};

/**
 * Soumet une évaluation par le supérieur niveau 1
 */
export const submitSupervisorLevel1Evaluation = async (evaluationId, payload) => {
  try {
    const { data: supEval, error: supError } = await supabase
      .from('supervisor_level1_evaluations')
      .upsert({
        evaluation_id: evaluationId,
        ...payload,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (supError) throw supError;

    const { data, error } = await supabase
      .from('evaluations')
      .update({
        status: 'supervisor_review',
        workflow_status: 'hr_review'
      })
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) throw error;
    return { evaluation: data, supervisorEvaluation: supEval };
  } catch (error) {
    console.error('Submit supervisor level 1 evaluation error:', error);
    throw error;
  }
};

/**
 * Soumet une évaluation par les pairs
 */
export const submitPeerEvaluation = async (evaluationId, peerId, payload) => {
  try {
    const { data, error } = await supabase
      .from('peer_evaluations')
      .insert([{
        evaluation_id: evaluationId,
        peer_id: peerId,
        ...payload,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Submit peer evaluation error:', error);
    throw error;
  }
};

/**
 * Finalise l'évaluation (RH)
 */
export const finalizeEvaluation = async (evaluationId, hrUserId, payload) => {
  try {
    // Créer la revue finale RH
    const { data: hrReview, error: hrError } = await supabase
      .from('hr_reviews')
      .upsert({
        evaluation_id: evaluationId,
        reviewer_id: hrUserId,
        ...payload,
        reviewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (hrError) throw hrError;

    // Mettre à jour le statut
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        status: 'hr_review',
        workflow_status: 'dg_approval',
        final_score: payload.final_score
      })
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) throw error;
    return { evaluation: data, hrReview };
  } catch (error) {
    console.error('Finalize evaluation error:', error);
    throw error;
  }
};

/**
 * Approuve l'évaluation (DG)
 */
export const approveEvaluationByDG = async (evaluationId, dgUserId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        status: 'completed',
        workflow_status: 'completed',
        approved_by: dgUserId,
        approved_at: new Date().toISOString(),
        dg_comments: comments
      })
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Approve evaluation by DG error:', error);
    throw error;
  }
};

// ==================== KPIs ====================

/**
 * Récupère les KPIs avec filtres
 */
export const fetchKPIs = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('kpis')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('category', { ascending: true });

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters.position) {
      queryBuilder = queryBuilder.eq('position', filters.position);
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', filters.is_active);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      kpis: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch KPIs error:', error);
    throw error;
  }
};

/**
 * Récupère un KPI par ID
 */
export const fetchKPIById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch KPI by id error:', error);
    throw error;
  }
};

/**
 * Crée un KPI
 */
export const createKPI = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('kpis')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create KPI error:', error);
    throw error;
  }
};

/**
 * Met à jour un KPI
 */
export const updateKPI = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('kpis')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update KPI error:', error);
    throw error;
  }
};

/**
 * Supprime un KPI
 */
export const deleteKPI = async (id) => {
  try {
    const { error } = await supabase
      .from('kpis')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete KPI error:', error);
    throw error;
  }
};

/**
 * Récupère les KPIs par fonction/poste
 */
export const fetchKPIsByPosition = async (position) => {
  try {
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .order('weight', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch KPIs by position error:', error);
    throw error;
  }
};

// ==================== PLANS D'AMÉLIORATION (PIP) ====================

/**
 * Récupère les PIPs avec filtres
 */
export const fetchPIPs = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('performance_improvement_plans')
      .select(`
        *,
        employee:employees!performance_improvement_plans_employee_id_fkey(id, first_name, last_name, employee_number, service_id, direction_id),
        evaluation:evaluations(id, year, quarter, final_score),
        supervisor:employees!performance_improvement_plans_supervisor_id_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`employee.first_name.ilike.%${query}%,employee.last_name.ilike.%${query}%`);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.employee_id) {
      queryBuilder = queryBuilder.eq('employee_id', filters.employee_id);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      pips: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch PIPs error:', error);
    throw error;
  }
};

/**
 * Récupère un PIP par ID avec détails
 */
export const fetchPIPById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('performance_improvement_plans')
      .select(`
        *,
        employee:employees!performance_improvement_plans_employee_id_fkey(*),
        evaluation:evaluations(*),
        supervisor:employees!performance_improvement_plans_supervisor_id_fkey(*),
        follow_ups:pip_follow_ups(*, reviewer:employees!pip_follow_ups_reviewed_by_fkey(id, first_name, last_name))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch PIP by id error:', error);
    throw error;
  }
};

/**
 * Crée un PIP
 */
export const createPIP = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('performance_improvement_plans')
      .insert([{
        ...payload,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create PIP error:', error);
    throw error;
  }
};

/**
 * Met à jour un PIP
 */
export const updatePIP = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('performance_improvement_plans')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update PIP error:', error);
    throw error;
  }
};

/**
 * Ajoute un suivi mensuel à un PIP
 */
export const addPIPFollowUp = async (pipId, payload) => {
  try {
    const { data, error } = await supabase
      .from('pip_follow_ups')
      .insert([{
        pip_id: pipId,
        ...payload,
        follow_up_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Add PIP follow-up error:', error);
    throw error;
  }
};

/**
 * Clôture un PIP
 */
export const closePIP = async (id, outcome, finalComments) => {
  try {
    const { data, error } = await supabase
      .from('performance_improvement_plans')
      .update({
        status: outcome === 'improved' ? 'completed' : 'failed',
        outcome: outcome,
        final_comments: finalComments,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Close PIP error:', error);
    throw error;
  }
};

/**
 * Récupère les PIPs arrivant à échéance
 */
export const fetchExpiringPIPs = async (daysThreshold = 30) => {
  try {
    const { data, error } = await supabase.rpc('get_expiring_pips', {
      days_threshold: daysThreshold
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch expiring PIPs error:', error);
    throw error;
  }
};

// ==================== STATISTIQUES ====================

/**
 * Récupère les statistiques d'évaluation
 */
export const fetchEvaluationStats = async (year, quarter = null) => {
  try {
    const { data, error } = await supabase.rpc('get_evaluation_stats', {
      target_year: year,
      target_quarter: quarter
    });

    if (error) throw error;
    return data || {
      total_evaluations: 0,
      completed_evaluations: 0,
      average_score: 0,
      completion_rate: 0
    };
  } catch (error) {
    console.error('Fetch evaluation stats error:', error);
    throw error;
  }
};

/**
 * Récupère la distribution des scores
 */
export const fetchScoreDistribution = async (year) => {
  try {
    const { data, error } = await supabase.rpc('get_score_distribution', {
      target_year: year
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch score distribution error:', error);
    throw error;
  }
};
