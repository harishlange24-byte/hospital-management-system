import api from './axios'

export const getSchedules = (params) => api.get('/api/schedules', { params })
export const getSlots = (params) => api.get('/api/schedules/slots', { params })
export const createSchedule = (data) => api.post('/api/schedules', data)
export const deleteSchedule = (id) => api.delete(`/api/schedules/${id}`)
