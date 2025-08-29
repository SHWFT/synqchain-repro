interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api(path: string, options: ApiOptions = {}) {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(path, config);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Show error toast for network errors
    console.error("API Error:", error);
    
    // You can integrate with your toast system here
    // showErrorToast("Network error occurred");
    
    throw new ApiError("Network error", 0, error);
  }
}

// Convenience methods
export const apiGet = (path: string) => api(path);
export const apiPost = (path: string, body?: any) => api(path, { method: "POST", body });
export const apiPut = (path: string, body?: any) => api(path, { method: "PUT", body });
export const apiDelete = (path: string) => api(path, { method: "DELETE" });

// Auth methods
export const authApi = {
  login: (email: string, password: string) => 
    apiPost("/api/auth/login", { email, password }),
  
  logout: () => 
    apiPost("/api/auth/logout"),
  
  me: () => 
    apiGet("/api/auth/me"),
};

// Resource APIs
export const suppliersApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.search) searchParams.set("search", params.search);
    
    const query = searchParams.toString();
    return apiGet(`/api/suppliers${query ? `?${query}` : ""}`);
  },
  
  create: (supplier: any) => 
    apiPost("/api/suppliers", supplier),
  
  get: (id: string) => 
    apiGet(`/api/suppliers/${id}`),
  
  update: (id: string, updates: any) => 
    apiPut(`/api/suppliers/${id}`, updates),
  
  delete: (id: string) => 
    apiDelete(`/api/suppliers/${id}`),
};

export const projectsApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    
    const query = searchParams.toString();
    return apiGet(`/api/projects${query ? `?${query}` : ""}`);
  },
  
  create: (project: any) => 
    apiPost("/api/projects", project),
  
  get: (id: string) => 
    apiGet(`/api/projects/${id}`),
  
  update: (id: string, updates: any) => 
    apiPut(`/api/projects/${id}`, updates),
  
  delete: (id: string) => 
    apiDelete(`/api/projects/${id}`),
};

export const poApi = {
  list: (params?: { page?: number; pageSize?: number; status?: string; supplierId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.supplierId) searchParams.set("supplierId", params.supplierId);
    
    const query = searchParams.toString();
    return apiGet(`/api/po${query ? `?${query}` : ""}`);
  },
  
  create: (po: any) => 
    apiPost("/api/po", po),
  
  get: (id: string) => 
    apiGet(`/api/po/${id}`),
  
  update: (id: string, updates: any) => 
    apiPut(`/api/po/${id}`, updates),
  
  delete: (id: string) => 
    apiDelete(`/api/po/${id}`),
  
  submit: (id: string, notes?: string) => 
    apiPost(`/api/po/${id}/submit`, { notes }),
  
  approve: (id: string, notes?: string) => 
    apiPost(`/api/po/${id}/approve`, { notes }),
  
  getEvents: (id: string, params?: { page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
    
    const query = searchParams.toString();
    return apiGet(`/api/po/${id}/events${query ? `?${query}` : ""}`);
  },
};
