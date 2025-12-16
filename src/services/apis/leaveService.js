import { supabase } from "../../lib/supabase-client";
import { calculateWorkingDays, formatDateToISO } from "../../utils/dateUtils";

export const fetchLeaveTypes = async () => {
  try {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch leave types error:', error);
    throw error;
  }
};

export const fetchLeaveBalances = async (employeeId, year) => {
  try {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*, leave_type:leave_types(*)')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .order('leave_type_id', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch leave balances error:', error);
    throw error;
  }
};

export const fetchLeaveRequests = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, employee_number),
        leave_type:leave_types(id, name, code),
        backup_employee:employees!leave_requests_backup_employee_id_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`request_number.ilike.%${query}%`);
    }

    if (filters.employee_id) {
      queryBuilder = queryBuilder.eq('employee_id', filters.employee_id);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.leave_type_id) {
      queryBuilder = queryBuilder.eq('leave_type_id', filters.leave_type_id);
    }

    if (filters.start_date) {
      queryBuilder = queryBuilder.gte('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryBuilder = queryBuilder.lte('end_date', filters.end_date);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      requests: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch leave requests error:', error);
    throw error;
  }
};

export const fetchLeaveRequestById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!leave_requests_employee_id_fkey(*),
        leave_type:leave_types(*),
        backup_employee:employees!leave_requests_backup_employee_id_fkey(*),
        approvals:leave_approvals(*, approver_user:approver_id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch leave request by id error:', error);
    throw error;
  }
};

export const createLeaveRequest = async (payload) => {
  try {
    const requestNumber = await generateLeaveRequestNumber();
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{ ...payload, request_number: requestNumber }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create leave request error:', error);
    throw error;
  }
};

export const updateLeaveRequest = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update leave request error:', error);
    throw error;
  }
};

export const submitLeaveRequest = async (id) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'pending_backup',
        submitted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Submit leave request error:', error);
    throw error;
  }
};

export const approveLeaveRequest = async (id, approvalData) => {
  try {
    const { data: request } = await supabase
      .from('leave_requests')
      .select('status')
      .eq('id', id)
      .single();

    let nextStatus = 'approved';
    if (request.status === 'pending_backup') {
      nextStatus = 'pending_supervisor';
    } else if (request.status === 'pending_supervisor') {
      nextStatus = 'pending_hr';
    } else if (request.status === 'pending_hr') {
      nextStatus = 'pending_dg';
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status: nextStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: approvalData.approver_id, // auth.users.id
        approver_role: approvalData.approver_role,
        action: 'approved',
        comments: approvalData.comments,
        approval_level: approvalData.approval_level,
        approved_at: new Date().toISOString(),
      }]);

    return data;
  } catch (error) {
    console.error('Approve leave request error:', error);
    throw error;
  }
};

export const rejectLeaveRequest = async (id, rejectionData) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionData.comments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: rejectionData.approver_id,
        approver_role: rejectionData.approver_role,
        action: 'rejected',
        approval_level: rejectionData.approval_level,
        comments: rejectionData.comments,
        approved_at: new Date().toISOString(),
      }]);

    return data;
  } catch (error) {
    console.error('Reject leave request error:', error);
    throw error;
  }
};

export const cancelLeaveRequest = async (id, reason) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Cancel leave request error:', error);
    throw error;
  }
};

