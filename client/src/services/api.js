// API Client for Dayflow Attendance Service
let currentUserId = localStorage.getItem('dayflow_user_id') || 2; // Default to Alex Chen

export function setCurrentUserId(id) {
  currentUserId = id;
  localStorage.setItem('dayflow_user_id', id);
}

export function getCurrentUserId() {
  return currentUserId;
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': String(currentUserId),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Users & Auth
  // getDemoPersonas — returns only {id, name, role, avatar, department}; blocked in production
  getDemoPersonas: () => request('/api/users/demo-personas'),
  getCurrentUser: () => request('/api/users/me'),

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
