const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('krishi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  getDemoAccounts: () => request<any[]>('/auth/demo-accounts'),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updatePreferences: (data: any) => request<any>('/auth/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  // Listings
  getListings: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any[]>(`/listings?${query.toString()}`);
  },
  getMyListings: () => request<any[]>('/listings/mine'),
  getListing: (id: number) => request<any>(`/listings/${id}`),
  createListing: (data: any) => request<any>('/listings', { method: 'POST', body: JSON.stringify(data) }),
  updateListing: (id: number, data: any) => request<any>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteListing: (id: number) => request<any>(`/listings/${id}`, { method: 'DELETE' }),

  // Pricing & Profit
  getPriceEstimate: (data: any) => request<any>('/pricing/estimate', { method: 'POST', body: JSON.stringify(data) }),
  getPriceTrends: (produce: string, region?: string) => {
    const query = new URLSearchParams({ produce });
    if (region) query.append('region', region);
    return request<any>(`/pricing/trends?${query.toString()}`);
  },
  calculateProfit: (data: any) => request<any>('/pricing/calculator', { method: 'POST', body: JSON.stringify(data) }),

  // Orders
  getOrders: () => request<any[]>('/orders'),
  getOrderDetail: (id: number) => request<any>(`/orders/${id}`),
  createOrder: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: number, status: string, note?: string) =>
    request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
  verifyOTP: (id: number, otp_code: string) =>
    request<any>(`/orders/${id}/verify-otp`, { method: 'POST', body: JSON.stringify({ order_id: id, otp_code }) }),
  cancelOrder: (id: number) => request<any>(`/orders/${id}/cancel`, { method: 'POST' }),

  // Pooling
  getPools: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });
    return request<any[]>(`/pooling?${query.toString()}`);
  },
  getPoolDetails: (id: number) => request<any>(`/pooling/${id}`),
  createPool: (data: any) => request<any>('/pooling/create', { method: 'POST', body: JSON.stringify(data) }),
  joinPool: (data: any) => request<any>('/pooling/join', { method: 'POST', body: JSON.stringify(data) }),
  smartMatchPool: (produce_type: string, quantity_kg: number, village: string, destination_market: string) => {
    const query = new URLSearchParams({ produce_type, quantity_kg: String(quantity_kg), village, destination_market });
    return request<any>(`/pooling/smart-match?${query.toString()}`, { method: 'POST' });
  },

  // Transporter
  getTransporterJobs: () => request<any>('/transporter/available-jobs'),
  claimOrderDelivery: (orderId: number) => request<any>(`/transporter/claim-order/${orderId}`, { method: 'POST' }),
  claimPoolRoute: (poolId: number) => request<any>(`/transporter/claim-pool/${poolId}`, { method: 'POST' }),

  // Admin
  getAdminMetrics: () => request<any>('/admin/metrics'),
  getAllUsers: () => request<any[]>('/admin/users'),
  toggleUserStatus: (userId: number, isActive: boolean) =>
    request<any>(`/admin/users/${userId}/status?is_active=${isActive}`, { method: 'PUT' }),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/mark-all-read', { method: 'PUT' }),

  // Voice Assistant
  getVoiceLanguages: () => request<any[]>('/voice/languages'),
  processVoiceCommand: (data: { text: string; language: string; role?: string }) =>
    request<any>('/voice/process-command', { method: 'POST', body: JSON.stringify(data) }),
};
