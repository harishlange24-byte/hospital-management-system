import api from './axios'

export const getPayments = (params) => api.get('/api/payments', { params })
export const getPayment = (id) => api.get(`/api/payments/${id}`)
export const createPaymentOrder = (data) => api.post('/api/payments/create-order', data)
export const verifyPayment = (data) => api.post('/api/payments/verify', data)
