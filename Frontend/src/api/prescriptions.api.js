import api from './axios'

export const getPrescriptions = (params) => api.get('/api/prescriptions', { params })
export const getPrescription = (id) => api.get(`/api/prescriptions/${id}`)
export const createPrescription = (data) => api.post('/api/prescriptions', data)
export const updatePrescription = (id, data) => api.put(`/api/prescriptions/${id}`, data)
export const deletePrescription = (id) => api.delete(`/api/prescriptions/${id}`)
