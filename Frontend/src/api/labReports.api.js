import api from './axios'

export const getLabReports = (params) => api.get('/api/lab-reports', { params })
export const getLabReport = (id) => api.get(`/api/lab-reports/${id}`)
export const createLabReport = (data) => api.post('/api/lab-reports', data)
export const updateLabReport = (id, data) => api.put(`/api/lab-reports/${id}`, data)
export const deleteLabReport = (id) => api.delete(`/api/lab-reports/${id}`)
