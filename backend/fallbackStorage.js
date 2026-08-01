const fs = require('fs');
const path = require('path');

const FALLBACK_PATH = path.join(__dirname, 'data', 'fallback.json');
const DEFAULT_FALLBACK = {
  users: [],
  customers: [],
  policies: [],
  claims: [],
  payments: [],
};

function loadFallbackStore() {
  try {
    if (!fs.existsSync(FALLBACK_PATH)) {
      return { ...DEFAULT_FALLBACK };
    }

    const raw = fs.readFileSync(FALLBACK_PATH, 'utf-8');
    return raw ? JSON.parse(raw) : { ...DEFAULT_FALLBACK };
  } catch (err) {
    console.warn('Unable to load fallback storage, using empty fallback store.', err.message);
    return { ...DEFAULT_FALLBACK };
  }
}

function saveFallbackStore(store) {
  try {
    const dir = path.dirname(FALLBACK_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to save fallback storage file:', err.message);
  }
}

function getFallbackCustomerByUserId(userId) {
  const store = loadFallbackStore();
  const customer = store.customers.find((item) => item.userId === userId);
  return { store, customer };
}

function getFallbackPoliciesForCustomer(customerId) {
  const store = loadFallbackStore();
  return store.policies.filter((item) => item.customerId === customerId);
}

function getAllFallbackPolicies() {
  return loadFallbackStore().policies;
}

function createFallbackPolicy(customerId, policyData) {
  const store = loadFallbackStore();
  const policy = {
    id: `fb_policy_${Date.now()}`,
    customerId,
    policyType: policyData.policyType,
    policyNumber: policyData.policyNumber,
    premiumAmount: policyData.premiumAmount,
    startDate: policyData.startDate,
    endDate: policyData.endDate,
    status: policyData.status || 'PENDING',
    createdAt: new Date().toISOString(),
  };
  store.policies.push(policy);
  saveFallbackStore(store);
  return policy;
}

module.exports = {
  loadFallbackStore,
  saveFallbackStore,
  getFallbackCustomerByUserId,
  getFallbackPoliciesForCustomer,
  getAllFallbackPolicies,
  createFallbackPolicy,
};
