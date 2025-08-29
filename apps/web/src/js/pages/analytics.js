// Analytics page module
import { getKpis } from '../analytics.js';

let analyticsInitialized = false;
let charts = {};

export async function initializeAnalytics() {
  console.log('Initializing analytics page...');
  
  try {
    // Load analytics data
    const data = await getKpis();
    updateAnalyticsKPIs(data.totals);
    initializeCharts(data.charts);
    analyticsInitialized = true;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    showAnalyticsError(error);
  }
}

function updateAnalyticsKPIs(totals) {
  // Find and update KPI cards in analytics section
  const analyticsSection = document.getElementById('analytics-content');
  if (!analyticsSection) return;

  const kpiCards = analyticsSection.querySelectorAll('[data-kpi]');
  kpiCards.forEach(card => {
    const kpiType = card.getAttribute('data-kpi');
    switch (kpiType) {
      case 'active-projects':
        card.textContent = totals.activeProjects || 0;
        break;
      case 'active-pos':
        card.textContent = totals.activePOs || 0;
        break;
      case 'total-spend':
        card.textContent = `$${(totals.totalSpend || 0).toLocaleString()}`;
        break;
      case 'platform-savings':
        card.textContent = `$${(totals.platformSavings || 0).toLocaleString()}`;
        break;
    }
  });
}

function initializeCharts(chartData) {
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
  charts = {};

  // Initialize projects over time chart
  const projectsCtx = document.getElementById('projectsChart');
  if (projectsCtx && chartData.projectsOverTime) {
    charts.projects = new Chart(projectsCtx, {
      type: 'line',
      data: {
        labels: chartData.projectsOverTime.map(item => item.month),
        datasets: [{
          label: 'Projects Completed',
          data: chartData.projectsOverTime.map(item => item.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
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
            beginAtZero: true
          }
        }
      }
    });
  }

  // Initialize savings over time chart
  const savingsCtx = document.getElementById('savingsChart');
  if (savingsCtx && chartData.savingsOverTime) {
    charts.savings = new Chart(savingsCtx, {
      type: 'bar',
      data: {
        labels: chartData.savingsOverTime.map(item => item.month),
        datasets: [{
          label: 'Platform Savings ($)',
          data: chartData.savingsOverTime.map(item => item.savings),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Platform Savings Over Time'
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

  // Initialize spend over time chart
  const spendCtx = document.getElementById('spendChart');
  if (spendCtx && chartData.spendOverTime) {
    charts.spend = new Chart(spendCtx, {
      type: 'line',
      data: {
        labels: chartData.spendOverTime.map(item => item.month),
        datasets: [{
          label: 'Total Spend ($)',
          data: chartData.spendOverTime.map(item => item.spend),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Total Spend Over Time'
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
}

function showAnalyticsError(error) {
  console.error('Analytics error:', error);
  // Show user-friendly error message
}
