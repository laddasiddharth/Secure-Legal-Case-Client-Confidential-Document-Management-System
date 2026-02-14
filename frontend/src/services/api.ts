// API Base URL - Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_TIMEOUT = 30000; // 30 seconds

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

// Get user data from localStorage with validation
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    // Validate user object has required fields
    if (!user || !user.role || !user.email) {
      console.warn("Invalid user data in localStorage");
      localStorage.removeItem("user");
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// Create abort controller for timeout
const createTimeoutController = (timeoutMs: number = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
};

// API request wrapper with authentication and timeout
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON requests (unless it's FormData)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Setup timeout
  const { controller, timeoutId } = createTimeoutController();

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    // Handle forbidden
    if (response.status === 403) {
      throw new Error(
        "Access denied. You do not have permission to perform this action.",
      );
    }

    // Handle server errors
    if (response.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle network errors
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout. Please check your connection and try again.",
      );
    }

    if (error.message === "Failed to fetch") {
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
};

// ==================== CASE APIs ====================

export const caseAPI = {
  // Get all cases (role-filtered)
  getAll: async () => {
    return apiRequest("/cases");
  },

  // Get single case
  getById: async (id: string) => {
    return apiRequest(`/cases/${id}`);
  },

  // Create new case
  create: async (caseData: {
    title: string;
    description: string;
    caseType: string;
    clientId: string;
    priority?: string;
  }) => {
    return apiRequest("/cases", {
      method: "POST",
      body: JSON.stringify(caseData),
    });
  },

  // Update case
  update: async (id: string, updates: any) => {
    return apiRequest(`/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Delete case
  delete: async (id: string) => {
    return apiRequest(`/cases/${id}`, {
      method: "DELETE",
    });
  },

  // Get statistics
  getStats: async () => {
    return apiRequest("/cases/stats/summary");
  },

  // Get all clients (for lawyers)
  getClients: async () => {
    return apiRequest("/cases/clients/list");
  },

  // Get case QR code
  getQRCode: async (id: string) => {
    return apiRequest(`/cases/${id}/qr`);
  },
};

// ==================== DOCUMENT APIs ====================

export const documentAPI = {
  // Upload document
  upload: async (formData: FormData) => {
    return apiRequest("/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  // Get documents for a case
  getByCaseId: async (caseId: string) => {
    return apiRequest(`/documents/case/${caseId}`);
  },

  // Download document
  download: async (id: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Download failed");
    }

    return response.blob();
  },

  // Delete document
  delete: async (id: string) => {
    return apiRequest(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  // Sign document
  sign: async (id: string) => {
    return apiRequest(`/documents/${id}/sign`, {
      method: "PATCH",
    });
  },
};

// ==================== ADMIN APIs ====================

export const adminAPI = {
  // Get all users
  getUsers: async () => {
    return apiRequest("/admin/users");
  },

  // Get single user
  getUserById: async (id: string) => {
    return apiRequest(`/admin/users/${id}`);
  },

  // Create user
  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
  }) => {
    return apiRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (id: string, updates: any) => {
    return apiRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Lock/Unlock user
  toggleLock: async (id: string) => {
    return apiRequest(`/admin/users/${id}/lock`, {
      method: "PUT",
    });
  },

  // Delete user
  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  // Get audit logs
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.action) queryParams.append("action", params.action);

    const query = queryParams.toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ""}`);
  },

  // Get system statistics
  getStats: async () => {
    return apiRequest("/admin/stats");
  },
};

// ==================== AUTH APIs ====================

export const authAPI = {
  // Register
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    fullName: string;
    phoneNumber?: string;
  }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Login
  login: async (email: string, password: string) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Verify OTP
  verifyOTP: async (userId: string, otp: string) => {
    return apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ userId, otp }),
    });
  },

  // Logout
  logout: async () => {
    const response = await apiRequest("/auth/logout", {
      method: "POST",
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response;
  },
};

// ==================== HELPER FUNCTIONS ====================

// Save auth data
export const saveAuthData = (token: string, user: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Clear auth data
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Check user role
export const hasRole = (role: string) => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole("admin");
};

// Check if user is lawyer
export const isLawyer = () => {
  return hasRole("lawyer");
};

// Check if user is client
export const isClient = () => {
  return hasRole("client");
};
