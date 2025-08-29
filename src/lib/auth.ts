export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
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
  token?: string;
  sessionToken?: string;
  expiresAt?: string;
  error?: string;
  message?: string;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManageUsers: boolean;
  canViewAllBookings: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Storage keys
const TOKEN_KEY = 'authToken';
const SESSION_TOKEN_KEY = 'sessionToken';
const USER_KEY = 'user';

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userData = localStorage.getItem(USER_KEY);
  
  if (!token || !userData) {
    return null;
  }
  
  try {
    // Verify token is still valid
    const isValid = await verifyToken(token);
    if (!isValid) {
      clearAuthData();
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    clearAuthData();
    return null;
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return response.ok && data.valid;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export const getUserPermissions = async (token: string): Promise<UserPermissions | null> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (response.ok && data.valid) {
      return data.permissions;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
};

export const signupUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Signup failed' };
    }

    // Store authentication data
    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      sessionToken: data.sessionToken,
      expiresAt: data.expiresAt,
      message: data.message
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    // Store authentication data
    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      sessionToken: data.sessionToken,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const logoutUser = async (): Promise<void> => {
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  
  if (sessionToken) {
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/auth-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sessionToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  clearAuthData();
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getSessionToken = (): string | null => {
  return localStorage.getItem(SESSION_TOKEN_KEY);
};

const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Admin functions
export const getAllUsers = async (page = 1, limit = 10) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/admin-users?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch users');
  }

  return data;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/admin-users?userId=${userId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update user');
  }

  return data;
};

export const deactivateUser = async (userId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/admin-users?userId=${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to deactivate user');
  }

  return data;
};