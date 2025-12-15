import { supabase } from '@/src/lib/supabase-client';

// ==================== EMPLOYEE SELF-SERVICE ====================

export const getMyProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      direction:directions(id, name, code),
      service:services(id, name, code),
      job_position:job_positions(id, title, code),
      grade:grades(id, name, code, base_salary),
      direct_supervisor:direct_supervisor_id(id, first_name, last_name, email),
      user:users(id, email, firstname, lastname)
    `)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const updateMyProfile = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== EMPLOYEE DOCUMENTS ====================

export const getMyDocuments = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employee) throw new Error('Employee not found');

  const { data, error } = await supabase
    .from('employee_documents')
    .select(`
      *,
      document_type:document_types(id, name, code, category),
      uploaded_by_user:uploaded_by(id, email, firstname, lastname)
    `)
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getEmployeeDocuments = async (employeeId) => {
  const { data, error } = await supabase
    .from('employee_documents')
    .select(`
      *,
      document_type:document_types(id, name, code, category),
      uploaded_by_user:uploaded_by(id, email, firstname, lastname)
    `)
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const uploadEmployeeDocument = async (documentData) => {
  const { data, error } = await supabase
    .from('employee_documents')
    .insert([documentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEmployeeDocument = async (id) => {
  const { error } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== EMPLOYEE CONTRACTS ====================

export const getMyContracts = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employee) throw new Error('Employee not found');

  const { data, error } = await supabase
    .from('employee_contracts')
    .select('*')
    .eq('employee_id', employee.id)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getEmployeeContracts = async (employeeId) => {
  const { data, error } = await supabase
    .from('employee_contracts')
    .select('*')
    .eq('employee_id', employeeId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};

// ==================== EMPLOYEE REQUESTS ====================

export const getMyRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employee) throw new Error('Employee not found');

  const { data, error } = await supabase
    .from('employee_requests')
    .select(`
      *,
      request_type:request_types(id, name, code, category),
      reviewed_by_user:reviewed_by(id, email, firstname, lastname),
      approved_by_user:approved_by(id, email, firstname, lastname)
    `)
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getEmployeeRequests = async (filters = {}) => {
  let query = supabase
    .from('employee_requests')
    .select(`
      *,
      employee:employees(id, employee_number, first_name, last_name),
      request_type:request_types(id, name, code, category),
      reviewed_by_user:reviewed_by(id, email, firstname, lastname),
      approved_by_user:approved_by(id, email, firstname, lastname)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.employee_id) {
    query = query.eq('employee_id', filters.employee_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createEmployeeRequest = async (requestData) => {
  const { data, error } = await supabase
    .from('employee_requests')
    .insert([requestData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployeeRequest = async (id, updates) => {
  const { data, error } = await supabase
    .from('employee_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRequestTypes = async () => {
  const { data, error } = await supabase
    .from('request_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
};

// ==================== INTERNAL ANNOUNCEMENTS ====================

export const getInternalAnnouncements = async () => {
  const { data, error } = await supabase
    .from('internal_announcements')
    .select(`
      *,
      created_by_user:created_by(id, email, firstname, lastname)
    `)
    .eq('is_published', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllAnnouncements = async (filters = {}) => {
  let query = supabase
    .from('internal_announcements')
    .select(`
      *,
      created_by_user:created_by(id, email, firstname, lastname)
    `)
    .order('created_at', { ascending: false });

  if (filters.is_published !== undefined) {
    query = query.eq('is_published', filters.is_published);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createAnnouncement = async (announcementData) => {
  const { data, error } = await supabase
    .from('internal_announcements')
    .insert([announcementData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAnnouncement = async (id, updates) => {
  const { data, error } = await supabase
    .from('internal_announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markAnnouncementAsRead = async (announcementId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('announcement_reads')
    .upsert([{ announcement_id: announcementId, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== EMPLOYEE FEEDBACK ====================

export const getMyFeedback = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employee) throw new Error('Employee not found');

  const { data, error } = await supabase
    .from('employee_feedback')
    .select(`
      *,
      assigned_to_user:assigned_to(id, email, firstname, lastname),
      responded_by_user:responded_by(id, email, firstname, lastname)
    `)
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getAllFeedback = async (filters = {}) => {
  let query = supabase
    .from('employee_feedback')
    .select(`
      *,
      employee:employees(id, employee_number, first_name, last_name),
      assigned_to_user:assigned_to(id, email, firstname, lastname),
      responded_by_user:responded_by(id, email, firstname, lastname)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createFeedback = async (feedbackData) => {
  const { data, error } = await supabase
    .from('employee_feedback')
    .insert([feedbackData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFeedback = async (id, updates) => {
  const { data, error } = await supabase
    .from('employee_feedback')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== EMPLOYEE HISTORY ====================

export const getEmployeeHistory = async (employeeId) => {
  const { data, error } = await supabase
    .from('employee_history')
    .select(`
      *,
      old_direction:old_direction_id(id, name, code),
      new_direction:new_direction_id(id, name, code),
      old_service:old_service_id(id, name, code),
      new_service:new_service_id(id, name, code),
      old_job_position:old_job_position_id(id, title, code),
      new_job_position:new_job_position_id(id, title, code),
      old_grade:old_grade_id(id, name, code),
      new_grade:new_grade_id(id, name, code),
      created_by_user:created_by(id, email, firstname, lastname)
    `)
    .eq('employee_id', employeeId)
    .order('event_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createEmployeeHistory = async (historyData) => {
  const { data, error } = await supabase
    .from('employee_history')
    .insert([historyData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== EMPLOYEE DEPENDENTS ====================

export const getEmployeeDependents = async (employeeId) => {
  const { data, error } = await supabase
    .from('employee_dependents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createEmployeeDependent = async (dependentData) => {
  const { data, error } = await supabase
    .from('employee_dependents')
    .insert([dependentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployeeDependent = async (id, updates) => {
  const { data, error } = await supabase
    .from('employee_dependents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEmployeeDependent = async (id) => {
  const { error } = await supabase
    .from('employee_dependents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
