import { mockAdapter } from './mock';
import type { Adapter } from './adapter';

export function getAdapter(): Adapter {
  const provider = process.env.ERP_PROVIDER || 'mock';
  switch (provider) {
    case 'mock':
      return mockAdapter;
    case 'none':
    default:
      return {
        ...mockAdapter,
        async getKpis() {
          return {
            cards: {
              totalSpend: 0,
              platformSavings: 0,
              activeProjects: 0,
              activeSuppliers: 0,
            },
            series: {
              projectsCompletedMonthly: { labels: [], values: [] },
              savingsMonthly: { labels: [], values: [] },
            },
          };
        },
        async getActivity() {
          return [];
        },
        async getERPHealth() {
          return [];
        },
        async listProjects() {
          return [];
        },
        async listSuppliers() {
          return [];
        },
        async listPOs() {
          return [];
        },
      };
  }
}
