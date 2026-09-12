import api from './axios'

export const getPatients = (params) => api.get('/api/patients', { params })
export const getPatient = (id) => api.get(`/api/patients/${id}`)
export const getMyPatient = () => api.get('/api/patients/me')
export const updateMyPatient = (data) => api.put('/api/patients/me', data)
export const createPatient = (data) => api.post('/api/patients', data)
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data)
export const deletePatient = (id) => api.delete(`/api/patients/${id}`)
