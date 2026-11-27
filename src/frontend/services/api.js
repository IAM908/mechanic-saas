const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TOKEN_KEY = 'mechanic_saas_token'
const USER_KEY = 'mechanic_saas_user'

const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split('.')[1] 
    if (!payloadBase64) return true
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalized))
    if (!payload.exp) return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (isTokenExpired(token)) {
    clearSession()
    return null
  }
  return token
}

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    clearSession()  
    return null
  }
}

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getHomeRouteByRole = (role) => {
  if (role === 'customer') return '/usuario'
  return '/admin-dashboard'
}

export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true
  } = options

  const requestHeaders = { ...headers }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body:
      body !== undefined
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined
  })

  const rawText = await response.text()
  let data = null

  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { message: rawText }
    }
  }

  if (response.status === 401 && auth) {
    clearSession()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Error al comunicarse con el servidor.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}