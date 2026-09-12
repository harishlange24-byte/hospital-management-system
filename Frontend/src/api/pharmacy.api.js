import api from './axios'

export const getMedicines = (params) => api.get('/api/pharmacy/medicines', { params })
export const getMedicine = (id) => api.get(`/api/pharmacy/medicines/${id}`)
export const createMedicine = (data) => api.post('/api/pharmacy/medicines', data)
export const updateMedicine = (id, data) => api.put(`/api/pharmacy/medicines/${id}`, data)
export const deleteMedicine = (id) => api.delete(`/api/pharmacy/medicines/${id}`)
export const getPharmacySales = (params) => api.get('/api/pharmacy/sales', { params })
export const createPharmacySale = (data) => api.post('/api/pharmacy/sales', data)