export const fetchHandoverSheet = async (leaveRequestId) => {
  try {
    const { data, error } = await supabase
      .from('leave_handover_sheets')
      .select('*, leave_request:leave_requests(*)')
      .eq('leave_request_id', leaveRequestId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch handover sheet error:', error);
    throw error;
  }
};

export const createHandoverSheet = async (leaveRequestId, payload) => {
  try {
    const { data, error } = await supabase
      .from('leave_handover_sheets')
      .insert([{ ...payload, leave_request_id: leaveRequestId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create handover sheet error:', error);
    throw error;
  }
};

export const updateHandoverSheet = async (leaveRequestId, payload) => {
  try {
    const { data, error } = await supabase
      .from('leave_handover_sheets')
      .update(payload)
      .eq('leave_request_id', leaveRequestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update handover sheet error:', error);
    throw error;
  }
};

export const signHandoverSheet = async (leaveRequestId, signatureType) => {
  try {
    const updateData = {};
    if (signatureType === 'employee') {
      updateData.employee_signature_date = new Date().toISOString();
    } else if (signatureType === 'backup') {
      updateData.backup_signature_date = new Date().toISOString();
    } else if (signatureType === 'supervisor') {
      updateData.supervisor_signature_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leave_handover_sheets')
      .update(updateData)
      .eq('leave_request_id', leaveRequestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign handover sheet error:', error);
    throw error;
  }
};

export const fetchLeavePlanning = async (year, employeeId = null) => {
  try {
    let queryBuilder = supabase
      .from('leave_planning')
      .select('*, employee:employees!leave_planning_employee_id_fkey(id, first_name, last_name)')
      .eq('year', year)
      .order('planned_start_date', { ascending: true });

    if (employeeId) {
      queryBuilder = queryBuilder.eq('employee_id', employeeId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch leave planning error:', error);
    throw error;
  }
};

export const createLeavePlanning = async (payload) => {
  try {
    const { data, error } = await supabase
      .from('leave_planning')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create leave planning error:', error);
    throw error;
  }
};

export const updateLeavePlanning = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('leave_planning')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update leave planning error:', error);
    throw error;
  }
};

export const calculateWorkingDaysFromDB = async (startDate, endDate) => {
  try {
    // Récupérer les jours fériés
    const { data: holidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('date')
      .gte('date', startDate)
      .lte('date', endDate);

    if (holidaysError) throw holidaysError;

    // Utiliser la fonction utilitaire pour calculer les jours ouvrables
    const holidayDates = (holidays || []).map(h => h.date);
    const workingDays = calculateWorkingDays(startDate, endDate, holidayDates);

    return { working_days: workingDays };
  } catch (error) {
    console.error('Calculate working days error:', error);
    throw error;
  }
};

/**
 * Approuve une demande par le collaborateur backup
 */
export const approveByBackup = async (id, backupId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'pending_supervisor',
        backup_approved: true,
        backup_approved_at: new Date().toISOString(),
        backup_notes: comments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Créer l'entrée d'approbation
    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: backupId,
        approver_role: 'backup',
        action: 'approved',
        approval_level: 1,
        comments: comments,
        approved_at: new Date().toISOString(),
      }]);

    return data;
  } catch (error) {
    console.error('Approve by backup error:', error);
    throw error;
  }
};

/**
 * Approuve une demande par le supérieur hiérarchique
 */
export const approveBySupervisor = async (id, supervisorId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'pending_hr'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Créer l'entrée d'approbation
    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: supervisorId,
        approver_role: 'supervisor',
        action: 'approved',
        approval_level: 2,
        comments: comments,
        approved_at: new Date().toISOString(),
      }]);

    return data;
  } catch (error) {
    console.error('Approve by supervisor error:', error);
    throw error;
  }
};

/**
 * Approuve une demande par la DRH (validation finale)
 */
export const approveByHR = async (id, hrUserId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Créer l'entrée d'approbation
    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: hrUserId,
        approver_role: 'hr',
        action: 'approved',
        approval_level: 3,
        comments: comments,
        approved_at: new Date().toISOString(),
      }]);

    // Mettre à jour le solde de congés (déclenché aussi par trigger)
    await updateLeaveBalance(data.employee_id, data.leave_type_id, data.total_days);

    return data;
  } catch (error) {
    console.error('Approve by HR error:', error);
    throw error;
  }
};

/**
 * Approuve une demande par la Direction Générale (pour responsables)
 */
export const approveByDG = async (id, dgUserId, comments = '') => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Créer l'entrée d'approbation
    await supabase
      .from('leave_approvals')
      .insert([{
        leave_request_id: id,
        approver_id: dgUserId,
        approver_role: 'dg',
        action: 'approved',
        approval_level: 4,
        comments: comments,
        approved_at: new Date().toISOString(),
      }]);

    // Mettre à jour le solde de congés
    await updateLeaveBalance(data.employee_id, data.leave_type_id, data.total_days);

    return data;
  } catch (error) {
    console.error('Approve by DG error:', error);
    throw error;
  }
};

/**
 * Met à jour le solde de congés après validation
 */
const updateLeaveBalance = async (employeeId, leaveTypeId, totalDays) => {
  try {
    const currentYear = new Date().getFullYear();

    // Récupérer le solde actuel
    const { data: balance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type_id', leaveTypeId)
      .eq('year', currentYear)
      .single();

    if (balance) {
      // Mettre à jour le solde
      await supabase
        .from('leave_balances')
        .update({
          used_days: (balance.used_days || 0) + totalDays,
          remaining_days: Math.max((balance.remaining_days || 0) - totalDays, 0)
        })
        .eq('id', balance.id);
    }
  } catch (error) {
    console.error('Update leave balance error:', error);
  }
};

/**
 * Upload d'un document de Remise-Reprise
 */
export const uploadHandoverDocument = async (leaveRequestId, file) => {
  try {
    const fileName = `handover_${leaveRequestId}_${Date.now()}_${file.name}`;
    const filePath = `handover-documents/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('leave-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('leave-documents')
      .getPublicUrl(filePath);

    // Mettre à jour la demande avec l'URL du document
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        handover_document_url: urlData.publicUrl
      })
      .eq('id', leaveRequestId)
      .select()
      .single();

    if (error) throw error;

    return { url: urlData.publicUrl, data };
  } catch (error) {
    console.error('Upload handover document error:', error);
    throw error;
  }
};

/**
 * Récupère toutes les demandes de congés pour la planification
 */
export const fetchAllApprovedLeaveRequests = async (year, departmentId = null) => {
  try {
    let queryBuilder = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, service_id, direction_id),
        leave_type:leave_types(id, name, code)
      `)
      .eq('status', 'approved')
      .gte('start_date', `${year}-01-01`)
      .lte('end_date', `${year}-12-31`)
      .order('start_date', { ascending: true });

    // Filtrage côté client si departmentId est basé sur services/directions (pas de table departments)

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch all approved leave requests error:', error);
    throw error;
  }
};

