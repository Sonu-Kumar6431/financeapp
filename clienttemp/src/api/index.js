import api from './axiosInstance';

// ── Auth ────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ── Transactions ────────────────────────────────────────
export const transactionApi = {
  getAll:   (params) => api.get('/transactions', { params }),
  create:   (data)   => api.post('/transactions', data),
  update:   (id, data) => api.put(`/transactions/${id}`, data),
  remove:   (id)     => api.delete(`/transactions/${id}`),
  importCSV: (formData) => api.post('/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportCSV: (params) => api.get('/transactions/export', {
    params,
    responseType: 'blob',
  }),
};

// ── Budgets ─────────────────────────────────────────────
export const budgetApi = {
  getAll:   (month) => api.get('/budgets', { params: { month } }),
  upsert:   (data)  => api.post('/budgets', data),
  remove:   (id)    => api.delete(`/budgets/${id}`),
};

// ── Goals ───────────────────────────────────────────────
export const goalApi = {
  getAll:     ()         => api.get('/goals'),
  create:     (data)     => api.post('/goals', data),
  update:     (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, amt)  => api.post(`/goals/${id}/contribute`, { amount: amt }),
  remove:     (id)       => api.delete(`/goals/${id}`),
};

// ── Reminders ───────────────────────────────────────────
export const reminderApi = {
  getAll:   ()           => api.get('/reminders'),
  create:   (data)       => api.post('/reminders', data),
  update:   (id, data)   => api.put(`/reminders/${id}`, data),
  markPaid: (id)         => api.post(`/reminders/${id}/pay`),
  remove:   (id)         => api.delete(`/reminders/${id}`),
};

// ── Analytics ───────────────────────────────────────────
export const analyticsApi = {
  getSummary:          (month)  => api.get('/analytics/summary', { params: { month } }),
  getMonthlyTrend:     (months) => api.get('/analytics/monthly-trend', { params: { months } }),
  getCategoryBreakdown:(month)  => api.get('/analytics/category-breakdown', { params: { month } }),
  getRecent:           ()       => api.get('/analytics/recent'),
};
