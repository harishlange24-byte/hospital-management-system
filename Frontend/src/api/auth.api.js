import api from './axios'

export const registerUser = (data) => api.post('/api/auth/register', data)

export const loginUser = (data) => api.post('/api/auth/login', data)

export const logoutUser = () => api.post('/api/auth/logout')

export const getMe = () => api.get('/api/auth/me')
