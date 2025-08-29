// Analytics module
import { api } from './api.js';

export async function getKpis({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  
  const url = params.toString() ? `/analytics/kpis?${params}` : '/analytics/kpis';
  return api(url);
}
