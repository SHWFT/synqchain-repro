// Demo data module - only used when USE_DEMO_DATA is true
import { config } from './config.js';

// Mock data for demo mode
const mockSuppliers = [
  { id: '1', name: 'Acme Corp', category: 'Manufacturing', location: 'New York, NY', contact: 'John Smith', phone: '+1-555-0101' },
  { id: '2', name: 'Global Logistics Ltd', category: 'Logistics', location: 'Los Angeles, CA', contact: 'Sarah Johnson', phone: '+1-555-0102' },
  { id: '3', name: 'Tech Solutions Inc', category: 'Technology', location: 'San Francisco, CA', contact: 'Mike Wilson', phone: '+1-555-0103' },
];

const mockProjects = [
  { id: '1', name: 'Supply Chain Optimization', client: 'Acme Corp', priority: 'High', status: 'In Progress', savingsTarget: 50000, dueDate: '2024-12-31' },
  { id: '2', name: 'Cost Reduction Initiative', client: 'Tech Solutions Inc', priority: 'Medium', status: 'Planning', savingsTarget: 75000, dueDate: '2024-11-30' },
  { id: '3', name: 'Vendor Consolidation', client: 'Global Logistics Ltd', priority: 'High', status: 'Completed', savingsTarget: 30000, dueDate: '2024-10-15' },
];

const mockPOs = [
  { id: '1', number: 'PO-2024-001', supplier: { name: 'Acme Corp' }, status: 'APPROVED', total: 49100, currency: 'USD', createdAt: '2024-01-15' },
  { id: '2', number: 'PO-2024-002', supplier: { name: 'Tech Solutions Inc' }, status: 'PENDING_APPROVAL', total: 25000, currency: 'USD', createdAt: '2024-01-20' },
  { id: '3', number: 'PO-2024-003', supplier: { name: 'Global Logistics Ltd' }, status: 'DRAFT', total: 15500, currency: 'USD', createdAt: '2024-01-25' },
];

const mockAnalytics = {
  cards: {
    activeProjects: 8,
    activePOs: 12,
    totalSpend: 487500,
    platformSavings: 125000
  },
  series: {
    projectsCompletedMonthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [3, 5, 2, 7, 4, 6]
    },
    savingsMonthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [15000, 25000, 10000, 35000, 20000, 30000]
    }
  }
};

// Demo API functions
export function getDemoSuppliers() {
  if (!config.USE_DEMO_DATA) {
    throw new Error('Demo mode is disabled');
  }
  return Promise.resolve(mockSuppliers);
}

export function getDemoProjects() {
  if (!config.USE_DEMO_DATA) {
    throw new Error('Demo mode is disabled');
  }
  return Promise.resolve(mockProjects);
}

export function getDemoPOs() {
  if (!config.USE_DEMO_DATA) {
    throw new Error('Demo mode is disabled');
  }
  return Promise.resolve(mockPOs);
}

export function getDemoAnalytics() {
  if (!config.USE_DEMO_DATA) {
    throw new Error('Demo mode is disabled');
  }
  return Promise.resolve(mockAnalytics);
}

export function isDemoMode() {
  return config.USE_DEMO_DATA;
}
