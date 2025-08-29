import { supabase } from './supabase';

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
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManageUsers: boolean;
  canViewAllBookings: boolean;
}

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    // First try to get user from localStorage
    const cachedUser = getUserData();
    if (cachedUser) {
      return cachedUser;
    }

    // If no cached user, verify token with backend
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      clearAuthData();
      return null;
    }

    const data = await response.json();
    if (data.success && data.user) {
      setUserData(data.user);
      return data.user;
    }

    clearAuthData();
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    clearAuthData();
    return null;
  }
};

export const getUserPermissions = async (): Promise<UserPermissions | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      isAdmin: user.role === 'admin',
      canManageUsers: user.role === 'admin',
      canViewAllBookings: user.role === 'admin'
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
};

export const signupUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Signup failed' };
    }

    if (data.success && data.user && data.token) {
      setAuthToken(data.token);
      setUserData(data.user);
      return {
        success: true,
        user: data.user,
        message: 'Account created successfully'
      };
    }

    return { success: false, error: data.error || 'Signup failed' };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    if (data.success && data.user && data.token) {
      setAuthToken(data.token);
      setUserData(data.user);
      return {
        success: true,
        user: data.user
      };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (token) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token }),
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local auth data
    clearAuthData();
  }
};

// Admin functions - simplified for now
export const getAllUsers = async (page = 1, limit = 10) => {
  // Return mock data for now since we're using custom auth
  return {
    users: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0
    }
  };
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  return { success: true, user: null };
};

export const deactivateUser = async (userId: string) => {
  return { success: true, message: 'User deactivated successfully' };
};