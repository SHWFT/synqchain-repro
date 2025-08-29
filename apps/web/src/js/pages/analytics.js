// Analytics page module with Chart.js integration
import { getKpis } from '../analytics.js';
import { showLoading, hideLoading, showError } from '../ui/loading.js';
import { showErrorToast } from '../ui/toast.js';

let analyticsInitialized = false;
let charts = {};

export async function initializeAnalytics() {
  if (analyticsInitialized) return;
  
  console.log('Initializing analytics page...');
  
  try {
    await loadAnalyticsData();
    analyticsInitialized = true;
  } catch (error) {
    console.error('Error initializing analytics:', error);
    showErrorToast(error);
  }
}

async function loadAnalyticsData() {
  const analyticsContainer = document.querySelector('#analytics-content');
  
  if (!analyticsContainer) {
    console.warn('Analytics container not found');
    return;
  }

  try {
    // Show loading state
    showLoading(analyticsContainer, 'charts');
    
    // Get data with date range (last 6 months by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    const data = await getKpis({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    
    // Hide loading
    hideLoading(analyticsContainer);
    
    // Initialize charts with real data
    initializeCharts(data);
    
  } catch (error) {
    hideLoading(analyticsContainer);
    showError(analyticsContainer, 'Failed to load analytics data', () => {
      analyticsInitialized = false;
      initializeAnalytics();
    });
    throw error;
  }
}

function initializeCharts(data) {
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  charts = {};

  // Initialize Projects Completed Chart
  const projectsCtx = document.getElementById('projectsChart');
  if (projectsCtx) {
    charts.projects = new Chart(projectsCtx, {
      type: 'line',
      data: {
        labels: data.series.projectsCompletedMonthly.labels,
        datasets: [{
          label: 'Projects Completed',
          data: data.series.projectsCompletedMonthly.values,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Projects Completed Over Time'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // Initialize Savings Chart
  const savingsCtx = document.getElementById('savingsChart');
  if (savingsCtx) {
    charts.savings = new Chart(savingsCtx, {
      type: 'bar',
      data: {
        labels: data.series.savingsMonthly.labels,
        datasets: [{
          label: 'Platform Savings ($)',
          data: data.series.savingsMonthly.values,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Platform Savings'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  // Update summary cards if they exist
  updateAnalyticsSummary(data.cards);
}

function updateAnalyticsSummary(cards) {
  const summaryCards = {
    'analytics-active-projects': cards.activeProjects,
    'analytics-active-pos': cards.activePOs,
    'analytics-total-spend': `$${cards.totalSpend.toLocaleString()}`,
    'analytics-platform-savings': `$${cards.platformSavings.toLocaleString()}`
  };

  Object.entries(summaryCards).forEach(([id, value]) => {
    const element = document.getElementById(id) || document.querySelector(`[data-analytics="${id}"]`);
    if (element) {
      element.textContent = value;
    }
  });
}

// Refresh analytics data
export async function refreshAnalytics() {
  analyticsInitialized = false;
  await initializeAnalytics();
}

// Cleanup function
export function cleanupAnalytics() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  charts = {};
  analyticsInitialized = false;
}