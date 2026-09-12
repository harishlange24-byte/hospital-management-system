import api from './axios'

export const getInvoices = (params) => api.get('/api/invoices', { params })
export const getInvoice = (id) => api.get(`/api/invoices/${id}`)
export const createInvoice = (data) => api.post('/api/invoices', data)
export const updateInvoiceStatus = (id, data) =>
  api.patch(`/api/invoices/${id}/status`, data)
