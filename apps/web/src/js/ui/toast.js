// Toast notification system

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 5000) {
  const container = ensureToastContainer();
  
  const toast = document.createElement('div');
  const toastId = `toast-${Date.now()}`;
  toast.id = toastId;
  
  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white'
  };
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.className = `${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full`;
  
  toast.innerHTML = `
    <span class="font-medium">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="text-white hover:text-gray-200 ml-2" onclick="removeToast('${toastId}')">✕</button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 10);
  
  // Auto-remove
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toastId);
    }, duration);
  }
  
  return toastId;
}

export function removeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export function clearAllToasts() {
  const container = ensureToastContainer();
  container.innerHTML = '';
}

export function showErrorToast(error) {
  let message = 'An error occurred';
  
  if (error.code === 'VALIDATION_ERROR' && error.details) {
    // Handle validation errors
    const fieldErrors = Object.values(error.details).flat();
    message = fieldErrors.join(', ');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    message = 'Too many requests. Please try again later.';
  } else if (error.code === 'UNAUTHORIZED') {
    message = 'Please log in to continue.';
  } else if (error.message) {
    message = error.message;
  }
  
  return showToast(message, 'error');
}

// Global function for backwards compatibility
window.showToast = showToast;
window.removeToast = removeToast;
window.showErrorToast = showErrorToast;
