import api from './api';

export const getLeads     = (params) => api.get('/leads', { params });
export const getLeadById  = (id)     => api.get(`/leads/${id}`);
export const createLead   = (data)   => api.post('/leads', data);
export const updateLead   = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead   = (id)     => api.delete(`/leads/${id}`);
export const addNote      = (id, data) => api.post(`/leads/${id}/notes`, data);
