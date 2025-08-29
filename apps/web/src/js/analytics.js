// Analytics module
import { api } from './api.js';

export async function getKpis({ start, end } = {}) {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  
  const url = params.toString() ? `/analytics/kpis?${params}` : '/analytics/kpis';
  const response = await api(url);
  
  // Transform response to match expected format for existing Chart.js code
  return {
    cards: response.cards,
    series: response.series,
    // Legacy format for backward compatibility (if needed)
    totals: response.cards,
    charts: {
      projectsOverTime: response.series.projectsCompletedMonthly,
      savingsOverTime: response.series.savingsMonthly,
    }
  };
}
