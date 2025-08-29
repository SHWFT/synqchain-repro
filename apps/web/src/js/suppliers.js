// Suppliers module
import { api } from './api.js';

export async function listSuppliers({ search } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const url = params.toString() ? `/suppliers?${params}` : '/suppliers';
  return api(url);
}

export async function createSupplier(supplierData) {
  return api('/suppliers', {
    method: 'POST',
    body: supplierData
  });
}

export async function getSupplier(id) {
  return api(`/suppliers/${id}`);
}

export async function updateSupplier(id, supplierData) {
  return api(`/suppliers/${id}`, {
    method: 'PUT',
    body: supplierData
  });
}

export async function deleteSupplier(id) {
  return api(`/suppliers/${id}`, {
    method: 'DELETE'
  });
}
