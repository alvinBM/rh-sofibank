import apiClient from '../api-client';

/**
 * Service pour les dashboards et rapports
 * Gère les tableaux de bord RH, rapports personnalisés et alertes
 */

// ==================== DASHBOARD RH PRINCIPAL ====================

/**
 * Récupère les indicateurs clés du dashboard RH
 */
export const fetchHRDashboardMetrics = async (filters = {}) => {
  try {
    const { data, error } = await supabase.rpc('get_hr_dashboard_metrics', {
      dept_id: filters.department_id || null,
      start_date: filters.start_date || null,
      end_date: filters.end_date || null
    });

    if (error) throw error;
    return data || {
      total_employees: 0,
      employees_by_gender: { male: 0, female: 0 },
      employees_by_department: [],
      employees_by_grade: [],
      total_salary_cost: 0,
      monthly_salary_cost: 0,
      turnover_rate: 0,
      new_hires: 0,
      exits: 0,
      absenteeism_rate: 0,
      average_recruitment_days: 0,
      average_evaluation_score: 0
    };
  } catch (error) {
    console.error('Fetch HR dashboard metrics error:', error);
    throw error;
  }
};

/**
 * Récupère l'évolution de l'effectif
 */
export const fetchHeadcountTrend = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase.rpc('get_headcount_trend', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch headcount trend error:', error);
    throw error;
  }
};

/**
 * Récupère la répartition par genre
 */
export const fetchGenderDistribution = async () => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('gender')
      .eq('status', 'active');

    if (error) throw error;

    const distribution = (data || []).reduce((acc, emp) => {
      const gender = emp.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  } catch (error) {
    console.error('Fetch gender distribution error:', error);
    throw error;
  }
};

/**
 * Récupère la répartition par département
 */
export const fetchDepartmentDistribution = async () => {
  try {
    const { data, error } = await supabase.rpc('get_department_distribution');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch department distribution error:', error);
    throw error;
  }
};

/**
 * Récupère les coûts salariaux mensuels
 */
export const fetchMonthlySalaryCosts = async (year) => {
  try {
    const { data, error } = await supabase.rpc('get_monthly_salary_costs', {
      target_year: year
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch monthly salary costs error:', error);
    throw error;
  }
};

/**
 * Récupère l'absentéisme mensuel
 */
export const fetchMonthlyAbsenteeism = async (year) => {
  try {
    const { data, error } = await supabase.rpc('get_monthly_absenteeism', {
      target_year: year
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch monthly absenteeism error:', error);
    throw error;
  }
};

/**
 * Récupère le pipeline de recrutement
 */
export const fetchRecruitmentPipeline = async () => {
  try {
    const { data, error } = await supabase.rpc('get_recruitment_pipeline');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch recruitment pipeline error:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques de rotation du personnel
 */
export const fetchTurnoverStats = async (year) => {
  try {
    const { data, error } = await supabase.rpc('get_turnover_stats', {
      target_year: year
    });

    if (error) throw error;
    return data || {
      total_exits: 0,
      voluntary_exits: 0,
      involuntary_exits: 0,
      turnover_rate: 0,
      average_tenure: 0
    };
  } catch (error) {
    console.error('Fetch turnover stats error:', error);
    throw error;
  }
};

// ==================== RAPPORTS PERSONNALISÉS ====================

/**
 * Récupère les templates de rapports sauvegardés
 */
export const fetchReportTemplates = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .or(`created_by.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch report templates error:', error);
    throw error;
  }
};

/**
 * Crée un template de rapport
 */
export const createReportTemplate = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create report template error:', error);
    throw error;
  }
};

/**
 * Met à jour un template de rapport
 */
export const updateReportTemplate = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update report template error:', error);
    throw error;
  }
};

/**
 * Supprime un template de rapport
 */
export const deleteReportTemplate = async (id) => {
  try {
    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete report template error:', error);
    throw error;
  }
};

/**
 * Génère un rapport personnalisé
 */
export const generateCustomReport = async (config) => {
  try {
    const { data, error } = await supabase.rpc('generate_custom_report', {
      report_config: config
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Generate custom report error:', error);
    throw error;
  }
};

/**
 * Récupère les rapports planifiés
 */
export const fetchScheduledReports = async () => {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select(`
        *,
        template:report_templates(*),
        created_by_user:created_by(id, first_name, last_name, email)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch scheduled reports error:', error);
    throw error;
  }
};

/**
 * Crée un rapport planifié
 */
export const createScheduledReport = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create scheduled report error:', error);
    throw error;
  }
};

/**
 * Exporte un rapport
 */
export const exportReport = async (reportId, format = 'excel') => {
  try {
    const { data, error } = await supabase.rpc('export_report', {
      report_id: reportId,
      export_format: format
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Export report error:', error);
    throw error;
  }
};

// ==================== ALERTES ====================

/**
 * Récupère les alertes actives
 */
export const fetchAlerts = async ({ offset, limit, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('hr_alerts')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (filters.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    if (filters.severity) {
      queryBuilder = queryBuilder.eq('severity', filters.severity);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      alerts: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch alerts error:', error);
    throw error;
  }
};

/**
 * Crée une alerte
 */
export const createAlert = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('hr_alerts')
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
    console.error('Create alert error:', error);
    throw error;
  }
};

/**
 * Acquitte une alerte
 */
export const acknowledgeAlert = async (id, userId) => {
  try {
    const { data, error } = await supabase
      .from('hr_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    throw error;
  }
};

/**
 * Résout une alerte
 */
export const resolveAlert = async (id, userId, resolution) => {
  try {
    const { data, error } = await supabase
      .from('hr_alerts')
      .update({
        status: 'resolved',
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        resolution: resolution
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Resolve alert error:', error);
    throw error;
  }
};

/**
 * Récupère les seuils d'alerte configurés
 */
export const fetchAlertThresholds = async () => {
  try {
    const { data, error } = await supabase
      .from('alert_thresholds')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch alert thresholds error:', error);
    throw error;
  }
};

/**
 * Met à jour un seuil d'alerte
 */
export const updateAlertThreshold = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('alert_thresholds')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update alert threshold error:', error);
    throw error;
  }
};

/**
 * Vérifie et génère les alertes automatiques
 */
export const checkAndGenerateAlerts = async () => {
  try {
    const { data, error } = await supabase.rpc('check_and_generate_alerts');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Check and generate alerts error:', error);
    throw error;
  }
};

/**
 * Récupère le nombre d'alertes actives par type
 */
export const fetchAlertCounts = async () => {
  try {
    const { data, error } = await supabase.rpc('get_alert_counts');

    if (error) throw error;
    return data || {
      total_active: 0,
      by_type: {},
      by_severity: {}
    };
  } catch (error) {
    console.error('Fetch alert counts error:', error);
    throw error;
  }
};
