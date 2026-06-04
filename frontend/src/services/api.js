import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('staff_token') || localStorage.getItem('client_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const trackParcel    = (code)               => api.get(`/parcels/track/${code}`)
export const staffRegister  = (data)               => api.post('/auth/register', data)
export const clientLogin    = (email, password)    => api.post('/auth/login', { email, password })
export const clientRegister = (data)               => api.post('/auth/register', data)
export const staffLogout    = ()                   => api.post('/auth/logout')
export const forgotPassword = (email)              => api.post('/auth/forgot-password', { email })
export const resetPassword  = (email, token, password) =>
  api.post('/auth/reset-password', { email, token, password, password_confirmation: password })

export const staffLogin = async (id, password) => {
  const res = await api.post('/auth/login',
    typeof id === 'string' && id.includes('@') ? { email: id, password } : { staffId: id, password }
  )
  // Save driver route info
  if (res.data.role === 'driver') {
    localStorage.setItem('driver_type',       res.data.driver_type  || '')
    localStorage.setItem('driver_wilaya',     res.data.wilaya       || '')
    localStorage.setItem('driver_route_from', res.data.route_from   || '')
    localStorage.setItem('driver_route_to',   res.data.route_to     || '')
  }
  return res
}

// Profile
export const getMe           = ()         => api.get('/auth/me')
export const updateAdminUser = (id, data) => api.patch(`/admin/users/${id}`, data)

// Parcels
export const getParcels   = ()                    => api.get('/parcels')
export const createParcel = (data)                => api.post('/parcels', data)
export const updateStatus  = (id, status, reason)  => api.patch(`/parcels/${id}/status`, { status, failure_reason: reason })
export const refuseParcel  = (id, reason)          => api.patch(`/parcels/${id}/status`, { status: 'refused', refusal_reason: reason })
export const assignParcel  = (id, delivery_man_id) => api.patch(`/parcels/${id}/assign`, { delivery_man_id })

// Notifications
export const getNotifications      = ()   => api.get('/notifications')
export const markNotificationRead  = (id) => api.patch(`/notifications/${id}/read`)

export default api
