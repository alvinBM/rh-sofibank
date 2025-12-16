import { supabase } from "../../lib/supabase-client";

/**
 * Service pour la gestion de la paie
 * Gère les exécutions de paie, éléments variables, paramètres et distribution
 */

// ==================== EXÉCUTIONS DE PAIE (PAYROLL RUNS) ====================

/**
 * Récupère les exécutions de paie avec filtres
 */
export const fetchPayrollRuns = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('payroll_runs')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`period.ilike.%${query}%`);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.year) {
      queryBuilder = queryBuilder.eq('year', filters.year);
    }

    if (filters.month) {
      queryBuilder = queryBuilder.eq('month', filters.month);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      runs: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch payroll runs error:', error);
    throw error;
  }
};

/**
 * Récupère une exécution de paie par ID avec les détails
 */
export const fetchPayrollRunById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_details:payroll_details(
          *,
          employee:employees!payroll_details_employee_id_fkey(id, first_name, last_name, employee_number)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch payroll run by id error:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle exécution de paie
 */
export const createPayrollRun = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
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
    console.error('Create payroll run error:', error);
    throw error;
  }
};

/**
 * Traite une exécution de paie (calcul pour tous les employés)
 */
export const processPayrollRun = async (runId) => {
  try {
    const { data, error } = await supabase.rpc('process_payroll_run', {
      run_id: runId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Process payroll run error:', error);
    throw error;
  }
};

/**
 * Approuve une exécution de paie
 */
export const approvePayrollRun = async (runId, approvedBy) => {
  try {
    const { data, error } = await supabase
      .from('payroll_runs')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', runId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Approve payroll run error:', error);
    throw error;
  }
};

/**
 * Distribue les bulletins de paie
 */
export const distributePayslips = async (runId, distributionMethod = 'email') => {
  try {
    const { data, error } = await supabase.rpc('distribute_payslips', {
      run_id: runId,
      method: distributionMethod
    });

    if (error) throw error;

    // Met à jour le statut
    await supabase
      .from('payroll_runs')
      .update({
        status: 'paid',
        distributed_at: new Date().toISOString()
      })
      .eq('id', runId);

    return data;
  } catch (error) {
    console.error('Distribute payslips error:', error);
    throw error;
  }
};

// ==================== DÉTAILS DE PAIE ====================

/**
 * Récupère les détails de paie pour une exécution
 */
export const fetchPayrollDetails = async (runId) => {
  try {
    const { data, error } = await supabase
      .from('payroll_details')
      .select(`
        *,
        employee:employees!payroll_details_employee_id_fkey(id, first_name, last_name, employee_number)
      `)
      .eq('payroll_run_id', runId)
      .order('employee.last_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch payroll details error:', error);
    throw error;
  }
};

/**
 * Met à jour un détail de paie individuel
 */
export const updatePayrollDetail = async (detailId, payload) => {
  try {
    const { data, error } = await supabase
      .from('payroll_details')
      .update(payload)
      .eq('id', detailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update payroll detail error:', error);
    throw error;
  }
};

// ==================== ÉLÉMENTS VARIABLES ====================

/**
 * Récupère les éléments variables de paie
 */
export const fetchPayrollVariables = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('payroll_variables')
      .select(`
        *,
        employee:employees!payroll_variables_employee_id_fkey(id, first_name, last_name, employee_number)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`employee.first_name.ilike.%${query}%,employee.last_name.ilike.%${query}%`);
    }

    if (filters.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    if (filters.employee_id) {
      queryBuilder = queryBuilder.eq('employee_id', filters.employee_id);
    }

    if (filters.period) {
      queryBuilder = queryBuilder.eq('period', filters.period);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      variables: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch payroll variables error:', error);
    throw error;
  }
};

/**
 * Crée un élément variable
 */
export const createPayrollVariable = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('payroll_variables')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create payroll variable error:', error);
    throw error;
  }
};

/**
 * Met à jour un élément variable
 */
export const updatePayrollVariable = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('payroll_variables')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update payroll variable error:', error);
    throw error;
  }
};

/**
 * Supprime un élément variable
 */
export const deletePayrollVariable = async (id) => {
  try {
    const { error } = await supabase
      .from('payroll_variables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete payroll variable error:', error);
    throw error;
  }
};

// ==================== PARAMÈTRES DE PAIE ====================

/**
 * Récupère les paramètres de paie
 */
export const fetchPayrollSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('payroll_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data || {
      irpp_rate: 0,
      periodicity: 'monthly',
      payment_day: 24,
      currency: 'XOF'
    };
  } catch (error) {
    console.error('Fetch payroll settings error:', error);
    throw error;
  }
};

/**
 * Met à jour les paramètres de paie
 */
export const updatePayrollSettings = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('payroll_settings')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update payroll settings error:', error);
    throw error;
  }
};

/**
 * Récupère les taux d'imposition configurables
 */
export const fetchTaxRates = async () => {
  try {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .order('min_salary', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch tax rates error:', error);
    throw error;
  }
};

/**
 * Met à jour un taux d'imposition
 */
export const updateTaxRate = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('tax_rates')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update tax rate error:', error);
    throw error;
  }
};

// ==================== BULLETINS DE PAIE ====================

/**
 * Génère un bulletin de paie PDF
 */
export const generatePayslipPDF = async (payrollDetailId) => {
  try {
    const { data, error } = await supabase.rpc('generate_payslip_pdf', {
      detail_id: payrollDetailId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Generate payslip PDF error:', error);
    throw error;
  }
};

/**
 * Récupère l'historique de distribution
 */
export const fetchDistributionHistory = async (runId) => {
  try {
    const { data, error } = await supabase
      .from('payslip_distributions')
      .select(`
        *,
        employee:employees(id, first_name, last_name, email)
      `)
      .eq('payroll_run_id', runId)
      .order('distributed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch distribution history error:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques de paie
 */
export const fetchPayrollStats = async (year) => {
  try {
    const { data, error } = await supabase.rpc('get_payroll_stats', {
      target_year: year
    });

    if (error) throw error;
    return data || {
      total_gross_paid: 0,
      total_net_paid: 0,
      total_employees: 0,
      average_salary: 0,
      total_taxes: 0
    };
  } catch (error) {
    console.error('Fetch payroll stats error:', error);
    throw error;
  }
};

/**
 * Calcule le prochain jour de paiement
 */
export const calculateNextPaymentDate = (year, month, paymentDay = 24) => {
  let paymentDate = new Date(year, month - 1, paymentDay);

  // Si c'est un weekend, décaler au dernier jour ouvrable
  const dayOfWeek = paymentDate.getDay();
  if (dayOfWeek === 0) { // Dimanche
    paymentDate.setDate(paymentDate.getDate() - 2);
  } else if (dayOfWeek === 6) { // Samedi
    paymentDate.setDate(paymentDate.getDate() - 1);
  }

  return paymentDate.toISOString().split('T')[0];
};
