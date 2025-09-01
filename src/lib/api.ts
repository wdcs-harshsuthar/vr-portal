const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  retryAfter?: number;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  retries?: number;
  retryDelay?: number;
  requireAuth?: boolean;
}

// Default retry configuration
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Exponential backoff delay
const getRetryDelay = (attempt: number, baseDelay: number): number => {
  return baseDelay * Math.pow(2, attempt - 1);
};

// Check if error is retryable
const isRetryableError = (status: number): boolean => {
  return status === 429 || status >= 500;
};

// API call with retry logic and rate limit handling
export const apiCall = async <T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    headers = {},
    body,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    requireAuth = true
  } = options;

  // Add authentication header if required
  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add content type for requests with body
  if (body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  let lastError: any;
  let retryAfter: number | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const requestOptions: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
      const data = await response.json();

      // Handle rate limiting
      if (response.status === 429) {
        retryAfter = data.retryAfter || 900; // Default to 15 minutes
        console.warn(`Rate limited. Retry after ${retryAfter} seconds. Attempt ${attempt}/${retries}`);
        
        if (attempt < retries) {
          // Wait for the specified retry time or use exponential backoff
          const waitTime = Math.min(retryAfter * 1000, getRetryDelay(attempt, retryDelay));
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          return {
            success: false,
            error: data.message || 'Rate limit exceeded. Please try again later.',
            retryAfter
          };
        }
      }

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return {
          success: false,
          error: 'Authentication expired. Please log in again.'
        };
      }

      // Handle other errors
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      // Success response
      return {
        success: true,
        data: data.data || data
      };

    } catch (error) {
      lastError = error;
      console.error(`API call failed (attempt ${attempt}/${retries}):`, error);

      // Don't retry on network errors for the last attempt
      if (attempt === retries) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        };
      }

      // Wait before retrying
      const waitTime = getRetryDelay(attempt, retryDelay);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Request failed after multiple attempts'
  };
};

// Convenience methods for common HTTP methods
export const apiGet = <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiCall<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiCall<T>(endpoint, { ...options, method: 'POST', body });

export const apiPut = <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiCall<T>(endpoint, { ...options, method: 'PUT', body });

export const apiPatch = <T = any>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiCall<T>(endpoint, { ...options, method: 'PATCH', body });

export const apiDelete = <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiCall<T>(endpoint, { ...options, method: 'DELETE' });

// Rate limit status checker
export const checkRateLimitStatus = async (): Promise<{
  auth: { remaining: number; reset: number };
  payments: { remaining: number; reset: number };
  general: { remaining: number; reset: number };
} | null> => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    if (response.ok) {
      const data = await response.json();
      return data.rateLimits || null;
    }
  } catch (error) {
    console.error('Failed to check rate limit status:', error);
  }
  return null;
};
