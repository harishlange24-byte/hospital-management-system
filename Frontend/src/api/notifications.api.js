import api from './axios'

export const getNotifications = (params) => api.get('/api/notifications', { params })
export const markAllRead = () => api.patch('/api/notifications/read-all')
export const markRead = (id) => api.patch(`/api/notifications/${id}/read`)
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`)
