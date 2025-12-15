import api from "../axios";
import qs from "qs";

export const fetchEmployees = async ({ offset, limit, query, filters = {} }) => {
  const params = qs.stringify({
    offset,
    limit,
    query,
    ...filters,
  });

  const { data } = await api.get(`/employees?${params}`);

  if (data.status === 200) {
    return {
      employees: data.employees || [],
      total: data.total || 0,
    };
  }
  throw new Error(data.message || "Erreur lors de la récupération des employés");
};

export const fetchEmployeeById = async (id) => {
  const { data } = await api.get(`/employees/${id}`);
  return data;
};

export const fetchEmployeeByUserId = async (userId) => {
  const { data } = await api.get(`/employees/by-user/${userId}`);
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await api.post("/employees", payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/employees/${id}`, payload);
  return data;
};

export const updateEmployeeStatus = async (id, status) => {
  const { data } = await api.patch(`/employees/${id}/status`, { status });
  return data;
};

export const terminateEmployee = async (id, terminationData) => {
  const { data} = await api.post(`/employees/${id}/terminate`, terminationData);
  return data;
};

export const fetchEmployeeDependents = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/dependents`);
  return data;
};

export const createEmployeeDependent = async (employeeId, payload) => {
  const { data } = await api.post(`/employees/${employeeId}/dependents`, payload);
  return data;
};

export const fetchEmployeeDocuments = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/documents`);
  return data;
};

export const uploadEmployeeDocument = async (employeeId, formData) => {
  const { data } = await api.post(`/employees/${employeeId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteEmployeeDocument = async (documentId) => {
  const { data } = await api.delete(`/employees/documents/${documentId}`);
  return data;
};

export const fetchEmployeeRequests = async (employeeId, status = "") => {
  const { data } = await api.get(`/employees/${employeeId}/requests?status=${status}`);
  return data;
};

export const createEmployeeRequest = async (payload) => {
  const { data } = await api.post("/employees/requests", payload);
  return data;
};

export const updateEmployeeRequest = async (requestId, payload) => {
  const { data } = await api.put(`/employees/requests/${requestId}`, payload);
  return data;
};

export const approveEmployeeRequest = async (requestId, approvalData) => {
  const { data } = await api.post(`/employees/requests/${requestId}/approve`, approvalData);
  return data;
};

export const rejectEmployeeRequest = async (requestId, rejectionData) => {
  const { data } = await api.post(`/employees/requests/${requestId}/reject`, rejectionData);
  return data;
};

export const fetchEmployeeHistory = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/history`);
  return data;
};

export const fetchEmployeeContracts = async (employeeId) => {
  const { data } = await api.get(`/employees/${employeeId}/contracts`);
  return data;
};
