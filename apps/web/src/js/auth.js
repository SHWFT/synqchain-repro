// Authentication module
import { api } from './api.js';

export async function login(email, password) {
  return api('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

export async function register(email, password) {
  return api('/auth/register', {
    method: 'POST',
    body: { email, password }
  });
}

export async function me() {
  return api('/auth/me');
}

export async function logout() {
  return api('/auth/logout', {
    method: 'POST'
  });
}
