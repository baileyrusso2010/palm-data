import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})
// Interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    // In development, do not attempt to fetch a session/token
    if (import.meta.env.DEV) {
      return config
    }
    try {
      const session = await fetchAuthSession()
      const accessToken = session.tokens?.accessToken?.toString()
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    } catch (err) {
      console.error('No valid session:', err)
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default api
