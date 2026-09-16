import api from './api';

// ── Projects ──────────────────────────────────────────────────────────────────
export const getProjects   = (params)     => api.get('/projects', { params });
export const getProject    = (id)         => api.get(`/projects/${id}`);
export const createProject = (data)       => api.post('/projects', data);
export const updateProject = (id, data)   => api.put(`/projects/${id}`, data);
export const deleteProject = (id)         => api.delete(`/projects/${id}`);

// ── Buildings ─────────────────────────────────────────────────────────────────
export const getBuildings   = (projectId)        => api.get(`/projects/${projectId}/buildings`);
export const createBuilding = (projectId, data)  => api.post(`/projects/${projectId}/buildings`, data);
export const updateBuilding = (id, data)         => api.put(`/buildings/${id}`, data);
export const deleteBuilding = (id)               => api.delete(`/buildings/${id}`);

// ── Units ─────────────────────────────────────────────────────────────────────
export const getUnits   = (buildingId)       => api.get(`/buildings/${buildingId}/units`);
export const createUnit = (buildingId, data) => api.post(`/buildings/${buildingId}/units`, data);
export const updateUnit = (id, data)         => api.put(`/units/${id}`, data);
export const deleteUnit = (id)               => api.delete(`/units/${id}`);
