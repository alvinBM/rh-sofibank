import { supabase } from "../../lib/supabase-client";

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
        employee:employees(id, first_name, last_name, employee_number),
        leave_type:leave_types(id, name, code),
        backup_person:backup_person_id(id, first_name, last_name),
        supervisor:supervisor_id(id, first_name, last_name)
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
        employee:employees(*),
        leave_type:leave_types(*),
        backup_person:backup_person_id(*),
        supervisor:supervisor_id(*),
        approvals:leave_approvals(*, approver:approver_id(id, first_name, last_name))
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
        approver_id: approvalData.approver_id,
        level: approvalData.level,
        status: 'approved',
        comments: approvalData.comments,
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
        level: rejectionData.level,
        status: 'rejected',
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
      .from('handover_sheets')
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
      .from('handover_sheets')
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
      .from('handover_sheets')
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
      updateData.employee_signed = true;
      updateData.employee_signed_at = new Date().toISOString();
    } else if (signatureType === 'backup') {
      updateData.backup_signed = true;
      updateData.backup_signed_at = new Date().toISOString();
    } else if (signatureType === 'supervisor') {
      updateData.supervisor_signed = true;
      updateData.supervisor_signed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('handover_sheets')
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
      .select('*, employee:employees(id, first_name, last_name), leave_type:leave_types(*)')
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

export const calculateWorkingDays = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase.rpc('calculate_working_days', {
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return { working_days: data };
  } catch (error) {
    console.error('Calculate working days error:', error);
    throw error;
  }
};

const generateLeaveRequestNumber = async () => {
  const { data } = await supabase.rpc('generate_leave_request_number');
  return data || `LV${Date.now()}`;
};
