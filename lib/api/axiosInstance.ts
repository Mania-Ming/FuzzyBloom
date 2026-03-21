import axios from "axios"

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const BASE_URL ="http://localhost:8000/api"
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = []

function processQueue(error: any) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(null)
  })
  failedQueue = []
}

const SKIP_REFRESH_URLS = ["/auth/refresh/", "/auth/login/", "/auth/register/"]

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl: string = originalRequest?.url ?? ""
    const shouldSkip = SKIP_REFRESH_URLS.some((url) => requestUrl.includes(url))

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post("/auth/refresh/")
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
