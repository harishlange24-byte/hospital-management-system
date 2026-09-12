import api from './axios'

export const getAppointments = (params) => api.get('/api/appointments', { params })
export const getAppointment = (id) => api.get(`/api/appointments/${id}`)
export const createAppointment = (data) => api.post('/api/appointments', data)
export const updateAppointmentStatus = (id, data) =>
  api.patch(`/api/appointments/${id}/status`, data)
export const cancelAppointment = (id, data) =>
  api.patch(`/api/appointments/${id}/cancel`, data)
export const rescheduleAppointment = (id, data) =>
  api.patch(`/api/appointments/${id}/reschedule`, data)
