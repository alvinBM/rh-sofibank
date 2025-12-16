import { supabase } from "../../lib/supabase-client";

export const fetchEmployees = async ({ offset, limit, query, filters = {} }) => {
  try {
    let queryBuilder = supabase
      .from('employees')
      .select(`
        *,
        direction:directions(id, name),
        service:services(id, name),
        job_position:job_positions(id, title),
        grade:grades(id, name, code),
        supervisor:employees!employees_direct_supervisor_id_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,employee_number.ilike.%${query}%`);
    }

    if (filters.direction_id) {
      queryBuilder = queryBuilder.eq('direction_id', filters.direction_id);
    }

    if (filters.service_id) {
      queryBuilder = queryBuilder.eq('service_id', filters.service_id);
    }

    if (filters.employment_status) {
      queryBuilder = queryBuilder.eq('employment_status', filters.employment_status);
    }

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      employees: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Fetch employees error:', error);
    throw error;
  }
};

export const fetchEmployeeById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        direction:directions(*),
        service:services(*),
        job_position:job_positions(*),
        grade:grades(*),
        supervisor:employees!employees_direct_supervisor_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch employee by id error:', error);
    throw error;
  }
};

export const fetchEmployeeByUserId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Fetch employee by user id error:', error);
    throw error;
  }
};

export const createEmployee = async (payload) => {
  try {
    const employeeNumber = await generateEmployeeNumber();
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...payload, employee_number: employeeNumber }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create employee error:', error);
    throw error;
  }
};

export const updateEmployee = async (id, payload) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update employee error:', error);
    throw error;
  }
};

export const updateEmployeeStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ employment_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update employee status error:', error);
    throw error;
  }
};

export const terminateEmployee = async (id, terminationData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({
        employment_status: 'terminated',
        termination_date: terminationData.termination_date,
        termination_reason: terminationData.termination_reason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Terminate employee error:', error);
    throw error;
  }
};

export const fetchEmployeeDependents = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employee_dependents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee dependents error:', error);
    throw error;
  }
};

export const createEmployeeDependent = async (employeeId, payload) => {
  try {
    const { data, error } = await supabase
      .from('employee_dependents')
      .insert([{ ...payload, employee_id: employeeId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create employee dependent error:', error);
    throw error;
  }
};

export const fetchEmployeeDocuments = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*, document_type:document_types(*)')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee documents error:', error);
    throw error;
  }
};

export const uploadEmployeeDocument = async (employeeId, file, documentData) => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `employees/${employeeId}/documents/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('employee_documents')
      .insert([{
        employee_id: employeeId,
        ...documentData,
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Upload employee document error:', error);
    throw error;
  }
};

export const deleteEmployeeDocument = async (documentId) => {
  try {
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete employee document error:', error);
    throw error;
  }
};

export const fetchEmployeeRequests = async (employeeId, status = "") => {
  try {
    let query = supabase
      .from('employee_requests')
      .select('*, request_type:request_types(*), employee:employees!employee_requests_employee_id_fkey(id, first_name, last_name)')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee requests error:', error);
    throw error;
  }
};

export const createEmployeeRequest = async (payload) => {
  try {
    const requestNumber = await generateRequestNumber();
    const { data, error } = await supabase
      .from('employee_requests')
      .insert([{ ...payload, request_number: requestNumber }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create employee request error:', error);
    throw error;
  }
};

export const updateEmployeeRequest = async (requestId, payload) => {
  try {
    const { data, error } = await supabase
      .from('employee_requests')
      .update(payload)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update employee request error:', error);
    throw error;
  }
};

export const approveEmployeeRequest = async (requestId, approvalData) => {
  try {
    const { data, error } = await supabase
      .from('employee_requests')
      .update({
        status: 'approved',
        approved_by: approvalData.approved_by,
        approved_at: new Date().toISOString(),
        approval_notes: approvalData.notes,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Approve employee request error:', error);
    throw error;
  }
};

export const rejectEmployeeRequest = async (requestId, rejectionData) => {
  try {
    const { data, error } = await supabase
      .from('employee_requests')
      .update({
        status: 'rejected',
        reviewed_by: rejectionData.reviewed_by,
        reviewed_at: new Date().toISOString(),
        review_notes: rejectionData.notes,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Reject employee request error:', error);
    throw error;
  }
};

export const fetchEmployeeHistory = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employee_history')
      .select('*')
      .eq('employee_id', employeeId)
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee history error:', error);
    throw error;
  }
};

export const fetchEmployeeContracts = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employee_contracts')
      .select('*')
      .eq('employee_id', employeeId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch employee contracts error:', error);
    throw error;
  }
};

const generateEmployeeNumber = async () => {
  const { data } = await supabase.rpc('generate_employee_number');
  return data || `EMP${Date.now()}`;
};

const generateRequestNumber = async () => {
  const { data } = await supabase.rpc('generate_request_number');
  return data || `REQ${Date.now()}`;
};