/**
 * Détecte les conflits de congés (trop d'absences simultanées)
 */
export const detectLeaveConflicts = async (departmentId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name)
      `)
      .eq('status', 'approved')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) throw error;

    // Compter le nombre d'employés absents par jour
    const conflicts = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateStr = formatDateToISO(currentDate);
      const absentCount = (data || []).filter(req => {
        return dateStr >= req.start_date && dateStr <= req.end_date;
      }).length;

      if (absentCount > 3) { // Seuil de 3 personnes absentes
        conflicts.push({
          date: dateStr,
          absentCount: absentCount,
          employees: data.filter(req =>
            dateStr >= req.start_date && dateStr <= req.end_date
          ).map(req => req.employee)
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return conflicts;
  } catch (error) {
    console.error('Detect leave conflicts error:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques de congés par département
 */
export const fetchLeaveStatsByDepartment = async (year) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!leave_requests_employee_id_fkey(service_id, direction_id),
        leave_type:leave_types(id, name)
      `)
      .eq('status', 'approved')
      .gte('start_date', `${year}-01-01`)
      .lte('end_date', `${year}-12-31`);

    if (error) throw error;

    // Grouper par département
    const statsByDept = {};
    (data || []).forEach(req => {
      const deptId = req.employee?.service_id || req.employee?.direction_id;
      const deptName = req.employee?.service_id ? 'Service' : (req.employee?.direction_id ? 'Direction' : 'Non assigné');

      if (!statsByDept[deptId]) {
        statsByDept[deptId] = {
          departmentId: deptId,
          departmentName: deptName,
          totalDays: 0,
          requestCount: 0,
          byLeaveType: {}
        };
      }

      statsByDept[deptId].totalDays += req.duration || 0;
      statsByDept[deptId].requestCount += 1;

      const leaveTypeName = req.leave_type?.name || 'Autre';
      if (!statsByDept[deptId].byLeaveType[leaveTypeName]) {
        statsByDept[deptId].byLeaveType[leaveTypeName] = 0;
      }
      statsByDept[deptId].byLeaveType[leaveTypeName] += req.total_days || 0;
    });

    return Object.values(statsByDept);
  } catch (error) {
    console.error('Fetch leave stats by department error:', error);
    throw error;
  }
};

/**
 * Ajuste manuellement le solde de congés (pour RH)
 */
export const adjustLeaveBalance = async (balanceId, adjustment, reason, adjustedBy) => {
  try {
    // Récupérer le solde actuel
    const { data: currentBalance } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('id', balanceId)
      .single();

    if (!currentBalance) {
      throw new Error('Solde non trouvé');
    }

    // Calculer le nouveau total
    const newTotal = (currentBalance.total_days || 0) + adjustment;

    // Mettre à jour le solde
    const { data, error } = await supabase
      .from('leave_balances')
      .update({
        total_days: newTotal
      })
      .eq('id', balanceId)
      .select()
      .single();

    if (error) throw error;

    // Créer un historique d'ajustement
    await supabase
      .from('leave_balance_adjustments')
      .insert([{
        leave_balance_id: balanceId,
        adjustment: adjustment,
        reason: reason,
        adjusted_by: adjustedBy,
        adjusted_at: new Date().toISOString()
      }]);

    return data;
  } catch (error) {
    console.error('Adjust leave balance error:', error);
    throw error;
  }
};

/**
 * Récupère l'historique des ajustements de solde
 */
export const fetchBalanceAdjustmentHistory = async (balanceId) => {
  try {
    const { data, error } = await supabase
      .from('leave_balance_adjustments')
      .select(`
        *,
        adjusted_by_user:adjusted_by(id, email, first_name, last_name)
      `)
      .eq('leave_balance_id', balanceId)
      .order('adjusted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch balance adjustment history error:', error);
    throw error;
  }
};

/**
 * Récupère tous les soldes de congés avec filtres
 */
export const fetchAllLeaveBalances = async (year, departmentId = null, employeeId = null) => {
  try {
    let queryBuilder = supabase
      .from('leave_balances')
      .select(`
        *,
        employee:employees!leave_balances_employee_id_fkey(id, first_name, last_name, employee_number, service_id, direction_id),
        leave_type:leave_types(id, name, code)
      `)
      .eq('year', year)
      .order('employee_id', { ascending: true });

    if (employeeId) {
      queryBuilder = queryBuilder.eq('employee_id', employeeId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    // Filtrer par département si nécessaire (côté client car jointure complexe)
    let results = data || [];
    if (departmentId && !employeeId) {
      results = results.filter(balance =>
        balance.employee?.service_id === departmentId || balance.employee?.direction_id === departmentId
      );
    }

    return results;
  } catch (error) {
    console.error('Fetch all leave balances error:', error);
    throw error;
  }
};

/**
 * Génère un numéro de demande de congé unique
 */
const generateLeaveRequestNumber = async () => {
  const { data } = await supabase.rpc('generate_leave_request_number');
  return data || `LEV${new Date().getFullYear()}${Date.now()}`;
};
