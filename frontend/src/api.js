const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data ?? {};
}

async function downloadBlob(endpoint) {
  const token = localStorage.getItem('token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = `Request failed with status ${response.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch (err) {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.blob();
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password }
  }),
  
  register: (name, email, password, role, dob, phone, address) => request('/auth/register', {
    method: 'POST',
    body: { name, email, password, role, dob, phone, address }
  }),

  // Policies
  getPolicies: () => request('/policies'),
  
  createPolicy: (policyData) => request('/policies', {
    method: 'POST',
    body: policyData
  }),

  requestPolicy: (policyData) => request('/policies/request', {
    method: 'POST',
    body: policyData
  }),

  updatePolicyStatus: (policyId, status) => request(`/policies/${policyId}/status`, {
    method: 'PATCH',
    body: { status }
  }),

  downloadPolicyCertificateUrl: (policyId) => `/api/policies/${policyId}/download`,
  downloadPolicyCertificate: async (policyId) => await downloadBlob(`/policies/${policyId}/download`),

  // Messages
  getMessages: () => request('/messages'),
  sendMessage: (content, customerId) => request('/messages', {
    method: 'POST',
    body: { content, customerId }
  }),

  // Claims
  getClaims: () => request('/claims'),
  
  submitClaim: (policyId, claimAmount, reason) => request('/claims', {
    method: 'POST',
    body: { policyId, claimAmount, reason }
  }),
  
  updateClaimStatus: (claimId, status) => request(`/claims/${claimId}/status`, {
    method: 'PATCH',
    body: { status }
  }),

  // Payments
  getPayments: (policyId) => request(policyId ? `/payments/${policyId}` : '/payments'),
  
  recordPayment: (policyId, amount) => request('/payments', {
    method: 'POST',
    body: { policyId, amount }
  }),

  // Documents
  getDocuments: () => request('/documents/customer'),
  getCustomerDocuments: (customerId) => request(`/documents/customer/${customerId}`),
  
  uploadDocument: (formData) => request('/documents/upload', {
    method: 'POST',
    body: formData, // Handled automatically by fetch since it's FormData
  }),

  downloadDocumentUrl: (documentId) => `/api/documents/${documentId}/download`,
  downloadPolicyCertificateUrl: (policyId) => `/api/policies/${policyId}/download`,
  downloadDocument: async (documentId) => await downloadBlob(`/documents/${documentId}/download`),
  
  // Profile
  getProfile: () => request('/profile'),
  getCustomers: () => request('/profile/all'),
  getAgents: () => request('/profile/agents'),
  updateProfile: (profileData) => request('/profile', {
    method: 'PUT',
    body: profileData
  }),
};

