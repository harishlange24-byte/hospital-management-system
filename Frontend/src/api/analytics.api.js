import api from './axios'

export const getDashboardAnalytics = () => api.get('/api/analytics/dashboard')
