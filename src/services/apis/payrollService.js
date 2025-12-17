import apiClient from '../api-client';

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
    const params = new URLSearchParams();
    params.append('offset', offset);
    params.append('limit', limit);
    if (query) params.append('search', query);
    if (filters.status) params.append('status', filters.status);
    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);

    const response = await apiClient.get(`/payroll/runs?${params.toString()}`);
    
    return {
      runs: response.data?.runs || [],
      total: response.data?.total || 0,
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
    const response = await apiClient.get(`/payroll/runs/${id}`);
    return response.data;
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
    const response = await apiClient.post('/payroll/runs', payload);
    return response.data;
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
    const response = await apiClient.post(`/payroll/runs/${runId}/process`);
    return response.data;
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
    const response = await apiClient.post(`/payroll/runs/${runId}/approve`, { approved_by: approvedBy });
    return response.data;
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
    const response = await apiClient.post(`/payroll/runs/${runId}/distribute`, { method: distributionMethod });
    return response.data;
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
    const response = await apiClient.get(`/payroll/runs/${runId}/details`);
    return response.data || [];
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
    const response = await apiClient.put(`/payroll/details/${detailId}`, payload);
    return response.data;
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
    const params = new URLSearchParams();
    params.append('offset', offset);
    params.append('limit', limit);
    if (query) params.append('search', query);
    if (filters.type) params.append('type', filters.type);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);
    if (filters.period) params.append('period', filters.period);
    if (filters.status) params.append('status', filters.status);

    const response = await apiClient.get(`/payroll/variables?${params.toString()}`);

    return {
      variables: response.data?.variables || [],
      total: response.data?.total || 0,
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
    const response = await apiClient.post('/payroll/variables', payload);
    return response.data;
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
    const response = await apiClient.put(`/payroll/variables/${id}`, payload);
    return response.data;
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
    const response = await apiClient.delete(`/payroll/variables/${id}`);
    return response.data;
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
    const response = await apiClient.get('/payroll/settings');
    return response.data || {
      irpp_rate: 0,
      periodicity: 'monthly',
      payment_day: 24,
      currency: 'CDF'
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
    const response = await apiClient.put('/payroll/settings', payload);
    return response.data;
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
    const response = await apiClient.get('/payroll/tax-rates');
    return response.data || [];
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
    const response = await apiClient.put(`/payroll/tax-rates/${id}`, payload);
    return response.data;
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
    const response = await apiClient.post(`/payroll/details/${payrollDetailId}/generate-pdf`);
    return response.data;
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
    const response = await apiClient.get(`/payroll/runs/${runId}/distribution-history`);
    return response.data || [];
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
    const response = await apiClient.get(`/payroll/stats?year=${year}`);
    return response.data || {
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
