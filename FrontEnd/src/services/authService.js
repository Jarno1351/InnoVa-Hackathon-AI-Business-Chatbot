import { apiRequest, setToken, clearToken } from './httpClient.js';

export async function loginUser({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  return data;
}

export async function registerBusiness(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setToken(data.token);
  return data;
}

export async function getProfile() {
  return apiRequest('/auth/profile');
}

export function logoutUser() {
  clearToken();
}
