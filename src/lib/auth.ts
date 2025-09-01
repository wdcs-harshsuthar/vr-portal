

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

import { apiGet, apiPost } from './api';

// Token management - using consistent keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setUserData = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (!token) {
    return null;
  }
  
  const result = await apiGet<{ user: User }>('/auth/profile');
  
  if (result.success && result.data?.user) {
    return result.data.user;
  }
  
  // If we get here, the token is likely invalid
  if (result.error?.includes('Authentication expired') || result.error?.includes('Unauthorized')) {
    console.log('Token expired or invalid, clearing auth data');
    clearAuthData();
  }
  
  return null;
};

export const signupUser = async (
  credentials: SignupCredentials
): Promise<{ success: boolean; user?: User; message?: string; error?: string }> => {
  const result = await apiPost<{ token: string; user: User; message: string }>('/auth/signup', credentials, { requireAuth: false });
  
  if (result.success && result.data) {
    // Store token and user data
    setAuthToken(result.data.token);
    setUserData(result.data.user);
    return { success: true, user: result.data.user, message: result.data.message };
  }
  
  return { success: false, error: result.error || 'Signup failed' };
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; user?: User; message?: string; error?: string }> => {
  const result = await apiPost<{ token: string; user: User; message: string }>('/auth/login', credentials, { requireAuth: false });
  
  if (result.success && result.data) {
    // Store token and user data
    setAuthToken(result.data.token);
    setUserData(result.data.user);

    // If user is admin, also store admin tokens
    if (result.data.user.role === 'admin') {
      localStorage.setItem('adminToken', result.data.token);
      localStorage.setItem('adminUser', JSON.stringify(result.data.user));
    }

    return { success: true, user: result.data.user, message: result.data.message };
  }
  
  return { success: false, error: result.error || 'Login failed' };
};

export const logoutUser = async () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      await apiPost('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage (including admin tokens)
  clearAuthData();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};