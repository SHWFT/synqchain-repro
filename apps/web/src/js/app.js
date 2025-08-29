// Main application entry point
import { initializeNavigation } from './navigation.js';
import { me, logout } from './auth.js';
import './ui/toast.js'; // Initialize toast system

let currentUser = null;

async function initializeApp() {
  console.log('Initializing SynqChain application...');
  
  try {
    // Check if user is authenticated
    const userResult = await me();
    currentUser = userResult.user;
    
    // Show main app, hide login
    showMainApp();
    
    // Initialize navigation
    initializeNavigation();
    
    console.log('App initialized successfully for user:', currentUser.email);
  } catch (error) {
    console.log('User not authenticated, showing login');
    showLogin();
  }
}

function showMainApp() {
  const loginContainer = document.querySelector('.login-container');
  const appContainer = document.querySelector('.app-container');
  
  if (loginContainer) loginContainer.classList.add('hidden');
  if (appContainer) appContainer.classList.add('active');
  
  // Update user info in the UI
  if (currentUser) {
    const userEmailElement = document.querySelector('[data-user-email]');
    if (userEmailElement) {
      userEmailElement.textContent = currentUser.email;
    }
  }
}

function showLogin() {
  const loginContainer = document.querySelector('.login-container');
  const appContainer = document.querySelector('.app-container');
  
  if (loginContainer) loginContainer.classList.remove('hidden');
  if (appContainer) appContainer.classList.remove('active');
  
  // Setup login form handlers
  setupLoginHandlers();
}

function setupLoginHandlers() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const { login } = await import('./auth.js');
    const result = await login(email, password);
    currentUser = result.user;
    
    console.log('Login successful:', currentUser.email);
    showMainApp();
    initializeNavigation();
  } catch (error) {
    console.error('Login failed:', error);
    showLoginError(error.message);
  }
}

function showLoginError(message) {
  // Show error message in login form
  let errorDiv = document.getElementById('login-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'login-error';
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }
  }
  errorDiv.textContent = message;
}

async function handleLogout() {
  try {
    await logout();
    currentUser = null;
    showLogin();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Global functions
window.handleLogout = handleLogout;
window.getCurrentUser = () => currentUser;
