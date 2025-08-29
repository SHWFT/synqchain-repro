// Purchase Orders module
import { api } from './api.js';

export async function listPOs({ search } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const url = params.toString() ? `/po?${params}` : '/po';
  return api(url);
}

export async function createPO(poData) {
  return api('/po', {
    method: 'POST',
    body: poData
  });
}

export async function getPO(id) {
  return api(`/po/${id}`);
}

export async function updatePO(id, poData) {
  return api(`/po/${id}`, {
    method: 'PUT',
    body: poData
  });
}

export async function submitPO(id, notes = '') {
  return api(`/po/${id}/submit`, {
    method: 'POST',
    body: { notes }
  });
}

export async function approvePO(id, notes = '') {
  return api(`/po/${id}/approve`, {
    method: 'POST',
    body: { notes }
  });
}

export async function getPOEvents(id, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const url = params.toString() ? `/po/${id}/events?${params}` : `/po/${id}/events`;
  return api(url);
}

export async function deletePO(id) {
  return api(`/po/${id}`, {
    method: 'DELETE'
  });
}
