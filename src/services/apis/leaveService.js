import api from "../axios";
import qs from "qs";

export const fetchLeaveTypes = async () => {
  const { data } = await api.get("/leave/types");
  return data;
};

export const fetchLeaveBalances = async (employeeId, year) => {
  const { data } = await api.get(`/leave/balances/${employeeId}?year=${year}`);
  return data;
};

export const fetchLeaveRequests = async ({ offset, limit, query, filters = {} }) => {
  const params = qs.stringify({
    offset,
    limit,
    query,
    ...filters,
  });

  const { data } = await api.get(`/leave/requests?${params}`);

  if (data.status === 200) {
    return {
      requests: data.requests || [],
      total: data.total || 0,
    };
  }
  throw new Error(data.message || "Erreur lors de la récupération des demandes");
};

export const fetchLeaveRequestById = async (id) => {
  const { data } = await api.get(`/leave/requests/${id}`);
  return data;
};

export const createLeaveRequest = async (payload) => {
  const { data } = await api.post("/leave/requests", payload);
  return data;
};

export const updateLeaveRequest = async (id, payload) => {
  const { data } = await api.put(`/leave/requests/${id}`, payload);
  return data;
};

export const submitLeaveRequest = async (id) => {
  const { data } = await api.post(`/leave/requests/${id}/submit`);
  return data;
};

export const approveLeaveRequest = async (id, approvalData) => {
  const { data } = await api.post(`/leave/requests/${id}/approve`, approvalData);
  return data;
};

export const rejectLeaveRequest = async (id, rejectionData) => {
  const { data } = await api.post(`/leave/requests/${id}/reject`, rejectionData);
  return data;
};

export const cancelLeaveRequest = async (id, reason) => {
  const { data } = await api.post(`/leave/requests/${id}/cancel`, { reason });
  return data;
};

export const fetchHandoverSheet = async (leaveRequestId) => {
  const { data } = await api.get(`/leave/handover/${leaveRequestId}`);
  return data;
};

export const createHandoverSheet = async (leaveRequestId, payload) => {
  const { data } = await api.post(`/leave/handover/${leaveRequestId}`, payload);
  return data;
};

export const updateHandoverSheet = async (leaveRequestId, payload) => {
  const { data } = await api.put(`/leave/handover/${leaveRequestId}`, payload);
  return data;
};

export const signHandoverSheet = async (leaveRequestId, signatureType) => {
  const { data } = await api.post(`/leave/handover/${leaveRequestId}/sign`, { signatureType });
  return data;
};

export const fetchLeavePlanning = async (year, employeeId = null) => {
  const params = employeeId ? `?year=${year}&employeeId=${employeeId}` : `?year=${year}`;
  const { data } = await api.get(`/leave/planning${params}`);
  return data;
};

export const createLeavePlanning = async (payload) => {
  const { data } = await api.post("/leave/planning", payload);
  return data;
};

export const updateLeavePlanning = async (id, payload) => {
  const { data } = await api.put(`/leave/planning/${id}`, payload);
  return data;
};

export const calculateWorkingDays = async (startDate, endDate) => {
  const { data } = await api.post("/leave/calculate-days", { startDate, endDate });
  return data;
};
