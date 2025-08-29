// Loading states and UI utilities

export function createLoadingSpinner(size = 'md') {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return `
    <div class="flex justify-center items-center">
      <div class="${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  `;
}

export function createLoadingSkeleton(type = 'table') {
  switch (type) {
    case 'table':
      return `
        <div class="animate-pulse">
          ${Array.from({ length: 5 }, () => `
            <div class="flex space-x-4 py-4">
              <div class="h-4 bg-gray-200 rounded flex-1"></div>
              <div class="h-4 bg-gray-200 rounded flex-1"></div>
              <div class="h-4 bg-gray-200 rounded flex-1"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          `).join('')}
        </div>
      `;
    case 'cards':
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${Array.from({ length: 4 }, () => `
            <div class="animate-pulse">
              <div class="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          `).join('')}
        </div>
      `;
    case 'chart':
      return `
        <div class="animate-pulse">
          <div class="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      `;
    default:
      return createLoadingSpinner();
  }
}

export function showLoading(element, type = 'spinner') {
  if (!element) return;
  
  element.dataset.originalContent = element.innerHTML;
  
  if (type === 'spinner') {
    element.innerHTML = createLoadingSpinner();
  } else {
    element.innerHTML = createLoadingSkeleton(type);
  }
  
  element.classList.add('loading');
}

export function hideLoading(element) {
  if (!element) return;
  
  if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
  }
  
  element.classList.remove('loading');
}

export function showError(element, message, onRetry = null) {
  if (!element) return;
  
  const retryButton = onRetry ? `
    <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
            onclick="(${onRetry.toString()})()">
      Retry
    </button>
  ` : '';
  
  element.innerHTML = `
    <div class="text-center py-8">
      <div class="text-red-600 mb-2">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-gray-600 mb-2">${message}</p>
      ${retryButton}
    </div>
  `;
}
