// API Client for Dayflow Attendance Service
let inMemoryToken = localStorage.getItem('auth_token') || null;

export function setAuthToken(token) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return inMemoryToken;
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(inMemoryToken ? { 'Authorization': `Bearer ${inMemoryToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      credentials: 'same-origin'
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Users & Auth
  getDemoPersonas: () => request('/api/users/demo-personas'),
  getCurrentUser: () => request('/api/users/me'),
  login: (userId) => request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
  loginCredentials: (email, password) => request('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  logout: () => {
    setAuthToken(null);
    return request('/api/users/logout', { method: 'POST' });
  },

  // Attendance Endpoints
  getTodayStatus: () => request('/api/attendance/today'),
  checkIn: (payload = {}) => request('/api/attendance/checkin', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  checkOut: (payload = {}) => request('/api/attendance/checkout', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMyHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/attendance${query ? `?${query}` : ''}`);
  },
  getWeeklySummary: () => request('/api/attendance/weekly'),
  getAllAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/attendance/all${query ? `?${query}` : ''}`);
  },
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/attendance/analytics${query ? `?${query}` : ''}`);
  }
};

export default api;
