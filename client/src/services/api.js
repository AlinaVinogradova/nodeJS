const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && localStorage.getItem('crm_token')) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.dispatchEvent(new Event('auth_expired'));
    }
    const error = new Error(data.error || 'Network request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getProfile: () => request('/auth/me')
};

export const leadsApi = {
  getLeads: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.stage && params.stage !== 'All') query.append('stage', params.stage);
    if (params.reminder && params.reminder !== 'all') query.append('reminder', params.reminder);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    return request(`/leads${queryString ? `?${queryString}` : ''}`);
  },

  getLeadById: (id) => request(`/leads/${id}`),

  createLead: (leadData) =>
    request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    }),

  updateLead: (id, leadData) =>
    request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    }),

  updateStage: (id, stage) =>
    request(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage })
    }),

  deleteLead: (id) =>
    request(`/leads/${id}`, {
      method: 'DELETE'
    }),

  getDashboard: () => request('/leads/dashboard'),

  getReminders: () => request('/leads/reminders')
};
