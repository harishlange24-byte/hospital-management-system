import api from './axios'

export const getDoctors = (params) => api.get('/api/doctors', { params })
export const getDoctor = (id) => api.get(`/api/doctors/${id}`)
export const getMyDoctor = () => api.get('/api/doctors/me')
export const createDoctor = (data) => api.post('/api/doctors', data)
export const updateDoctor = (id, data) => api.put(`/api/doctors/${id}`, data)
export const deleteDoctor = (id) => api.delete(`/api/doctors/${id}`)
