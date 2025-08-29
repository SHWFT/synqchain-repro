// Dashboard page module
import { getKpis } from '../analytics.js';
import { showLoading, hideLoading, showError } from '../ui/loading.js';
import { showToast, showErrorToast } from '../ui/toast.js';

let dashboardInitialized = false;

export async function initializeDashboard() {
  if (dashboardInitialized) return;
  
  console.log('Initializing dashboard...');
  
  const kpiContainer = document.querySelector('#dashboard-content .grid');
  
  try {
    // Show loading state
    if (kpiContainer) {
      showLoading(kpiContainer, 'cards');
    }
    
    // Load KPI data
    const data = await getKpis();
    
    // Hide loading and update KPIs
    if (kpiContainer) {
      hideLoading(kpiContainer);
    }
    
    updateDashboardKPIs(data.cards || data.totals);
    dashboardInitialized = true;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Hide loading and show error
    if (kpiContainer) {
      hideLoading(kpiContainer);
      showError(kpiContainer, 'Failed to load dashboard data', () => {
        dashboardInitialized = false;
        initializeDashboard();
      });
    }
    
    showErrorToast(error);
  }
}

function updateDashboardKPIs(totals) {
  // Update KPI cards with real data
  const kpiElements = {
    activeProjects: document.querySelector('[data-kpi="active-projects"]'),
    activePOs: document.querySelector('[data-kpi="active-pos"]'),
    totalSpend: document.querySelector('[data-kpi="total-spend"]'),
    platformSavings: document.querySelector('[data-kpi="platform-savings"]')
  };

  if (kpiElements.activeProjects) {
    kpiElements.activeProjects.textContent = totals.activeProjects || 0;
  }
  
  if (kpiElements.activePOs) {
    kpiElements.activePOs.textContent = totals.activePOs || 0;
  }
  
  if (kpiElements.totalSpend) {
    kpiElements.totalSpend.textContent = `$${(totals.totalSpend || 0).toLocaleString()}`;
  }
  
  if (kpiElements.platformSavings) {
    kpiElements.platformSavings.textContent = `$${(totals.platformSavings || 0).toLocaleString()}`;
  }
}

function showDashboardError(error) {
  console.error('Dashboard error:', error);
  // For now, just log the error. In production, show user-friendly error message
}
