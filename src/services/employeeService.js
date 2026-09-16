import api from './api';

export const getEmployees    = (params)   => api.get('/users', { params });
export const createEmployee  = (data)     => api.post('/users', data);
export const updateEmployee  = (id, data) => api.put(`/users/${id}`, data);
export const deleteEmployee  = (id)       => api.delete(`/users/${id}`);
