// Application configuration
export const config = {
  // Global demo data flag - set to true for demo environments
  USE_DEMO_DATA: false,
  
  // API configuration
  API_BASE_URL: 'http://localhost:4000',
  
  // UI configuration
  ITEMS_PER_PAGE: 10,
  FILE_UPLOAD_MAX_SIZE: 25 * 1024 * 1024, // 25MB
  
  // Chart refresh intervals
  ANALYTICS_REFRESH_INTERVAL: 30000, // 30 seconds
};
