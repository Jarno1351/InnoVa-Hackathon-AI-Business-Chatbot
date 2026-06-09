import { apiRequest } from './httpClient.js';

export function getMyBranches() {
  return apiRequest('/branch/all');
}

export function createBranch(payload) {
  return apiRequest('/branch/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getBranchSupplies(branchId) {
  return apiRequest(`/supply/branch/${branchId}`);
}

export function getBranchServices(branchId) {
  return apiRequest(`/service/branch/${branchId}`);
}

export function addSupplyItem(payload) {
  return apiRequest('/supply/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function addServiceItem(payload) {
  return apiRequest('/service/add', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
