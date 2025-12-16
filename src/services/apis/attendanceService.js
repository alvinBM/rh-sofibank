import { supabase } from "../../lib/supabase-client";

/**
 * Service pour la gestion de la présence (Time & Attendance)
 * Gère les pointages, autorisations de sortie et rapports de présence
 */

// ==================== REGISTRE DE PRÉSENCE ====================

/**
 * Récupère les enregistrements de présence avec filtres
 */
export const fetchAttendanceRecords = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('attendance_records')
      .select(`
        *,
        employee:employees!attendance_records_employee_id_fkey(id, first_name, last_name, employee_number, service_id, direction_id)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('date', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`employee.first_name.ilike.%${query}%,employee.last_name.ilike.%${query}%`);
    }

    if (filters.date_from) {
      queryBuilder = queryBuilder.gte('date', filters.date_from);
    }

    if (filters.date_to) {
      queryBuilder = queryBuilder.lte('date', filters.date_to);
    }

    if (filters.service_id) {
      queryBuilder = queryBuilder.eq('employee.service_id', filters.service_id);
    }

    if (filters.direction_id) {
      queryBuilder = queryBuilder.eq('employee.direction_id', filters.direction_id);
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
      records: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch attendance records error:', error);
    throw error;
  }
};

/**
 * Récupère un enregistrement de présence par ID
 */
export const fetchAttendanceRecordById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        employee:employees!attendance_records_employee_id_fkey(*),
        terminal:biometric_terminals(id, name, location)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch attendance record by id error:', error);
    throw error;
  }
};

/**
 * Crée un enregistrement de présence manuel
 */
export const createAttendanceRecord = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create attendance record error:', error);
    throw error;
  }
};

/**
 * Met à jour un enregistrement de présence
 */
export const updateAttendanceRecord = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update attendance record error:', error);
    throw error;
  }
};

/**
 * Synchronise les pointages depuis les terminaux biométriques
 */
export const synchronizeAttendanceFromTerminals = async (date) => {
  try {
    // Appel à une fonction Supabase qui importe les données depuis les terminaux
    const { data, error } = await supabase.rpc('sync_attendance_from_terminals', {
      target_date: date
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Synchronize attendance error:', error);
    throw error;
  }
};

/**
 * Récupère le résumé quotidien de présence
 */
export const fetchDailySummary = async (date, departmentId = null) => {
  try {
    const { data, error } = await supabase.rpc('get_daily_attendance_summary', {
      target_date: date,
      dept_id: departmentId
    });

    if (error) throw error;
    return data || {
      total_present: 0,
      total_late: 0,
      total_absent: 0,
      total_half_day: 0,
      average_arrival_time: null,
      average_departure_time: null
    };
  } catch (error) {
    console.error('Fetch daily summary error:', error);
    throw error;
  }
};

/**
 * Récupère les détails de pointage d'un employé pour une journée
 */
export const fetchEmployeeDailyAttendance = async (employeeId, date) => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .order('check_in_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee daily attendance error:', error);
    throw error;
  }
};

// ==================== AUTORISATIONS DE SORTIE ====================

/**
 * Récupère les autorisations de sortie avec filtres
 */
export const fetchExitAuthorizations = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('exit_authorizations')
      .select(`
        *,
        employee:employees!exit_authorizations_employee_id_fkey(id, first_name, last_name, employee_number, service_id, direction_id),
        approver:employees!exit_authorizations_approved_by_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`employee.first_name.ilike.%${query}%,employee.last_name.ilike.%${query}%`);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    if (filters.date_from) {
      queryBuilder = queryBuilder.gte('date', filters.date_from);
    }

    if (filters.date_to) {
      queryBuilder = queryBuilder.lte('date', filters.date_to);
    }

    if (filters.employee_id) {
      queryBuilder = queryBuilder.eq('employee_id', filters.employee_id);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      authorizations: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch exit authorizations error:', error);
    throw error;
  }
};

/**
 * Crée une autorisation de sortie
 */
export const createExitAuthorization = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('exit_authorizations')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create exit authorization error:', error);
    throw error;
  }
};

/**
 * Met à jour une autorisation de sortie
 */
export const updateExitAuthorization = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('exit_authorizations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update exit authorization error:', error);
    throw error;
  }
};

/**
 * Approuve une autorisation de sortie
 */
export const approveExitAuthorization = async (id, approverId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('exit_authorizations')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        approver_comments: comments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Approve exit authorization error:', error);
    throw error;
  }
};

/**
 * Rejette une autorisation de sortie
 */
export const rejectExitAuthorization = async (id, approverId, reason) => {
  try {
    const { data, error } = await supabase
      .from('exit_authorizations')
      .update({
        status: 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Reject exit authorization error:', error);
    throw error;
  }
};

/**
 * Marque une autorisation comme utilisée
 */
export const markAuthorizationAsUsed = async (id) => {
  try {
    const { data, error } = await supabase
      .from('exit_authorizations')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Mark authorization as used error:', error);
    throw error;
  }
};

// ==================== RAPPORTS DE PRÉSENCE ====================

/**
 * Génère un rapport de retards pour une période
 */
export const generateLatenessReport = async (startDate, endDate, departmentId = null) => {
  try {
    const { data, error } = await supabase.rpc('generate_lateness_report', {
      start_date: startDate,
      end_date: endDate,
      dept_id: departmentId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Generate lateness report error:', error);
    throw error;
  }
};

/**
 * Génère un rapport d'absences de pointage
 */
export const generateMissingPunchReport = async (startDate, endDate, departmentId = null) => {
  try {
    const { data, error } = await supabase.rpc('generate_missing_punch_report', {
      start_date: startDate,
      end_date: endDate,
      dept_id: departmentId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Generate missing punch report error:', error);
    throw error;
  }
};

/**
 * Génère une synthèse par département
 */
export const generateDepartmentSummary = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase.rpc('generate_department_attendance_summary', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Generate department summary error:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques de présence globales
 */
export const fetchAttendanceStats = async (startDate, endDate, departmentId = null) => {
  try {
    const { data, error } = await supabase.rpc('get_attendance_stats', {
      start_date: startDate,
      end_date: endDate,
      dept_id: departmentId
    });

    if (error) throw error;
    return data || {
      overall_attendance_rate: 0,
      average_daily_hours: 0,
      total_overtime_hours: 0,
      average_late_arrivals_per_day: 0
    };
  } catch (error) {
    console.error('Fetch attendance stats error:', error);
    throw error;
  }
};

/**
 * Récupère l'évolution mensuelle de la présence
 */
export const fetchMonthlyAttendanceTrend = async (year, departmentId = null) => {
  try {
    const { data, error } = await supabase.rpc('get_monthly_attendance_trend', {
      target_year: year,
      dept_id: departmentId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch monthly attendance trend error:', error);
    throw error;
  }
};

/**
 * Récupère les données de comparaison entre départements
 */
export const fetchDepartmentComparison = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase.rpc('compare_department_attendance', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch department comparison error:', error);
    throw error;
  }
};

/**
 * Exporte les données de présence
 */
export const exportAttendanceData = async (startDate, endDate, format = 'excel') => {
  try {
    // Cette fonction pourrait générer un fichier Excel/PDF côté serveur
    const { data, error } = await supabase.rpc('export_attendance_data', {
      start_date: startDate,
      end_date: endDate,
      export_format: format
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Export attendance data error:', error);
    throw error;
  }
};
