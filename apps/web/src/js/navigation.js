// Navigation module - replaces inline onclick handlers
let currentPage = 'dashboard';

export function initializeNavigation() {
  // Add delegated event listener to the navigation container
  const navContainer = document.querySelector('.flex.space-x-4');
  if (navContainer) {
    navContainer.addEventListener('click', handleNavClick);
  }

  // Add account dropdown handler
  const accountButton = document.getElementById('account-dropdown-button');
  if (accountButton) {
    accountButton.addEventListener('click', toggleAccountDropdown);
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    const dropdownButton = document.getElementById('account-dropdown-button');
    const dropdownMenu = document.getElementById('account-dropdown-menu');
    
    if (dropdownButton && dropdownMenu && 
        !dropdownButton.contains(event.target) && 
        !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add('hidden');
      const chevron = document.getElementById('account-dropdown-chevron');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Initialize with dashboard page
  showPage('dashboard');
}

function handleNavClick(event) {
  const button = event.target.closest('.nav-item-horizontal');
  if (!button) return;

  event.preventDefault();
  
  // Extract page name from button ID (e.g., 'nav-dashboard' -> 'dashboard')
  const pageId = button.id.replace('nav-', '');
  
  console.log('Navigation clicked:', pageId);
  
  // Update active navigation state
  updateHorizontalNavActive(pageId);
  
  // Navigate to the selected page
  showPage(pageId);
}

function updateHorizontalNavActive(activePage) {
  console.log('updateHorizontalNavActive called with:', activePage);
  
  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item-horizontal');
  navItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to the selected nav item
  const activeNavItem = document.getElementById(`nav-${activePage}`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
}

function showPage(pageId) {
  console.log('showPage called for:', pageId);
  currentPage = pageId;
  
  // Hide all content pages first
  const allPages = document.querySelectorAll('.content-page');
  console.log('Found pages:', allPages.length);
  
  try {
    allPages.forEach((page, index) => {
      console.log(`Hiding page ${index}: ${page.id}`);
      page.classList.remove('active');
      page.style.display = 'none';
      page.style.visibility = 'hidden';
      page.style.opacity = '0';
    });
    console.log('All pages hidden successfully');
  } catch (error) {
    console.error('Error hiding pages:', error);
  }
  
  // Show target page immediately
  console.log('Looking for target page:', pageId + '-content');
  const targetPage = document.getElementById(pageId + '-content');
  console.log('Target page found:', !!targetPage, targetPage);
  
  if (targetPage) {
    // Set all display properties directly with force
    targetPage.style.setProperty('display', 'block', 'important');
    targetPage.style.setProperty('visibility', 'visible', 'important');
    targetPage.style.setProperty('opacity', '1', 'important');
    targetPage.classList.add('active');
    
    console.log('Page visibility after setting:', {
      display: getComputedStyle(targetPage).display,
      visibility: getComputedStyle(targetPage).visibility,
      opacity: getComputedStyle(targetPage).opacity
    });
    
    // Call page-specific initialization
    initializePage(pageId);
  } else {
    console.error('Page not found:', pageId + '-content');
  }
}

function initializePage(pageId) {
  // Import and call the appropriate page initializer
  switch (pageId) {
    case 'dashboard':
      import('./pages/dashboard.js').then(module => module.initializeDashboard());
      break;
    case 'projects':
      import('./pages/projects.js').then(module => module.initializeProjects());
      break;
    case 'suppliers':
      import('./pages/suppliers.js').then(module => module.initializeSuppliers());
      break;
    case 'po':
      import('./pages/po.js').then(module => module.initializePO());
      break;
    case 'analytics':
      import('./pages/analytics.js').then(module => module.initializeAnalytics());
      break;
    case 'supplier-portal':
      import('./pages/supplier-portal.js').then(module => module.initializeSupplierPortal());
      break;
    case 'erp-integration':
      import('./pages/erp-integration.js').then(module => module.initializeERPIntegration());
      break;
    case 'settings':
      import('./pages/settings.js').then(module => module.initializeSettings());
      break;
  }
}

function toggleAccountDropdown() {
  const dropdownMenu = document.getElementById('account-dropdown-menu');
  const chevron = document.getElementById('account-dropdown-chevron');
  
  if (dropdownMenu && chevron) {
    if (dropdownMenu.classList.contains('hidden')) {
      dropdownMenu.classList.remove('hidden');
      chevron.style.transform = 'rotate(180deg)';
    } else {
      dropdownMenu.classList.add('hidden');
      chevron.style.transform = 'rotate(0deg)';
    }
  }
}

// Expose functions for debugging
window.showPage = showPage;
window.currentPage = () => currentPage;
