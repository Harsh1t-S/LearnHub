import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnhub_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadSession = !!localStorage.getItem('learnhub_token')
      localStorage.removeItem('learnhub_token')
      localStorage.removeItem('learnhub_user')
      if (hadSession && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?sessionExpired=1'
      }
    }
    return Promise.reject(error)
  }
)

export default api
