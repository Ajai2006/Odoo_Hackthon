import axios from 'axios'

const api = axios.create({
  baseURL: '/',        // Vite proxy forwards /api → http://127.0.0.1:8000
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Response interceptor: auto-refresh JWT on 401 ─────────────
let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      try {
        const { data } = await axios.post('/api/token/refresh/', { refresh })
        const newAccess = data.access
        localStorage.setItem('access_token', newAccess)
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        original.headers['Authorization'] = `Bearer ${newAccess}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
