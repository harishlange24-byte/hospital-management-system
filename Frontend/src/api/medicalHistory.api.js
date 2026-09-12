import api from './axios'

export const getMedicalHistory = (params) => api.get('/api/medical-history', { params })
export const getMedicalHistoryItem = (id) => api.get(`/api/medical-history/${id}`)
export const createMedicalHistory = (data) => api.post('/api/medical-history', data)
export const updateMedicalHistory = (id, data) => api.put(`/api/medical-history/${id}`, data)
export const deleteMedicalHistory = (id) => api.delete(`/api/medical-history/${id}`)
